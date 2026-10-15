import { describe, it, expect } from 'vitest';
import {
  calculateRequiredXp, calculateLevelFromTotalXp, calculateMaxHealth,
  calculateTotalMaxHealth, calculateMaxStamina, calculateTotalMaxStamina,
  calculateVaultLimit, calculateTotalVaultLimit, calculateMercenaryCombatPower,
  normalizeCharacterStats, calculateStatTrainingCost, calculateEvolutionPointsPerLevel,
  calculateHideoutUpgradeCost, getHideoutStage
} from '../src/formulas/progression.js';
import {
  calculateHuntingPower, resolveHunt, getPhysicalCondition,
  getConditionDetails, canPerformAction, HUNT_TARGET_CONFIGS
} from '../src/formulas/hunting.js';
import { calculateCombatStats, calculateDamageDealt, evaluateGambitCondition } from '../src/formulas/combat.js';
import { calculateMarketFee, calculateDistrictDividend, applyVipBonus } from '../src/formulas/economy.js';
import { resolveCarvingDrop, calculateAffixStatValue } from '../src/formulas/crafting.js';

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

  it('calculates total stats incorporating hideout chambers', () => {
    expect(calculateTotalMaxHealth(15, 3, 0)).toBe(385);
    expect(calculateTotalMaxHealth(15, 3, 1)).toBe(425);
    expect(calculateTotalMaxHealth(15, 3, 2)).toBe(465);
    expect(calculateTotalMaxStamina(2, 0)).toBe(110);
    expect(calculateTotalMaxStamina(2, 1)).toBe(125);
    expect(calculateTotalMaxStamina(2, 2)).toBe(140);
    expect(calculateTotalVaultLimit(2, 0)).toBe(15000);
    expect(calculateTotalVaultLimit(2, 1)).toBe(30000);
    expect(calculateTotalVaultLimit(3, 2)).toBe(55000);
    expect(calculateMercenaryCombatPower({ strength: 14, agility: 12, occultism: 18 })).toBe(106);
  });

  it('normalizes character stats and clamps health/stamina to canonical bounds', () => {
    const rawChar = {
      id: 'test-1', name: 'Vlad', faction: 'VAMPIRE' as const, specialization: 'HYBRID' as const,
      level: 3, experience: 100, experienceToNextLevel: 500, gold: 500, tokens: 10,
      stamina: 9999, maxStamina: 50, health: 9999, maxHealth: 100,
      stats: { strength: 14, agility: 12, vitality: 15, occultism: 18 },
      evolutionPoints: 0, masqueradeAlert: 0, hideoutLevel: 2, vaultGold: 0, vaultGoldLimit: 100,
      hideoutRooms: { throne_sarcophagus: 1, catacomb_vault: 1, ritual_sanctum: 1 }
    };

    const normalized = normalizeCharacterStats(rawChar);
    expect(normalized.maxHealth).toBe(425);
    expect(normalized.health).toBe(425);
    expect(normalized.maxStamina).toBe(125);
    expect(normalized.stamina).toBe(125);
    expect(normalized.vaultGoldLimit).toBe(30000);
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
    expect(calculateHideoutUpgradeCost(1)).toBe(150);
    expect(calculateHideoutUpgradeCost(2)).toBe(409);
    expect(calculateHideoutUpgradeCost(3)).toBeGreaterThan(calculateHideoutUpgradeCost(2));

    expect(getHideoutStage(1).stageId).toBe('WASTELAND');
    expect(getHideoutStage(2).stageId).toBe('CABIN');
    expect(getHideoutStage(5).stageId).toBe('CRYPT');
    expect(getHideoutStage(8).stageId).toBe('MANSION');
    expect(getHideoutStage(10).stageId).toBe('CASTLE');
  });
});

