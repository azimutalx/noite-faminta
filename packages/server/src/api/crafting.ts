import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  ForgeItemSchema,
  ForgeResult,
  GameItem
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import { FORGE_RECIPES, executeAncestralForge } from '../crafting/forgeEngine.js';

export type ForgeItemPayload = z.infer<typeof ForgeItemSchema>;

interface DbCharacterCraftRow {
  id: string;
  account_id: string;
  gold: string | number;
}

interface DbMaterialItemRow {
  id: string;
  template_id: string;
  name: string;
  owner_id: string;
  slot: string;
}

export async function craftingRoutes(fastify: FastifyInstance): Promise<void> {
  // 1. Listar Receitas de Forja Ancestral
  fastify.get('/recipes', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ recipes: Object.values(FORGE_RECIPES) });
  });

  // 2. Listar Materiais Anatômicos do Jogador
  fastify.get('/materials', async (request: FastifyRequest, reply: FastifyReply) => {
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      const charRes = await client.query('SELECT id FROM characters WHERE account_id = $1', [accountId]);
      const character = charRes.rows[0];
      if (!character) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const matRes = await client.query<DbMaterialItemRow>(
        "SELECT id, template_id, name, slot FROM items WHERE owner_id = $1 AND slot = 'MATERIAL'",
        [character.id]
      );
      return reply.status(200).send({ materials: matRes.rows });
    });
  });

  // 3. Forjar Equipamento Ancestral com Afixos Procedurais e Transação ACID
  fastify.post('/forge', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = ForgeItemSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { recipeId, materialItemIds }: ForgeItemPayload = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    const recipe = FORGE_RECIPES[recipeId];
    if (!recipe) return reply.status(404).send({ error: 'RECIPE_NOT_FOUND' });

    return await withTransaction(async (client) => {
      // Lock transacional no saldo do personagem
      const charRes = await client.query<DbCharacterCraftRow>(
        'SELECT id, account_id, gold FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const playerChar = charRes.rows[0];
      if (!playerChar) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      const currentGold = Number(playerChar.gold);
      if (currentGold < recipe.goldCost) {
        return reply.status(400).send({ error: 'INSUFFICIENT_GOLD_FOR_FORGE' });
      }

      // Validar posse dos materiais anatômicos requeridos
      const matRes = await client.query<DbMaterialItemRow>(
        `SELECT id, template_id, name, owner_id, slot
         FROM items
         WHERE id = ANY($1::uuid[]) AND owner_id = $2 AND slot = 'MATERIAL'`,
        [materialItemIds, playerChar.id]
      );

      if (matRes.rows.length < recipe.requiredMaterials.length) {
        return reply.status(400).send({ error: 'MISSING_REQUIRED_MATERIALS' });
      }

      // Consumir materiais do inventário
      await client.query('DELETE FROM items WHERE id = ANY($1::uuid[])', [materialItemIds]);

      // Sorteio autoritativo de afixos procedurais com CSPRNG seguro
      const secureRoll = () => crypto.randomInt(0, 10000) / 10000;
      const forgedItem: GameItem = executeAncestralForge(recipe, secureRoll);

      // Inserir item forjado no banco
      await client.query(
        `INSERT INTO items (
          id, owner_id, template_id, name, rarity, slot, attributes, is_equipped, is_tradable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, true)`,
        [
          forgedItem.id,
          playerChar.id,
          forgedItem.templateId,
          forgedItem.name,
          forgedItem.rarity,
          forgedItem.slot,
          JSON.stringify({
            affixes: forgedItem.affixes,
            baseStats: forgedItem.baseStats,
            levelRequirement: forgedItem.levelRequirement
          })
        ]
      );

      // Atualizar saldo de ouro e registrar ledger imutável
      const balanceAfter = currentGold - recipe.goldCost;
      await client.query('UPDATE characters SET gold = $1 WHERE id = $2', [balanceAfter, playerChar.id]);

      await client.query(
        `INSERT INTO financial_audit_ledger (
          account_id, character_id, operation_type, currency_type,
          amount, balance_before, balance_after, related_entity_id, metadata
        ) VALUES ($1, $2, 'FORGE_FEE', 'GOLD', $3, $4, $5, $6, $7)`,
        [
          accountId,
          playerChar.id,
          recipe.goldCost,
          currentGold,
          balanceAfter,
          forgedItem.id,
          JSON.stringify({ recipeId: recipe.id, forgedItemName: forgedItem.name })
        ]
      );

      const response: ForgeResult = {
        forgedItem,
        goldSpent: recipe.goldCost,
        materialsConsumed: materialItemIds
      };

      return reply.status(200).send(response);
    });
  });
}
