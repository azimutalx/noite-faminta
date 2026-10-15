import { OrderType, calculateMarketFee, MarketFeeBreakdown } from '@noite-faminta/shared';

export interface ValidatedOrderInput {
  orderType: OrderType;
  priceGold?: number | undefined;
  priceTokens?: number | undefined;
  tokenAmount?: number | undefined;
  itemId?: string | undefined;
}

export function validateMarketOrderInput(input: ValidatedOrderInput): { valid: boolean; error?: string } {
  if (input.orderType === 'ITEM_SALE') {
    if (!input.itemId) return { valid: false, error: 'ITEM_ID_REQUIRED' };
    if (!input.priceGold && !input.priceTokens) return { valid: false, error: 'PRICE_REQUIRED' };
    if (input.priceGold && input.priceGold <= 0) return { valid: false, error: 'INVALID_GOLD_PRICE' };
    if (input.priceTokens && input.priceTokens <= 0) return { valid: false, error: 'INVALID_TOKEN_PRICE' };
  }

  if (input.orderType === 'TOKEN_SELL') {
    if (!input.tokenAmount || input.tokenAmount <= 0) return { valid: false, error: 'TOKEN_AMOUNT_REQUIRED' };
    if (!input.priceGold || input.priceGold <= 0) return { valid: false, error: 'GOLD_PRICE_REQUIRED' };
  }

  if (input.orderType === 'TOKEN_BUY') {
    if (!input.tokenAmount || input.tokenAmount <= 0) return { valid: false, error: 'TOKEN_AMOUNT_REQUIRED' };
    if (!input.priceGold || input.priceGold <= 0) return { valid: false, error: 'GOLD_PRICE_REQUIRED' };
  }

  return { valid: true };
}

export function calculateOrderSettlement(
  orderType: OrderType,
  priceGold?: number
): { grossGold: number; feeGold: number; netGold: number } {
  if (orderType === 'ITEM_SALE' && priceGold && priceGold > 0) {
    const fee: MarketFeeBreakdown = calculateMarketFee(priceGold);
    return {
      grossGold: fee.grossGold,
      feeGold: fee.feeGold,
      netGold: fee.netGold
    };
  }

  if (orderType === 'TOKEN_SELL' && priceGold && priceGold > 0) {
    const fee: MarketFeeBreakdown = calculateMarketFee(priceGold);
    return {
      grossGold: fee.grossGold,
      feeGold: fee.feeGold,
      netGold: fee.netGold
    };
  }

  return { grossGold: 0, feeGold: 0, netGold: 0 };
}
