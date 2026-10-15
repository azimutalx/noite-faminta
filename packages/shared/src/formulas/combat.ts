import { CharacterStats, Faction } from '../types/character.js';

export interface CombatStatsBreakdown {
  physicalAttack: number;
  occultAttack: number;
  criticalChance: number;
  evasionChance: number;
  damageReductionPercent: number;
}

export function calculateCombatStats(
  stats: CharacterStats,
  equipmentBonus?: {
    attack?: number;
    defense?: number;
    magicPower?: number;
    criticalChancePercent?: number;
  }
): CombatStatsBreakdown {
  const eqAttack = equipmentBonus?.attack ?? 0;
  const eqDefense = equipmentBonus?.defense ?? 0;
  const eqMagic = equipmentBonus?.magicPower ?? 0;
  const eqCrit = equipmentBonus?.criticalChancePercent ?? 0;

  const physAttack = (stats.strength * 2) + eqAttack;
  const occAttack = (stats.occultism * 2.5) + eqMagic;

  // Chance de crítico: 5% base + escalonamento com agilidade + bônus de equipamentos (teto de 50%)
  const critChance = Math.min(0.50, 0.05 + (stats.agility * 0.002) + (eqCrit / 100));

  // Esquiva base: 5% a 35% com base na agilidade
  const evasion = Math.min(0.35, 0.05 + (stats.agility * 0.0015));

  // Redução de dano percentual via Vitalidade e Defesa de equipamento (cap em 70%)
  const totalDefense = (stats.vitality * 3) + eqDefense;
  const reduction = Math.min(0.70, totalDefense / (totalDefense + 120));

  return {
    physicalAttack: physAttack,
    occultAttack: occAttack,
    criticalChance: critChance,
    evasionChance: evasion,
    damageReductionPercent: reduction
  };
}

export function calculateDamageDealt(
  rawAttack: number,
  targetReductionPercent: number,
  isCritical: boolean,
  critMultiplier = 1.6
): number {
  const mitigated = rawAttack * (1 - targetReductionPercent);
  const finalDamage = isCritical ? mitigated * critMultiplier : mitigated;
  return Math.max(1, Math.floor(finalDamage));
}

export function evaluateGambitCondition(
  condition: string,
  currentHp: number,
  maxHp: number,
  enemyFaction: Faction,
  isInFrenzy: boolean,
  enemyIsEvading: boolean
): boolean {
  const hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;

  switch (condition) {
    case 'HP_BELOW_30':
      return hpPercent < 30;
    case 'ENEMY_IS_LYCAN':
      return enemyFaction === 'LYCAN';
    case 'ENEMY_IS_VAMPIRE':
      return enemyFaction === 'VAMPIRE';
    case 'ENEMY_EVADING':
      return enemyIsEvading;
    case 'IN_FRENZY':
      return isInFrenzy;
    case 'ALWAYS':
      return true;
    default:
      return false;
  }
}
