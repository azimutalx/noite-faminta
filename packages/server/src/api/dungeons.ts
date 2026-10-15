import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  DungeonRaidSchema,
  CombatFighter,
  DungeonRaidResult,
  Faction
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import { executeCombatDuel } from '../combat/engine.js';
import { getDungeonBoss, listDungeonBosses } from '../dungeons/bosses.js';
import { extractCarvingLoot } from '../crafting/forgeEngine.js';

export type DungeonRaidPayload = z.infer<typeof DungeonRaidSchema>;

interface DbCharacterDungeonRow {
  id: string;
  account_id: string;
  name: string;
  faction: Faction;
  level: number;
  experience: string | number;
  gold: string | number;
  stamina: number;
  max_stamina: number;
  health: number;
  max_health: number;
  strength: number;
  agility: number;
  vitality: number;
  occultism: number;
}

export async function dungeonRoutes(fastify: FastifyInstance): Promise<void> {
  // 1. Listar Chefes e Masmorras Disponíveis
  fastify.get('/bosses', async (_request: FastifyRequest, reply: FastifyReply) => {
    const bosses = listDungeonBosses();
    return reply.status(200).send({ bosses });
  });

  // 2. Incursão de Masmorra Autoritativa contra Chefe
  fastify.post('/raid', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = DungeonRaidSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { bossId, staminaCost }: DungeonRaidPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    const boss = getDungeonBoss(bossId);
    if (!boss) return reply.status(404).send({ error: 'BOSS_NOT_FOUND' });

    return await withTransaction(async (client) => {
      // Lock transacional no personagem do jogador (Zero-Trust & ACID)
      const charRes = await client.query<DbCharacterDungeonRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const playerChar = charRes.rows[0];
      if (!playerChar) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const requiredStamina = Math.max(staminaCost, boss.staminaCost);
      if (playerChar.stamina < requiredStamina) {
        return reply.status(400).send({ error: 'NOT_ENOUGH_STAMINA' });
      }

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

      const bossFaction: Faction = boss.faction === 'INQUISITION' ? (playerChar.faction === 'VAMPIRE' ? 'LYCAN' : 'VAMPIRE') : boss.faction;
      const bossFighter: CombatFighter = {
        id: boss.id,
        name: `${boss.name} (${boss.title})`,
        faction: bossFaction,
        level: boss.level,
        health: boss.health,
        maxHealth: boss.maxHealth,
        stats: boss.stats,
        gambits: boss.gambits
      };

      const secureRoll = () => crypto.randomInt(0, 10000) / 10000;
      const battleResult = executeCombatDuel(playerFighter, bossFighter, secureRoll);
      const playerWon = battleResult.winnerId === playerChar.id;

      const remainingStamina = playerChar.stamina - requiredStamina;
      let balanceAfter = Number(playerChar.gold);
      let newXp = Number(playerChar.experience);
      const carvedMaterials = playerWon ? extractCarvingLoot(boss, secureRoll) : [];

      if (playerWon) {
        const currentGold = Number(playerChar.gold);
        balanceAfter = currentGold + boss.goldReward;
        newXp += boss.xpReward;

        // Inserir materiais anatômicos extraídos em items
        for (const mat of carvedMaterials) {
          await client.query(
            `INSERT INTO items (
              owner_id, template_id, name, rarity, slot, attributes, is_equipped, is_tradable
            ) VALUES ($1, $2, $3, $4, 'MATERIAL', $5, false, true)`,
            [
              playerChar.id,
              mat.id,
              mat.partName,
              mat.rarity,
              JSON.stringify({ monsterOrigin: boss.name, partName: mat.partName })
            ]
          );
        }

        // Ledger imutável de recompensa da masmorra
        await client.query(
          `INSERT INTO financial_audit_ledger (
            account_id, character_id, operation_type, currency_type,
            amount, balance_before, balance_after, metadata
          ) VALUES ($1, $2, 'DUNGEON_REWARD', 'GOLD', $3, $4, $5, $6)`,
          [
            accountId,
            playerChar.id,
            boss.goldReward,
            currentGold,
            balanceAfter,
            JSON.stringify({ bossId: boss.id, materialsCarved: carvedMaterials.length })
          ]
        );
      }

      await client.query(
        `UPDATE characters
         SET gold = $1, experience = $2, stamina = $3, last_action_at = NOW()
         WHERE id = $4`,
        [balanceAfter, newXp, remainingStamina, playerChar.id]
      );

      const raidResponse: DungeonRaidResult = {
        bossId: boss.id,
        bossName: boss.name,
        battleResult,
        playerWon,
        carvedMaterials,
        goldAwarded: playerWon ? boss.goldReward : 0,
        xpAwarded: playerWon ? boss.xpReward : 0,
        staminaConsumed: requiredStamina
      };

      return reply.status(200).send(raidResponse);
    });
  });
}
