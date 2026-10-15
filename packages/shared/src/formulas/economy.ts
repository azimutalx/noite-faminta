export interface MarketFeeBreakdown {
  grossGold: number;
  feeGold: number;
  netGold: number;
}

export const MARKET_FEE_RATE = 0.05; // 5% de queima de Gold (Gold Sink)
export const DISTRICT_DIVIDEND_RATE = 0.05; // 5% repassado ao clã governante do distrito

export function calculateMarketFee(grossPriceGold: number): MarketFeeBreakdown {
  const safeGross = Math.max(0, Math.floor(grossPriceGold));
  if (safeGross === 0) {
    return { grossGold: 0, feeGold: 0, netGold: 0 };
  }
  const fee = Math.max(1, Math.floor(safeGross * MARKET_FEE_RATE));
  const net = Math.max(0, safeGross - fee);

  return {
    grossGold: safeGross,
    feeGold: fee,
    netGold: net
  };
}

export function calculateDistrictDividend(totalFeesCollected: number): number {
  const safeFees = Math.max(0, Math.floor(totalFeesCollected));
  return Math.floor(safeFees * DISTRICT_DIVIDEND_RATE);
}

export function applyVipBonus(baseValue: number, isVip: boolean, vipMultiplier = 1.20): number {
  const safeBase = Math.max(0, baseValue);
  if (!isVip) return safeBase;
  return Math.floor(safeBase * vipMultiplier);
}
