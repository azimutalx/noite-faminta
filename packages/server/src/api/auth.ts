import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { RegisterSchema, LoginSchema } from '@noite-faminta/shared';
import { query, withTransaction } from '../db/connection.js';

export type RegisterPayload = z.infer<typeof RegisterSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;

interface AccountRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  tokens_balance: number;
  is_vip: boolean;
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Rota de Cadastro com validação Zod e Transação ACID
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = RegisterSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_FAILED',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { username, email, password }: RegisterPayload = parseResult.data;
    const existing = await query<AccountRecord>(
      'SELECT id FROM accounts WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return reply.status(409).send({
        error: 'ACCOUNT_EXISTS',
        message: 'Nome de usuário ou e-mail já cadastrado.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criação atômica de conta em transação ACID
    const account = await withTransaction(async (client) => {
      const inserted = await client.query<AccountRecord>(
        `INSERT INTO accounts (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, tokens_balance, is_vip`,
        [username, email, passwordHash]
      );
      return inserted.rows[0];
    });

    if (!account) {
      return reply.status(500).send({ error: 'REGISTRATION_FAILED' });
    }

    const token = fastify.jwt.sign({ sub: account.id, username: account.username });

    return reply.status(201).send({
      message: 'Conta criada com sucesso.',
      token,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        tokensBalance: account.tokens_balance,
        isVip: account.is_vip
      }
    });
  });

  // Rota de Login com validação Zod
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = LoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_FAILED',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { email, password }: LoginPayload = parseResult.data;
    const result = await query<AccountRecord>(
      `SELECT id, username, email, password_hash, tokens_balance, is_vip
       FROM accounts WHERE email = $1`,
      [email]
    );

    const account = result.rows[0];
    if (!account) {
      return reply.status(401).send({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciais inválidas.'
      });
    }

    const isValid = await bcrypt.compare(password, account.password_hash);
    if (!isValid) {
      return reply.status(401).send({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciais inválidas.'
      });
    }

    const token = fastify.jwt.sign({ sub: account.id, username: account.username });

    return reply.status(200).send({
      token,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        tokensBalance: account.tokens_balance,
        isVip: account.is_vip
      }
    });
  });
}
