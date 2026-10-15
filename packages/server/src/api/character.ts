import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  CreateCharacterSchema,
  TrainStatSchema,
  calculateStatTrainingCost,
  calculateMaxHealth,
  calculateMaxStamina,
  calculateVaultLimit,
  calculateHideoutUpgradeCost,
  getHideoutStage,
  CharacterProfile,
  Faction,
  Specialization
} from '@noite-faminta/shared';
import { query, withTransaction } from '../db/connection.js';

export type CreateCharacterPayload = z.infer<typeof CreateCharacterSchema>;
export type TrainStatPayload = z.infer<typeof TrainStatSchema>;

type CharacterStatName = 'strength' | 'agility' | 'vitality' | 'occultism';

interface CharacterRow {
  id: string;
  account_id: string;
  name: string;
  faction: Faction;
  specialization: Specialization;
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
  evolution_points: number;
  masquerade_alert: number;
  hideout_level: number;
  vault_gold: string | number;
  vault_gold_limit: string | number;
}

function mapCharacterRow(row: CharacterRow): CharacterProfile {
  return {
    id: row.id,
    name: row.name,
    faction: row.faction,
    specialization: row.specialization,
    level: row.level,
    experience: Number(row.experience),
    experienceToNextLevel: 100 * Math.pow(row.level, 1.85),
    gold: Number(row.gold),
    tokens: 0,
    stamina: row.stamina,
    maxStamina: row.max_stamina,
    health: row.health,
    maxHealth: row.max_health,
    stats: {
      strength: row.strength,
      agility: row.agility,
      vitality: row.vitality,
      occultism: row.occultism
    },
    evolutionPoints: row.evolution_points,
    masqueradeAlert: row.masquerade_alert,
    hideoutLevel: row.hideout_level,
    vaultGold: Number(row.vault_gold),
    vaultGoldLimit: Number(row.vault_gold_limit)
  };
}

export async function characterRoutes(fastify: FastifyInstance): Promise<void> {
  // Criar Personagem Autoritativo com Zod
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = CreateCharacterSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { name, faction, specialization }: CreateCharacterPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' });
    }

    const existing = await query('SELECT id FROM characters WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return reply.status(409).send({ error: 'NAME_TAKEN', message: 'Este nome já está em uso.' });
    }

    const initialHealth = calculateMaxHealth(10, 1);
    const initialStamina = calculateMaxStamina(1);
    const initialVault = calculateVaultLimit(1);

    const result = await query<CharacterRow>(
      `INSERT INTO characters (
        account_id, name, faction, specialization, health, max_health,
        stamina, max_stamina, vault_gold_limit
       ) VALUES ($1, $2, $3, $4, $5, $5, $6, $6, $7)
       RETURNING *`,
      [accountId, name, faction, specialization, initialHealth, initialStamina, initialVault]
    );

    const created = result.rows[0];
    if (!created) {
      return reply.status(500).send({ error: 'CREATION_FAILED' });
    }

    return reply.status(201).send({ character: mapCharacterRow(created) });
  });

  // Treinar Atributos no Refúgio com Lock Transacional ACID e Auditoria
  fastify.post('/train', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = TrainStatSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { stat, points }: TrainStatPayload = parse.data;
    const statKey = stat as CharacterStatName;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // 1. Lock pessimista FOR UPDATE no personagem
      const charRes = await client.query<CharacterRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const currentVal = character[statKey];
      const { goldCost, totalPointsAfterTraining } = calculateStatTrainingCost(currentVal, points);
      const currentGold = Number(character.gold);

      if (currentGold < goldCost) {
        return reply.status(400).send({
          error: 'INSUFFICIENT_GOLD',
          message: `Gold insuficiente. Necessário: ${goldCost}, Atual: ${currentGold}`
        });
      }

      const balanceAfter = currentGold - goldCost;

      // 2. Atualiza atributo e debita saldo
      const updateRes = await client.query<CharacterRow>(
        `UPDATE characters
         SET ${statKey} = $1, gold = $2, last_action_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [totalPointsAfterTraining, balanceAfter, character.id]
      );

      // 3. Registo obrigatório no financial_audit_ledger
      await client.query(
        `INSERT INTO financial_audit_ledger (
          account_id, character_id, operation_type, currency_type,
          amount, balance_before, balance_after, metadata
         ) VALUES ($1, $2, 'STAT_TRAIN', 'GOLD', $3, $4, $5, $6)`,
        [
          accountId,
          character.id,
          goldCost,
          currentGold,
          balanceAfter,
          JSON.stringify({ statTrained: stat, pointsAdded: points })
        ]
      );

      const updated = updateRes.rows[0];
      if (!updated) return reply.status(500).send({ error: 'UPDATE_FAILED' });
      return reply.status(200).send({
        message: 'Atributo aprimorado com sucesso!',
        character: mapCharacterRow(updated)
      });
    });
  });

  // Evoluir Nível do Refúgio com Lock Transacional ACID e Auditoria
  fastify.post('/hideout/upgrade', async (request: FastifyRequest, reply: FastifyReply) => {
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // 1. Lock pessimista FOR UPDATE no personagem
      const charRes = await client.query<CharacterRow>(
        'SELECT * FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const currentLevel = character.hideout_level;
      const upgradeCost = calculateHideoutUpgradeCost(currentLevel);
      const currentGold = Number(character.gold);

      if (currentGold < upgradeCost) {
        return reply.status(400).send({
          error: 'INSUFFICIENT_GOLD',
          message: `Ouro insuficiente para evoluir o refúgio. Necessário: ${upgradeCost}, Atual: ${currentGold}`
        });
      }

      const nextLevel = currentLevel + 1;
      const newMaxStamina = calculateMaxStamina(nextLevel);
      const newVaultLimit = calculateVaultLimit(nextLevel);
      const balanceAfter = currentGold - upgradeCost;

      // 2. Atualiza hideout_level, stamina máxima, vault_gold_limit e debita saldo
      const updateRes = await client.query<CharacterRow>(
        `UPDATE characters
         SET hideout_level = $1, max_stamina = $2, vault_gold_limit = $3, gold = $4, last_action_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [nextLevel, newMaxStamina, newVaultLimit, balanceAfter, character.id]
      );

      // 3. Registo obrigatório no financial_audit_ledger
      await client.query(
        `INSERT INTO financial_audit_ledger (
          account_id, character_id, operation_type, currency_type,
          amount, balance_before, balance_after, metadata
         ) VALUES ($1, $2, 'HIDEOUT_UPGRADE', 'GOLD', $3, $4, $5, $6)`,
        [
          accountId,
          character.id,
          upgradeCost,
          currentGold,
          balanceAfter,
          JSON.stringify({ previousLevel: currentLevel, nextLevel })
        ]
      );

      const updated = updateRes.rows[0];
      if (!updated) return reply.status(500).send({ error: 'UPDATE_FAILED' });
      return reply.status(200).send({
        message: 'Refúgio evoluído com sucesso!',
        character: mapCharacterRow(updated),
        stage: getHideoutStage(nextLevel)
      });
    });
  });
}

