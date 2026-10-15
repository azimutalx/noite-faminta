import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  StartHuntSchema,
  calculateHuntingPower,
  resolveHunt,
  HuntTargetType,
  getPhysicalCondition,
  canPerformAction
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';

export type StartHuntPayload = z.infer<typeof StartHuntSchema>;

interface HuntCharacterRow {
  id: string;
  account_id: string;
  level: number;
  experience: string | number;
  gold: string | number;
  stamina: number;
  health: number;
  max_health: number;
  strength: number;
  agility: number;
  vitality: number;
  occultism: number;
  masquerade_alert: number;
}

export async function huntingRoutes(fastify: FastifyInstance): Promise<void> {
  // Execução autoritativa da Caçada Humana com Zod e Transação ACID
  fastify.post('/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = StartHuntSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { targetType, staminaCost }: StartHuntPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // 1. Lock pessimista FOR UPDATE no personagem
      const charRes = await client.query<HuntCharacterRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      // Validação estrita de fadiga e torpor com base no Tagmar
      const actionCheck = canPerformAction(character.stamina, character.health, staminaCost);
      if (!actionCheck.allowed) {
        return reply.status(400).send({
          error: character.health <= 0 ? 'TORPOR' : 'INSUFFICIENT_STAMINA',
          message: actionCheck.reason
        });
      }

      // 2. Cálculo puro com PRNG criptográfico do servidor
      const playerPower = calculateHuntingPower(
        {
          strength: character.strength,
          agility: character.agility,
          vitality: character.vitality,
          occultism: character.occultism
        },
        character.level
      );

      const condition = getPhysicalCondition(character.stamina, 100, character.health);
      const rollFactor = crypto.randomInt(0, 10000) / 10000;
      const outcome = resolveHunt(playerPower, targetType as HuntTargetType, staminaCost, rollFactor, 0, condition);

      const currentGold = Number(character.gold);
      const balanceAfter = currentGold + outcome.goldEarned;
      const currentXp = Number(character.experience);
      const newXp = currentXp + outcome.xpEarned;
      const newStamina = Math.max(0, character.stamina - staminaCost);
      const newHealth = Math.max(0, character.health - outcome.damageTaken);
      const newAlert = Math.min(100, character.masquerade_alert + outcome.alertIncrease);

      // 3. Atualiza estado do personagem
      await client.query(
        `UPDATE characters
         SET gold = $1, experience = $2, stamina = $3, health = $4,
             masquerade_alert = $5, last_action_at = NOW()
         WHERE id = $6`,
        [balanceAfter, newXp, newStamina, newHealth, newAlert, character.id]
      );

      // 4. Registo de auditoria imutável se houver movimentação de ouro
      if (outcome.goldEarned > 0) {
        await client.query(
          `INSERT INTO financial_audit_ledger (
            account_id, character_id, operation_type, currency_type,
            amount, balance_before, balance_after, metadata
           ) VALUES ($1, $2, 'HUNT_DROP', 'GOLD', $3, $4, $5, $6)`,
          [
            accountId,
            character.id,
            outcome.goldEarned,
            currentGold,
            balanceAfter,
            JSON.stringify({ targetType, playerPower, rollFactor })
          ]
        );
      }

      return reply.status(200).send({
        outcome,
        updatedStatus: {
          gold: balanceAfter,
          experience: newXp,
          stamina: newStamina,
          health: newHealth,
          masqueradeAlert: newAlert
        }
      });
    });
  });
}
