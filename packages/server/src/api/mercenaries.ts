import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  RentMercenarySchema,
  RegisterMercenarySchema,
  Faction,
  Specialization,
  calculateMercenaryCombatPower
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import {
  listAvailableMercenaries,
  getMercenaryById,
  calculateRentalSettlement,
  registerPlayerMercenary,
  markMercenaryHired
} from '../mercenaries/mercenaryGuild.js';

interface DbCharacterRow {
  id: string;
  account_id: string;
  name: string;
  faction: Faction;
  specialization: Specialization;
  level: number;
  gold: string | number;
  vault_gold: string | number;
  strength: number;
  agility: number;
  vitality: number;
  occultism: number;
}

export const mercenaryRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Listar mercenários disponíveis na Taverna dos Renegados
  app.get('/list', async (_req, reply) => {
    const mercenaries = listAvailableMercenaries();
    return reply.send({ success: true, mercenaries });
  });

  // Disponibilizar personagem para aluguel na Taverna enquanto offline
  app.post('/register', async (req, reply) => {
    const parse = RegisterMercenarySchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Parâmetros inválidos', details: parse.error.issues });
    }

    const accountId = (req.user as { accountId?: string })?.accountId;
    if (!accountId) {
      return reply.status(401).send({ error: 'Autenticação necessária' });
    }

    return withTransaction(async (client) => {
      // Zero-Trust & ACID: Lock pessimista no personagem com SELECT ... FOR UPDATE
      const charRes = await client.query<DbCharacterRow>(
        'SELECT id, name, faction, specialization, level, strength, agility, vitality, occultism FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) {
        return reply.status(404).send({ error: 'Personagem não encontrado' });
      }

      const combatPower = calculateMercenaryCombatPower(character);
      const contract = registerPlayerMercenary(
        character.id,
        character.name,
        `${character.name} [Mercenário Renegado]`,
        character.faction,
        character.level,
        character.specialization,
        combatPower,
        parse.data.rentalPriceGold
      );

      return reply.send({
        success: true,
        message: 'Seu personagem foi alugado na Taverna! Comissões serão creditadas no seu baú.',
        contract
      });
    });
  });

  // Contratar mercenário para formação de grupo em masmorras
  app.post('/hire', async (req, reply) => {
    const parse = RentMercenarySchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'ID de mercenário inválido', details: parse.error.issues });
    }

    const { mercenaryId } = parse.data;
    const accountId = (req.user as { accountId?: string })?.accountId;
    if (!accountId) {
      return reply.status(401).send({ error: 'Autenticação necessária' });
    }

    const mercenary = getMercenaryById(mercenaryId);
    if (!mercenary || !mercenary.isAvailable) {
      return reply.status(400).send({ error: 'Mercenário indisponível ou já contratado.' });
    }

    return withTransaction(async (client) => {
      // Zero-Trust & ACID: Lock pessimista no comprador
      const buyerRes = await client.query<DbCharacterRow>(
        'SELECT id, name, gold FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const buyer = buyerRes.rows[0];
      if (!buyer) return reply.status(404).send({ error: 'Personagem não encontrado' });

      if (mercenary.ownerId === buyer.id) {
        return reply.status(400).send({ error: 'Você não pode contratar o seu próprio personagem.' });
      }

      const currentGold = Number(buyer.gold);
      if (currentGold < mercenary.rentalPriceGold) {
        return reply.status(400).send({ error: 'Ouro insuficiente para contratar este mercenário.' });
      }

      const settlement = calculateRentalSettlement(mercenary.rentalPriceGold);
      const updatedGold = currentGold - settlement.totalPriceGold;

      // 1. Deduzir ouro do comprador
      await client.query('UPDATE characters SET gold = $1 WHERE id = $2', [updatedGold, buyer.id]);

      // 2. Creditar comissão diretamente no baú do refúgio do dono (se jogador persistido)
      await client.query(
        'UPDATE characters SET vault_gold = vault_gold + $1 WHERE id = $2',
        [settlement.ownerCommissionGold, mercenary.ownerId]
      );

      // 3. Registrar auditoria financeira no ledger
      await client.query(
        `INSERT INTO financial_audit_ledger 
         (account_id, character_id, operation_type, currency_type, amount, balance_before, balance_after, related_entity_id, metadata)
         VALUES ($1, $2, 'MERCENARY_HIRE_PAY', 'GOLD', $3, $4, $5, $6, $7)`,
        [
          accountId,
          buyer.id,
          -settlement.totalPriceGold,
          currentGold,
          updatedGold,
          mercenary.id,
          JSON.stringify({ mercenaryName: mercenary.mercenaryName, guildFee: settlement.guildFeeGold })
        ]
      );

      markMercenaryHired(mercenary.id);

      return reply.send({
        success: true,
        message: `${mercenary.mercenaryName} juntou-se ao seu grupo para as Masmorras!`,
        mercenary,
        updatedGold
      });
    });
  });
};
