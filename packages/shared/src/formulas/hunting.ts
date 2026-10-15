import { CharacterStats } from '../types/character.js';

export type HuntTargetType =
  | 'STREET_MORTAL'
  | 'NOCTURNAL_PATROL'
  | 'INQUISITION_OUTPOST'
  | 'ANCIENT_CRYPT';

export interface HuntTargetConfig {
  name: string;
  minPower: number;
  baseGold: number;
  baseXp: number;
  baseDamageTaken: number;
  masqueradeAlert: number;
}

export const HUNT_TARGET_CONFIGS: Record<HuntTargetType, HuntTargetConfig> = {
  STREET_MORTAL: {
    name: 'Mortal Noturno Solitário',
    minPower: 15,
    baseGold: 50,
    baseXp: 30,
    baseDamageTaken: 10,
    masqueradeAlert: 2
  },
  NOCTURNAL_PATROL: {
    name: 'Patrulha Policial Noturna',
    minPower: 50,
    baseGold: 180,
    baseXp: 110,
    baseDamageTaken: 35,
    masqueradeAlert: 8
  },
  INQUISITION_OUTPOST: {
    name: 'Posto Avançado da Inquisição',
    minPower: 140,
    baseGold: 520,
    baseXp: 320,
    baseDamageTaken: 90,
    masqueradeAlert: 20
  },
  ANCIENT_CRYPT: {
    name: 'Cripta Ancestral dos Primogênitos',
    minPower: 320,
    baseGold: 1600,
    baseXp: 950,
    baseDamageTaken: 220,
    masqueradeAlert: 35
  }
};

export interface HuntResolutionResult {
  success: boolean;
  goldEarned: number;
  xpEarned: number;
  damageTaken: number;
  alertIncrease: number;
  staminaConsumed: number;
}

export function calculateHuntingPower(stats: CharacterStats, level: number): number {
  const safeLevel = Math.max(1, level);
  const strScore = stats.strength * 1.5;
  const agiScore = stats.agility * 1.2;
  const vitScore = stats.vitality * 0.8;
  const occScore = stats.occultism * 1.8;
  return Math.floor(strScore + agiScore + vitScore + occScore + (safeLevel * 4));
}

export function resolveHunt(
  playerPower: number,
  targetType: HuntTargetType,
  staminaCost: number,
  rollFactor: number,
  factionBonusPercent = 0
): HuntResolutionResult {
  const target = HUNT_TARGET_CONFIGS[targetType];
  const powerRatio = playerPower / Math.max(1, target.minPower);
  
  // Chance de sucesso base de 65%, crescendo com a superioridade de poder até 98%
  const calculatedChance = Math.min(0.98, Math.max(0.20, 0.65 + ((powerRatio - 1.0) * 0.25)));
  const normalizedRoll = Math.min(1.0, Math.max(0.0, rollFactor));
  const success = normalizedRoll <= calculatedChance;
  const bonusMultiplier = 1 + (factionBonusPercent / 100);

  if (success) {
    const goldVariance = 0.85 + (normalizedRoll * 0.3); // Variância determinística de 85% a 115%
    // Cálculo puro: a mutação de saldo de gold só é persistida no backend via transaction com FOR UPDATE
    const earnedGold = Math.floor(target.baseGold * goldVariance * bonusMultiplier);
    const xp = Math.floor(target.baseXp * bonusMultiplier);
    const damage = Math.max(2, Math.floor(target.baseDamageTaken * Math.max(0.2, 1.2 - (powerRatio * 0.4))));

    return {
      success: true,
      goldEarned: earnedGold,
      xpEarned: xp,
      damageTaken: damage,
      alertIncrease: target.masqueradeAlert,
      staminaConsumed: staminaCost
    };
  }

  // Falha na caçada: sem ouro, pouca experiência, mais dano sofrido e alerta dobrado
  const penaltyDamage = Math.floor(target.baseDamageTaken * 1.5);
  const consolationXp = Math.floor(target.baseXp * 0.25);
  const penaltyAlert = target.masqueradeAlert * 2;

  return {
    success: false,
    goldEarned: 0,
    xpEarned: consolationXp,
    damageTaken: penaltyDamage,
    alertIncrease: penaltyAlert,
    staminaConsumed: staminaCost
  };
}
