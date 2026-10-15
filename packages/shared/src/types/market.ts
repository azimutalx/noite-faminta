import { GameItem } from './item.js';

export type OrderType = 'ITEM_SALE' | 'TOKEN_BUY' | 'TOKEN_SELL';

export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface MarketOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  orderType: OrderType;
  item?: GameItem;
  priceGold?: number;
  priceTokens?: number;
  tokenAmount?: number;
  status: OrderStatus;
  createdAt: string;
}

export interface MarketAuditEntry {
  id: string;
  characterId: string;
  operationType: 'BUY' | 'SELL' | 'CANCEL';
  currency: 'GOLD' | 'TOKEN';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
}

export interface MarketBuyResult {
  orderId: string;
  orderType: OrderType;
  buyerId: string;
  sellerId: string;
  priceGold?: number | undefined;
  priceTokens?: number | undefined;
  tokenAmount?: number | undefined;
  feeGold: number;
  transferredItemId?: string | undefined;
}
