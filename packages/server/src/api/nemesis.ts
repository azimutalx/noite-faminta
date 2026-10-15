import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import {
  CombatFighter,
  Faction,
  NemesisPurgeResult,
  InquisitionNemesis
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import { executeCombatDuel } from '../combat/engine.js';
import { generateProceduralNemesis } from '../nemesis/nemesisGenerator.js';

interface DbCharacterNemesisRow {
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
  masquerade_alert: number;
}

export async function nemesisRoutes(fastify: FastifyInstance): Promise<void> {
  // 1. Obter Status do Nêmesis Ativo do Jogador
  fastify.get('/current', async (request: FastifyRequest, reply: FastifyReply) => {
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      const charRes = await client.query<DbCharacterNemesisRow>(
        'SELECT * FROM characters WHERE account_id = $1',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const isAlertHigh = character.masquerade_alert >= 70;
      const nemesis: InquisitionNemesis | null = isAlertHigh
        ? generateProceduralNemesis(character.level, 0)
        : null;

      return reply.status(200).send({
        masqueradeAlert: character.masquerade_alert,
        activeNemesis: nemesis
      });
    });
  });

  // 2. Duelo de Purga contra o Caçador Nêmesis (ACID & Zero-Trust)
  fastify.post('/purge', async (request: FastifyRequest, reply: FastifyReply) => {
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // Lock transacional no personagem do jogador (FOR UPDATE / transaction)
      const charRes = await client.query<DbCharacterNemesisRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const nemesis = generateProceduralNemesis(character.level, 0);

      const playerFighter: CombatFighter = {
        id: character.id,
        name: character.name,
        faction: character.faction,
        level: character.level,
        health: character.health,
        maxHealth: character.max_health,
        stats: {
          strength: character.strength,
          agility: character.agility,
          vitality: character.vitality,
          occultism: character.occultism
        },
        gambits: [
          { id: 'p1', condition: 'HP_BELOW_30', action: character.faction === 'VAMPIRE' ? 'BLOOD_DRAIN_RITE' : 'LUPINE_HEAL', priority: 1 },
          { id: 'p2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
        ]
      };

      const nemesisFighter: CombatFighter = {
        id: nemesis.id,
        name: `${nemesis.name} (${nemesis.title})`,
        faction: character.faction === 'VAMPIRE' ? 'LYCAN' : 'VAMPIRE',
        level: nemesis.rankLevel,
        health: nemesis.health,
        maxHealth: nemesis.maxHealth,
        stats: nemesis.stats,
        gambits: nemesis.gambits
      };

      const secureRoll = () => crypto.randomInt(0, 10000) / 10000;
      const battleResult = executeCombatDuel(playerFighter, nemesisFighter, secureRoll);
      const playerWon = battleResult.winnerId === character.id;

      let balanceAfter = Number(character.gold);
      let newXp = Number(character.experience);
      let newAlert = character.masquerade_alert;
      const relicName = 'Relíquia da Ordem da Prata Sagrada';

      if (playerWon) {
        const rewardGold = 350;
        const rewardXp = 600;
        const currentGold = Number(character.gold);
        balanceAfter = currentGold + rewardGold;
        newXp += rewardXp;
        newAlert = 0; // Zera o alerta da Máscara

        // Inserir relíquia sagrada em items
        await client.query(
          `INSERT INTO items (
            owner_id, template_id, name, rarity, slot, attributes, is_equipped, is_tradable
          ) VALUES ($1, 'relic-inquisition-seal', $2, 'EPIC', 'AMULET', $3, false, true)`,
          [
            character.id,
            relicName,
            JSON.stringify({
              slainNemesis: nemesis.name,
              title: nemesis.title,
              statsBonus: { occultism: 15, vitality: 12 }
            })
          ]
        );

        // Registro de recompensa no financial_audit_ledger
        await client.query(
          `INSERT INTO financial_audit_ledger (
            account_id, character_id, operation_type, currency_type,
            amount, balance_before, balance_after, metadata
          ) VALUES ($1, $2, 'NEMESIS_SLAY', 'GOLD', $3, $4, $5, $6)`,
          [accountId, character.id, rewardGold, currentGold, balanceAfter, JSON.stringify({ nemesisName: nemesis.name })]
        );
      }

      await client.query(
        `UPDATE characters
         SET gold = $1, experience = $2, masquerade_alert = $3, last_action_at = NOW()
         WHERE id = $4`,
        [balanceAfter, newXp, newAlert, character.id]
      );

      const purgeResponse: NemesisPurgeResult = {
        nemesis,
        battleResult,
        playerWon,
        alertCleared: playerWon,
        holyRelicName: playerWon ? relicName : undefined,
        goldAwarded: playerWon ? 350 : 0,
        xpAwarded: playerWon ? 600 : 0
      };

      return reply.status(200).send(purgeResponse);
    });
  });
}
