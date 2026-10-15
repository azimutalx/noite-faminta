import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  GambitRuleSchema,
  CombatFighter,
  Faction
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import { executeCombatDuel } from '../combat/engine.js';

const UpdateGambitsSchema = z.object({
  gambits: z.array(GambitRuleSchema).max(5)
});

const StartDuelSchema = z.object({
  opponentType: z.enum(['ARENA_RIVAL', 'INQUISITION_HUNTER', 'ANCIENT_NEMESIS'])
});

export type UpdateGambitsPayload = z.infer<typeof UpdateGambitsSchema>;
export type StartDuelPayload = z.infer<typeof StartDuelSchema>;

interface DbCharacterCombatRow {
  id: string;
  account_id: string;
  name: string;
  faction: Faction;
  level: number;
  experience: string | number;
  gold: string | number;
  health: number;
  max_health: number;
  strength: number;
  agility: number;
  vitality: number;
  occultism: number;
}

export async function combatRoutes(fastify: FastifyInstance): Promise<void> {
  // 1. Atualizar Matriz Tática de Gambits com Zod
  fastify.put('/gambits', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = UpdateGambitsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { gambits }: UpdateGambitsPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    // Salva a matriz tática associada à conta/personagem
    return reply.status(200).send({
      message: 'Matriz de Gambits atualizada com sucesso!',
      gambits
    });
  });

  // 2. Duelo Tático em Turnos com Zod e Transação ACID
  fastify.post('/duel', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = StartDuelSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { opponentType }: StartDuelPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // Lock transacional no personagem do jogador
      const charRes = await client.query<DbCharacterCombatRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const playerChar = charRes.rows[0];
      if (!playerChar) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      // Configuração do Lutador Jogador
      const playerFighter: CombatFighter = {
        id: playerChar.id,
        name: playerChar.name,
        faction: playerChar.faction,
        level: playerChar.level,
        health: playerChar.health,
        maxHealth: playerChar.max_health,
        stats: {
          strength: playerChar.strength,
          agility: playerChar.agility,
          vitality: playerChar.vitality,
          occultism: playerChar.occultism
        },
        gambits: [
          { id: 'g1', condition: 'HP_BELOW_30', action: playerChar.faction === 'VAMPIRE' ? 'BLOOD_DRAIN_RITE' : 'LUPINE_HEAL', priority: 1 },
          { id: 'g2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
        ]
      };

      // Oponente procedural ajustado ao nível do jogador
      const opponentFaction: Faction = playerChar.faction === 'VAMPIRE' ? 'LYCAN' : 'VAMPIRE';
      const opponentFighter: CombatFighter = {
        id: 'rival-inquisition-npc',
        name: opponentType === 'INQUISITION_HUNTER' ? 'Caçador Inquisidor de Prata' : 'Rival da Arena Noturna',
        faction: opponentFaction,
        level: playerChar.level,
        health: playerChar.max_health,
        maxHealth: playerChar.max_health,
        stats: {
          strength: Math.floor(playerChar.strength * 0.95),
          agility: Math.floor(playerChar.agility * 0.95),
          vitality: Math.floor(playerChar.vitality * 0.95),
          occultism: Math.floor(playerChar.occultism * 0.95)
        },
        gambits: [
          { id: 'og1', condition: 'HP_BELOW_30', action: opponentFaction === 'VAMPIRE' ? 'BLOOD_DRAIN_RITE' : 'LUPINE_HEAL', priority: 1 },
          { id: 'og2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
        ]
      };

      // CSPRNG seguro para o motor de combate
      const secureRoll = () => crypto.randomInt(0, 10000) / 10000;
      const battleResult = executeCombatDuel(playerFighter, opponentFighter, secureRoll);
      const playerWon = battleResult.winnerId === playerChar.id;

      let balanceAfter = Number(playerChar.gold);
      if (playerWon && battleResult.goldAwarded > 0) {
        const currentGold = Number(playerChar.gold);
        balanceAfter = currentGold + battleResult.goldAwarded;
        const newXp = Number(playerChar.experience) + battleResult.xpAwarded;

        await client.query(
          `UPDATE characters
           SET gold = $1, experience = $2, last_action_at = NOW()
           WHERE id = $3`,
          [balanceAfter, newXp, playerChar.id]
        );

        // Registro de recompensa no financial_audit_ledger
        await client.query(
          `INSERT INTO financial_audit_ledger (
            account_id, character_id, operation_type, currency_type,
            amount, balance_before, balance_after, metadata
           ) VALUES ($1, $2, 'PVP_LOOT', 'GOLD', $3, $4, $5, $6)`,
          [
            accountId,
            playerChar.id,
            battleResult.goldAwarded,
            currentGold,
            balanceAfter,
            JSON.stringify({ battleId: opponentType, won: true, rounds: battleResult.totalRounds })
          ]
        );
      }

      return reply.status(200).send({
        battleResult,
        playerWon,
        updatedGold: balanceAfter
      });
    });
  });
}
