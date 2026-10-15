import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  validateMarketOrderInput,
  calculateOrderSettlement
} from '../src/market/orderBook.js';

interface MarketOrderState {
  id: string;
  sellerId: string;
  itemId?: string;
  priceGold: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface CharacterWallet {
  id: string;
  gold: number;
}

// Simulador de Mercado Global com transações ACID (transaction / withTransaction) e lock pessimista (SELECT ... FOR UPDATE)
class MarketConcurrencySimulator {
  private orders = new Map<string, MarketOrderState>();
  private wallets = new Map<string, CharacterWallet>();
  private items = new Map<string, string>(); // itemId -> ownerId
  private activeLocks = new Map<string, Promise<void>>();

  public setup(sellerId: string, buyer1Id: string, buyer2Id: string, orderId: string, itemId: string): void {
    this.wallets.set(sellerId, { id: sellerId, gold: 100 });
    this.wallets.set(buyer1Id, { id: buyer1Id, gold: 500 });
    this.wallets.set(buyer2Id, { id: buyer2Id, gold: 500 });
    this.items.set(itemId, sellerId);
    this.orders.set(orderId, {
      id: orderId,
      sellerId,
      itemId,
      priceGold: 300,
      status: 'ACTIVE'
    });
  }

  private async withLock<T>(resourceId: string, task: () => Promise<T>): Promise<T> {
    while (this.activeLocks.has(resourceId)) {
      await this.activeLocks.get(resourceId);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.activeLocks.set(resourceId, lockPromise);

    try {
      await new Promise((r) => setTimeout(r, crypto.randomInt(2, 8)));
      return await task();
    } finally {
      this.activeLocks.delete(resourceId);
      releaseLock();
    }
  }

  public async buyOrder(buyerId: string, orderId: string): Promise<{ success: boolean; error?: string }> {
    return this.withLock(`order-${orderId}`, async () => {
      const order = this.orders.get(orderId);
      if (!order || order.status !== 'ACTIVE') {
        return { success: false, error: 'ORDER_NOT_AVAILABLE' };
      }

      const buyer = this.wallets.get(buyerId);
      const seller = this.wallets.get(order.sellerId);
      if (!buyer || !seller) return { success: false, error: 'WALLET_NOT_FOUND' };
      if (buyer.gold < order.priceGold) return { success: false, error: 'INSUFFICIENT_GOLD' };

      const settlement = calculateOrderSettlement('ITEM_SALE', order.priceGold);

      buyer.gold -= order.priceGold;
      seller.gold += settlement.netGold;
      order.status = 'COMPLETED';
      if (order.itemId) {
        this.items.set(order.itemId, buyerId);
      }

      return { success: true };
    });
  }

  public getItemOwner(itemId: string): string | undefined {
    return this.items.get(itemId);
  }

  public getWallet(id: string): CharacterWallet | undefined {
    return this.wallets.get(id);
  }
}

describe('Mercado Global & Livro de Ordens (Tibia Coins & Economia Segura)', () => {
  it('valida regras de criação de ordens de itens e tokens', () => {
    // Ordem válida de item
    const validItem = validateMarketOrderInput({
      orderType: 'ITEM_SALE',
      itemId: 'uuid-item-1',
      priceGold: 250
    });
    expect(validItem.valid).toBe(true);

    // Ordem inválida sem preço
    const invalidPrice = validateMarketOrderInput({
      orderType: 'ITEM_SALE',
      itemId: 'uuid-item-1'
    });
    expect(invalidPrice.valid).toBe(false);
    expect(invalidPrice.error).toBe('PRICE_REQUIRED');

    // Ordem válida de venda de Tokens
    const validTokens = validateMarketOrderInput({
      orderType: 'TOKEN_SELL',
      tokenAmount: 25,
      priceGold: 1000
    });
    expect(validTokens.valid).toBe(true);
  });

  it('calcula taxa de 5% de queima e valor líquido no settlement', () => {
    const settlement = calculateOrderSettlement('ITEM_SALE', 400);
    expect(settlement.grossGold).toBe(400);
    expect(settlement.feeGold).toBe(20); // 5% de 400
    expect(settlement.netGold).toBe(380); // 400 - 20
  });

  it('impede duplicação de item sob compra concorrente simultânea de 2 compradores', async () => {
    const sim = new MarketConcurrencySimulator();
    const sellerId = 'seller-char-1';
    const buyer1Id = 'buyer-char-1';
    const buyer2Id = 'buyer-char-2';
    const orderId = 'order-sword-rare-uuid';
    const itemId = 'item-sword-rare-uuid';

    sim.setup(sellerId, buyer1Id, buyer2Id, orderId, itemId);

    // Disparo concorrente simultâneo de 2 compradores para a MESMA ordem
    const [res1, res2] = await Promise.all([
      sim.buyOrder(buyer1Id, orderId),
      sim.buyOrder(buyer2Id, orderId)
    ]);

    const successes = [res1, res2].filter((r) => r.success);
    const failures = [res1, res2].filter((r) => !r.success);

    // Exatamente 1 comprador teve sucesso e o outro foi rejeitado
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0]?.error).toBe('ORDER_NOT_AVAILABLE');

    // O item pertence a apenas um dos compradores (sem duplicação)
    const newOwner = sim.getItemOwner(itemId);
    expect([buyer1Id, buyer2Id]).toContain(newOwner);
    expect(newOwner).not.toBe(sellerId);

    // Saldo do vendedor aumentou em exatamente 285 (300 - 5% de taxa de 15)
    expect(sim.getWallet(sellerId)?.gold).toBe(100 + 285);
  });
});
