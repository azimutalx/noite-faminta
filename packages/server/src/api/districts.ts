import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ContestDistrictSchema, ClaimDividendsSchema, Faction } from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import {
  getAllDistricts,
  executeDistrictContest,
  claimFinancialDividends
} from '../districts/districtEngine.js';

interface DbCharacterRow {
  id: string;
  name: string;
  faction: Faction;
  gold: string | number;
  stamina: number;
}

export const districtRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Obter status público de todos os distritos da metrópole
  app.get('/status', async (_req, reply) => {
    const districts = getAllDistricts();
    return reply.send({ success: true, districts });
  });

  // Disputar controle territorial e investir infâmia em um distrito
  app.post('/contest', async (req, reply) => {
    const parse = ContestDistrictSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Payload de disputa inválido', details: parse.error.issues });
    }

    const { districtId, goldInvestment, staminaCost } = parse.data;
    const accountId = (req.user as { accountId?: string })?.accountId;
    if (!accountId) {
      return reply.status(401).send({ error: 'Autenticação necessária' });
    }

    return withTransaction(async (client) => {
      // Zero-Trust & ACID: Lock pessimista no personagem com SELECT ... FOR UPDATE
      const charRes = await client.query<DbCharacterRow>(
        'SELECT id, name, faction, gold, stamina FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) {
        return reply.status(404).send({ error: 'Personagem não encontrado' });
      }
      const currentGold = Number(character.gold);
      if (currentGold < goldInvestment) {
        return reply.status(400).send({ error: 'Ouro insuficiente para investir na disputa' });
      }
      if (character.stamina < staminaCost) {
        return reply.status(400).send({ error: 'Stamina insuficiente para disputar o distrito' });
      }

      const contestResult = executeDistrictContest(
        districtId,
        character.faction,
        goldInvestment,
        staminaCost
      );

      const updatedGold = currentGold - goldInvestment;
      const updatedStamina = character.stamina - staminaCost;

      await client.query(
        'UPDATE characters SET gold = $1, stamina = $2 WHERE id = $3',
        [updatedGold, updatedStamina, character.id]
      );

      if (goldInvestment > 0) {
        await client.query(
          `INSERT INTO financial_audit_ledger 
           (account_id, character_id, operation_type, currency_type, amount, balance_before, balance_after, metadata)
           VALUES ($1, $2, 'DISTRICT_CONTEST_INVEST', 'GOLD', $3, $4, $5, $6)`,
          [
            accountId,
            character.id,
            -goldInvestment,
            currentGold,
            updatedGold,
            JSON.stringify({ districtId, infamyGained: contestResult.infamyGained })
          ]
        );
      }

      return reply.send({
        success: true,
        contestResult,
        updatedGold,
        updatedStamina
      });
    });
  });

  // Reivindicar dividendos do Mercado Global (Centro Financeiro)
  app.post('/claim-dividends', async (req, reply) => {
    const parse = ClaimDividendsSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Payload de dividendos inválido', details: parse.error.issues });
    }

    const { districtId } = parse.data;
    const accountId = (req.user as { accountId?: string })?.accountId;
    if (!accountId) {
      return reply.status(401).send({ error: 'Autenticação necessária' });
    }

    return withTransaction(async (client) => {
      // Zero-Trust & ACID: Lock pessimista no personagem com SELECT ... FOR UPDATE
      const charRes = await client.query<DbCharacterRow>(
        'SELECT id, name, faction, gold, stamina FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const character = charRes.rows[0];
      if (!character) {
        return reply.status(404).send({ error: 'Personagem não encontrado' });
      }

      const dividendResult = claimFinancialDividends(character.faction, districtId);

      if (!dividendResult.success || dividendResult.goldClaimed <= 0) {
        return reply.status(400).send({ error: dividendResult.message });
      }

      const currentGold = Number(character.gold);
      const updatedGold = currentGold + dividendResult.goldClaimed;

      await client.query(
        'UPDATE characters SET gold = $1 WHERE id = $2',
        [updatedGold, character.id]
      );

      await client.query(
        `INSERT INTO financial_audit_ledger 
         (account_id, character_id, operation_type, currency_type, amount, balance_before, balance_after, metadata)
         VALUES ($1, $2, 'DISTRICT_DIVIDEND_CLAIM', 'GOLD', $3, $4, $5, $6)`,
        [
          accountId,
          character.id,
          dividendResult.goldClaimed,
          currentGold,
          updatedGold,
          JSON.stringify({ districtId, remainingPool: dividendResult.remainingPool })
        ]
      );

      return reply.send({
        success: true,
        dividendResult,
        updatedGold
      });
    });
  });
};
