import { describe, it, expect } from 'vitest';
import {
  calculateRequiredXp,
  calculateLevelFromTotalXp,
  calculateMaxHealth,
  calculateMaxStamina,
  calculateVaultLimit,
  calculateStatTrainingCost,
  calculateEvolutionPointsPerLevel,
  calculateHideoutUpgradeCost,
  getHideoutStage
} from '../src/formulas/progression.js';
import {
  calculateHuntingPower,
  resolveHunt
} from '../src/formulas/hunting.js';
import {
  calculateCombatStats,
  calculateDamageDealt,
  evaluateGambitCondition
} from '../src/formulas/combat.js';
import {
  calculateMarketFee,
  calculateDistrictDividend,
  applyVipBonus
} from '../src/formulas/economy.js';
import {
  resolveCarvingDrop,
  calculateAffixStatValue
} from '../src/formulas/crafting.js';

describe('Formulas: Progression', () => {
  it('calculates XP progression consistently', () => {
    expect(calculateRequiredXp(1)).toBe(100);
    expect(calculateRequiredXp(2)).toBeGreaterThan(100);
    expect(calculateLevelFromTotalXp(0)).toBe(1);
    expect(calculateLevelFromTotalXp(500)).toBeGreaterThanOrEqual(2);
  });

  it('calculates attributes and limits based on stats and hideout', () => {
    expect(calculateMaxHealth(10, 1)).toBe(100 + 150 + 20);
    expect(calculateMaxStamina(1)).toBe(100);
    expect(calculateMaxStamina(3)).toBe(120);
    expect(calculateVaultLimit(1)).toBe(5000);
    expect(calculateVaultLimit(2)).toBe(15000);
    expect(calculateEvolutionPointsPerLevel()).toBe(3);
  });

  it('calculates stat training costs incrementally', () => {
    const costOne = calculateStatTrainingCost(10, 1);
    expect(costOne.goldCost).toBeGreaterThan(0);
    expect(costOne.totalPointsAfterTraining).toBe(11);

    const costMulti = calculateStatTrainingCost(10, 3);
    expect(costMulti.goldCost).toBeGreaterThan(costOne.goldCost);
    expect(costMulti.totalPointsAfterTraining).toBe(13);
  });

  it('calculates hideout upgrade costs and maps architectural stages', () => {
    // Custos progressivos
    expect(calculateHideoutUpgradeCost(1)).toBe(150);
    expect(calculateHideoutUpgradeCost(2)).toBe(409);
    expect(calculateHideoutUpgradeCost(3)).toBeGreaterThan(calculateHideoutUpgradeCost(2));

    // Estágios
    const wasteland = getHideoutStage(1);
    expect(wasteland.stageId).toBe('WASTELAND');
    expect(wasteland.imageAsset).toContain('refugio_terreno_baldio.svg');

    const cabin = getHideoutStage(2);
    expect(cabin.stageId).toBe('CABIN');
    expect(cabin.imageAsset).toContain('refugio_cabana_velha.svg');

    const crypt = getHideoutStage(5);
    expect(crypt.stageId).toBe('CRYPT');
    expect(crypt.imageAsset).toContain('refugio_cripta_pedra.svg');

    const mansion = getHideoutStage(8);
    expect(mansion.stageId).toBe('MANSION');
    expect(mansion.imageAsset).toContain('refugio_mansao_gotica.svg');

    const castle = getHideoutStage(10);
    expect(castle.stageId).toBe('CASTLE');
    expect(castle.imageAsset).toContain('refugio_castelo_imperial.svg');
  });
});

describe('Formulas: Hunting', () => {
  const sampleStats = { strength: 15, agility: 12, vitality: 14, occultism: 10 };

  it('calculates player hunting power', () => {
    const power = calculateHuntingPower(sampleStats, 1);
    expect(power).toBeGreaterThan(50);
  });

  it('resolves successful hunt with earned gold and damage taken', () => {
    const outcome = resolveHunt(80, 'STREET_MORTAL', 10, 0.2);
    expect(outcome.success).toBe(true);
    expect(outcome.goldEarned).toBeGreaterThan(0);
    expect(outcome.xpEarned).toBeGreaterThan(0);
    expect(outcome.alertIncrease).toBe(2);
  });

  it('resolves failed hunt when roll exceeds success threshold', () => {
    const outcome = resolveHunt(10, 'ANCIENT_CRYPT', 20, 0.99);
    expect(outcome.success).toBe(false);
    expect(outcome.goldEarned).toBe(0);
    expect(outcome.damageTaken).toBeGreaterThan(0);
  });
});

describe('Formulas: Combat & Gambits', () => {
  const stats = { strength: 20, agility: 15, vitality: 18, occultism: 10 };

  it('derives physical and occult stats with equipment modifiers', () => {
    const breakdown = calculateCombatStats(stats, { attack: 25, defense: 40 });
    expect(breakdown.physicalAttack).toBe(40 + 25);
    expect(breakdown.criticalChance).toBeGreaterThanOrEqual(0.05);
    expect(breakdown.damageReductionPercent).toBeGreaterThan(0.2);
  });

  it('calculates critical and non-critical damage correctly', () => {
    const regular = calculateDamageDealt(100, 0.20, false);
    const critical = calculateDamageDealt(100, 0.20, true, 2.0);
    expect(regular).toBe(80);
    expect(critical).toBe(160);
  });

  it('evaluates gambit condition triggers deterministically', () => {
    expect(evaluateGambitCondition('HP_BELOW_30', 25, 100, 'LYCAN', false, false)).toBe(true);
    expect(evaluateGambitCondition('HP_BELOW_30', 50, 100, 'LYCAN', false, false)).toBe(false);
    expect(evaluateGambitCondition('ENEMY_IS_VAMPIRE', 100, 100, 'VAMPIRE', false, false)).toBe(true);
    expect(evaluateGambitCondition('IN_FRENZY', 100, 100, 'LYCAN', true, false)).toBe(true);
  });
});

describe('Formulas: Economy & Crafting', () => {
  it('applies 5% market fee with minimum of 1 Gold', () => {
    const smallFee = calculateMarketFee(10);
    expect(smallFee.feeGold).toBe(1);
    expect(smallFee.netGold).toBe(9);

    const normalFee = calculateMarketFee(1000);
    expect(normalFee.feeGold).toBe(50);
    expect(normalFee.netGold).toBe(950);
  });

  it('calculates district dividends and VIP bonuses', () => {
    expect(calculateDistrictDividend(10000)).toBe(500);
    expect(applyVipBonus(100, false)).toBe(100);
    expect(applyVipBonus(100, true)).toBe(120);
  });

  it('resolves crafting and carving drop rates deterministically', () => {
    const material = {
      id: 'm1',
      monsterName: 'Inquisidor',
      partName: 'Coração Consagrado',
      rarity: 'RARE' as const,
      dropRatePercent: 30
    };
    const luckyDrop = resolveCarvingDrop(material, 0.15);
    const unluckyDrop = resolveCarvingDrop(material, 0.85);
    expect(luckyDrop.obtained).toBe(true);
    expect(unluckyDrop.obtained).toBe(false);

    const affixValue = calculateAffixStatValue('RARE', 0.5);
    expect(affixValue).toBeGreaterThanOrEqual(9);
    expect(affixValue).toBeLessThanOrEqual(15);
  });
});