describe('Formulas: Hunting & Tagmar RPG System', () => {
  const sampleStats = { strength: 15, agility: 12, vitality: 14, occultism: 10 };

  it('calculates player hunting power', () => {
    const power = calculateHuntingPower(sampleStats, 1);
    expect(power).toBeGreaterThan(50);
  });

  it('evaluates Tagmar physical fatigue conditions correctly', () => {
    expect(getPhysicalCondition(100, 100, 400)).toBe('RESTED');
    expect(getPhysicalCondition(70, 100, 400)).toBe('RESTED');
    expect(getPhysicalCondition(60, 100, 400)).toBe('TIRED');
    expect(getPhysicalCondition(25, 100, 400)).toBe('FATIGUED');
    expect(getPhysicalCondition(0, 100, 400)).toBe('EXHAUSTED');
    expect(getPhysicalCondition(100, 100, 0)).toBe('TORPOR');
    expect(getPhysicalCondition(0, 100, 0)).toBe('TORPOR');
  });

  it('validates action allowance with canPerformAction', () => {
    // Caso de sucesso (tem stamina e vida)
    expect(canPerformAction(50, 400, 10).allowed).toBe(true);

    // Caso de stamina insuficiente (exaustão)
    const exhaustedCheck = canPerformAction(5, 400, 15);
    expect(exhaustedCheck.allowed).toBe(false);
    expect(exhaustedCheck.reason).toContain('Energia física esgotada');

    // Caso de torpor (health 0)
    const torporCheck = canPerformAction(100, 0, 10);
    expect(torporCheck.allowed).toBe(false);
    expect(torporCheck.reason).toContain('Torpor cadavérico');
  });

  it('verifies condition multipliers and details', () => {
    const rested = getConditionDetails('RESTED');
    expect(rested.powerMultiplier).toBe(1.10);
    expect(rested.label).toBe('Revigorado');

    const fatigued = getConditionDetails('FATIGUED');
    expect(fatigued.powerMultiplier).toBe(0.80);
    expect(fatigued.label).toBe('Fadigado');

    const exhausted = getConditionDetails('EXHAUSTED');
    expect(exhausted.powerMultiplier).toBe(0.50);

    const torpor = getConditionDetails('TORPOR');
    expect(torpor.powerMultiplier).toBe(0.0);
  });

  it('resolves decisive success (crítico) with 0 damage and bonus rewards', () => {
    // Roll extremamente baixo (0.01) garante Sucesso Decisivo no Tagmar
    const outcome = resolveHunt(120, 'STREET_MORTAL', 10, 0.01);
    expect(outcome.success).toBe(true);
    expect(outcome.resolutionGrade).toBe('DECISIVE_SUCCESS');
    expect(outcome.damageTaken).toBe(0);
    expect(outcome.goldEarned).toBeGreaterThan(50);
    expect(outcome.xpEarned).toBeGreaterThan(30);
    expect(outcome.narrative).toContain('BOTE PERFEITO');
  });

  it('resolves normal success with standard rewards and moderate damage', () => {
    const outcome = resolveHunt(80, 'STREET_MORTAL', 10, 0.40);
    expect(outcome.success).toBe(true);
    expect(['NORMAL_SUCCESS', 'GOOD_SUCCESS']).toContain(outcome.resolutionGrade);
    expect(outcome.goldEarned).toBeGreaterThan(0);
    expect(outcome.xpEarned).toBeGreaterThan(0);
  });

  it('resolves critical failure when roll is disastrous', () => {
    const outcome = resolveHunt(10, 'ANCIENT_CRYPT', 35, 0.98);
    expect(outcome.success).toBe(false);
    expect(outcome.resolutionGrade).toBe('CRITICAL_FAILURE');
    expect(outcome.goldEarned).toBe(0);
    expect(outcome.xpEarned).toBe(0);
    expect(outcome.damageTaken).toBeGreaterThan(200);
    expect(outcome.narrative).toContain('DESASTRE');
  });

  it('applies fatigue penalties during hunt resolution', () => {
    // Sob fadiga, o poder efetivo é reduzido
    const outcomeFatigued = resolveHunt(50, 'NOCTURNAL_PATROL', 15, 0.88, 0, 'FATIGUED');
    expect(outcomeFatigued.success).toBe(false);
    expect(outcomeFatigued.resolutionGrade).toBe('CRITICAL_FAILURE');
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
