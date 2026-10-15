import { ItemRarity, MonsterMaterial } from '../types/item.js';

export interface CarvingOutcome {
  material: MonsterMaterial;
  obtained: boolean;
  effectiveChancePercent: number;
}

export interface AffixStatRange {
  minStat: number;
  maxStat: number;
}

export const RARITY_AFFIX_RANGES: Record<ItemRarity, AffixStatRange> = {
  COMMON: { minStat: 1, maxStat: 3 },
  UNCOMMON: { minStat: 4, maxStat: 8 },
  RARE: { minStat: 9, maxStat: 15 },
  EPIC: { minStat: 16, maxStat: 25 },
  ANCESTRAL: { minStat: 26, maxStat: 40 }
};

export function resolveCarvingDrop(
  material: MonsterMaterial,
  rollFactor: number,
  luckBonusPercent = 0
): CarvingOutcome {
  const effectiveChance = Math.min(100, Math.max(1, material.dropRatePercent + luckBonusPercent));
  const threshold = effectiveChance / 100;
  const normalizedRoll = Math.min(1.0, Math.max(0.0, rollFactor));
  const obtained = normalizedRoll <= threshold;

  return {
    material,
    obtained,
    effectiveChancePercent: effectiveChance
  };
}

export function calculateAffixStatValue(
  rarity: ItemRarity,
  intensityFactor: number
): number {
  const range = RARITY_AFFIX_RANGES[rarity];
  const normalizedIntensity = Math.min(1.0, Math.max(0.0, intensityFactor));
  const span = range.maxStat - range.minStat;
  return range.minStat + Math.round(span * normalizedIntensity);
}
