import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './api/auth.js';
import { characterRoutes } from './api/character.js';
import { huntingRoutes } from './api/hunting.js';
import { combatRoutes } from './api/combat.js';
import { dungeonRoutes } from './api/dungeons.js';
import { craftingRoutes } from './api/crafting.js';
import { marketRoutes } from './api/market.js';
import { nemesisRoutes } from './api/nemesis.js';
import { districtRoutes } from './api/districts.js';
import { mercenaryRoutes } from './api/mercenaries.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname
          };
        }
      }
    }
  });

  // 1. Plugins de Segurança
  app.register(cors, {
    origin: true,
    credentials: true
  });

  const jwtSecret = process.env['JWT_SECRET'] ?? 'chave_secreta_local_dev_sangue_e_prata_2026';
  app.register(jwt, {
    secret: jwtSecret
  });

  // 2. Endpoints de Observabilidade e Saúde do Sistema
  app.get('/health', async () => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'noite-faminta-server',
      version: '1.0.0'
    };
  });

  app.get('/metrics', async () => {
    const memory = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      rssMb: Math.round(memory.rss / 1024 / 1024)
    };
  });

  // 3. Decorator de Autenticação JWT com tipagem estrita
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado.' });
    }
  });

  // 4. Registro de Rotas de API
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(characterRoutes, { prefix: '/api/characters' });
  app.register(huntingRoutes, { prefix: '/api/hunting' });
  app.register(combatRoutes, { prefix: '/api/combat' });
  app.register(dungeonRoutes, { prefix: '/api/dungeons' });
  app.register(craftingRoutes, { prefix: '/api/crafting' });
  app.register(marketRoutes, { prefix: '/api/market' });
  app.register(nemesisRoutes, { prefix: '/api/nemesis' });
  app.register(districtRoutes, { prefix: '/api/districts' });
  app.register(mercenaryRoutes, { prefix: '/api/mercenaries' });

  return app;
}
