import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateMarketOrderSchema,
  BuyMarketOrderSchema,
  CancelMarketOrderSchema,
  OrderType,
  MarketBuyResult
} from '@noite-faminta/shared';
import { withTransaction } from '../db/connection.js';
import { validateMarketOrderInput, calculateOrderSettlement } from '../market/orderBook.js';
import { addMarketTaxToDividendPool } from '../districts/districtEngine.js';

interface DbCharacterRow {
  id: string;
  account_id: string;
  name: string;
  gold: string | number;
}

interface DbOrderRow {
  id: string;
  seller_id: string;
  item_id: string | null;
  order_type: OrderType;
  price_gold: string | number | null;
  price_tokens: number | null;
  token_amount: number | null;
  status: string;
  created_at: string;
}

export async function marketRoutes(fastify: FastifyInstance): Promise<void> {
  // 1. Listar Ordens Ativas do Mercado Global
  fastify.get('/orders', async (_request: FastifyRequest, reply: FastifyReply) => {
    return await withTransaction(async (client) => {
      const res = await client.query(
        `SELECT mo.id, mo.seller_id, mo.item_id, mo.order_type, mo.price_gold,
                mo.price_tokens, mo.token_amount, mo.status, mo.created_at,
                c.name as seller_name, i.name as item_name, i.rarity as item_rarity,
                i.slot as item_slot, i.attributes as item_attributes
         FROM market_orders mo
         JOIN characters c ON mo.seller_id = c.id
         LEFT JOIN items i ON mo.item_id = i.id
         WHERE mo.status = 'ACTIVE'
         ORDER BY mo.created_at DESC LIMIT 50`
      );
      return reply.status(200).send({ orders: res.rows });
    });
  });

  // 2. Criar Nova Ordem de Venda ou de Tokens
  fastify.post('/orders', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = CreateMarketOrderSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'VALIDATION_FAILED', details: parse.error.flatten().fieldErrors });
    }

    const { orderType, itemId, priceGold, priceTokens, tokenAmount } = parse.data;
    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    const validation = validateMarketOrderInput({ orderType, priceGold, priceTokens, tokenAmount, itemId });
    if (!validation.valid) return reply.status(400).send({ error: validation.error });

    return await withTransaction(async (client) => {
      // Lock transacional no personagem do vendedor
      const charRes = await client.query<DbCharacterRow>(
        'SELECT id, account_id, name, gold FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const seller = charRes.rows[0];
      if (!seller) return reply.status(404).send({ error: 'CHARACTER_NOT_FOUND' });

      if (orderType === 'ITEM_SALE') {
        const itemRes = await client.query(
          'SELECT id, owner_id, is_tradable, is_equipped FROM items WHERE id = $1 FOR UPDATE',
          [itemId]
        );
        const item = itemRes.rows[0];
        if (!item || item.owner_id !== seller.id) return reply.status(400).send({ error: 'ITEM_NOT_OWNED' });
        if (item.is_equipped) return reply.status(400).send({ error: 'ITEM_IS_EQUIPPED' });
        if (!item.is_tradable) return reply.status(400).send({ error: 'ITEM_ALREADY_LOCKED' });

        // Travar item sob custódia do mercado
        await client.query('UPDATE items SET is_tradable = false WHERE id = $1', [itemId]);
      }

      const insertRes = await client.query<{ id: string }>(
        `INSERT INTO market_orders (seller_id, item_id, order_type, price_gold, price_tokens, token_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE') RETURNING id`,
        [seller.id, itemId ?? null, orderType, priceGold ?? null, priceTokens ?? null, tokenAmount ?? null]
      );

      return reply.status(201).send({
        message: 'Ordem criada no Mercado Global com sucesso!',
        orderId: insertRes.rows[0]?.id
      });
    });
  });

  // 3. Execução Atômica de Compra com Pessimistic Locking
  fastify.post('/orders/:id/buy', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parse = BuyMarketOrderSchema.safeParse({ orderId: request.params.id });
    if (!parse.success) return reply.status(400).send({ error: 'INVALID_ORDER_ID' });

    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      // 1. Lock transacional na ordem do mercado
      const orderRes = await client.query<DbOrderRow>(
        'SELECT * FROM market_orders WHERE id = $1 FOR UPDATE',
        [parse.data.orderId]
      );
      const order = orderRes.rows[0];
      if (!order || order.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'ORDER_NOT_AVAILABLE' });
      }

      // 2. Lock transacional no comprador
      const buyerRes = await client.query<DbCharacterRow>(
        'SELECT id, account_id, name, gold FROM characters WHERE account_id = $1 FOR UPDATE',
        [accountId]
      );
      const buyer = buyerRes.rows[0];
      if (!buyer) return reply.status(404).send({ error: 'BUYER_NOT_FOUND' });
      if (buyer.id === order.seller_id) return reply.status(400).send({ error: 'CANNOT_BUY_OWN_ORDER' });

      // 3. Lock transacional no vendedor
      const sellerRes = await client.query<DbCharacterRow>(
        'SELECT id, account_id, name, gold FROM characters WHERE id = $1 FOR UPDATE',
        [order.seller_id]
      );
      const seller = sellerRes.rows[0];
      if (!seller) return reply.status(404).send({ error: 'SELLER_NOT_FOUND' });

      const priceGold = Number(order.price_gold ?? 0);
      const buyerGold = Number(buyer.gold);
      if (buyerGold < priceGold) return reply.status(400).send({ error: 'INSUFFICIENT_GOLD' });

      // Liquidação financeira com taxa de mercado (Gold Sink) e alimentação de dividendos
      const settlement = calculateOrderSettlement(order.order_type, priceGold);
      addMarketTaxToDividendPool(settlement.feeGold);
      const buyerBalanceAfter = buyerGold - priceGold;
      const sellerGold = Number(seller.gold);
      const sellerBalanceAfter = sellerGold + settlement.netGold;

      await client.query('UPDATE characters SET gold = $1 WHERE id = $2', [buyerBalanceAfter, buyer.id]);
      await client.query('UPDATE characters SET gold = $1 WHERE id = $2', [sellerBalanceAfter, seller.id]);

      // Transferência de posse do item se venda de item
      if (order.item_id) {
        await client.query('UPDATE items SET owner_id = $1, is_tradable = true WHERE id = $2', [buyer.id, order.item_id]);
      }

      // Marcar ordem como concluída
      await client.query("UPDATE market_orders SET status = 'COMPLETED' WHERE id = $1", [order.id]);

      // Registrar transações no financial_audit_ledger
      await client.query(
        `INSERT INTO financial_audit_ledger (account_id, character_id, operation_type, currency_type, amount, balance_before, balance_after, related_entity_id, metadata)
         VALUES ($1, $2, 'MARKET_BUY', 'GOLD', $3, $4, $5, $6, $7)`,
        [accountId, buyer.id, priceGold, buyerGold, buyerBalanceAfter, order.id, JSON.stringify({ sellerId: seller.id })]
      );

      await client.query(
        `INSERT INTO financial_audit_ledger (account_id, character_id, operation_type, currency_type, amount, balance_before, balance_after, related_entity_id, metadata)
         VALUES ($1, $2, 'MARKET_SELL', 'GOLD', $3, $4, $5, $6, $7)`,
        [seller.account_id, seller.id, settlement.netGold, sellerGold, sellerBalanceAfter, order.id, JSON.stringify({ buyerId: buyer.id, fee: settlement.feeGold })]
      );

      const result: MarketBuyResult = {
        orderId: order.id,
        orderType: order.order_type,
        buyerId: buyer.id,
        sellerId: seller.id,
        priceGold,
        feeGold: settlement.feeGold,
        transferredItemId: order.item_id ?? undefined
      };

      return reply.status(200).send({ message: 'Compra executada com sucesso!', result });
    });
  });

  // 4. Cancelar Ordem e Devolver Custódia
  fastify.post('/orders/:id/cancel', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const parse = CancelMarketOrderSchema.safeParse({ orderId: request.params.id });
    if (!parse.success) return reply.status(400).send({ error: 'INVALID_ORDER_ID' });

    const accountId = (request as FastifyRequest & { user?: { sub: string } }).user?.sub;
    if (!accountId) return reply.status(401).send({ error: 'UNAUTHORIZED' });

    return await withTransaction(async (client) => {
      const orderRes = await client.query<DbOrderRow>(
        'SELECT * FROM market_orders WHERE id = $1 FOR UPDATE',
        [parse.data.orderId]
      );
      const order = orderRes.rows[0];
      if (!order || order.status !== 'ACTIVE') return reply.status(400).send({ error: 'ORDER_NOT_ACTIVE' });

      const charRes = await client.query('SELECT id FROM characters WHERE account_id = $1', [accountId]);
      const character = charRes.rows[0];
      if (!character || character.id !== order.seller_id) return reply.status(403).send({ error: 'FORBIDDEN' });

      // Restaurar item
      if (order.item_id) {
        await client.query('UPDATE items SET is_tradable = true WHERE id = $1', [order.item_id]);
      }

      await client.query("UPDATE market_orders SET status = 'CANCELLED' WHERE id = $1", [order.id]);
      return reply.status(200).send({ message: 'Ordem cancelada e custódia restaurada!' });
    });
  });
}
