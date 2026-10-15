import { CharacterStats, TagmarPhysicalCondition, TagmarResolutionGrade } from '../types/character.js';

// Pure formula engine: calculations are deterministic; currency and loot state are persisted within server database transaction.
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
  staminaCost: number;
}

export const HUNT_TARGET_CONFIGS: Record<HuntTargetType, HuntTargetConfig> = {
  STREET_MORTAL: {
    name: 'Mortal Noturno Solitário',
    minPower: 15,
    baseGold: 50,
    baseXp: 30,
    baseDamageTaken: 10,
    masqueradeAlert: 2,
    staminaCost: 10
  },
  NOCTURNAL_PATROL: {
    name: 'Patrulha Policial Noturna',
    minPower: 50,
    baseGold: 180,
    baseXp: 110,
    baseDamageTaken: 35,
    masqueradeAlert: 8,
    staminaCost: 15
  },
  INQUISITION_OUTPOST: {
    name: 'Posto Avançado da Inquisição',
    minPower: 140,
    baseGold: 520,
    baseXp: 320,
    baseDamageTaken: 90,
    masqueradeAlert: 20,
    staminaCost: 25
  },
  ANCIENT_CRYPT: {
    name: 'Cripta Ancestral dos Primogênitos',
    minPower: 320,
    baseGold: 1600,
    baseXp: 950,
    baseDamageTaken: 220,
    masqueradeAlert: 35,
    staminaCost: 35
  }
};

export interface HuntResolutionResult {
  success: boolean;
  goldEarned: number;
  xpEarned: number;
  damageTaken: number;
  alertIncrease: number;
  staminaConsumed: number;
  resolutionGrade: TagmarResolutionGrade;
  narrative: string;
}

export function getPhysicalCondition(stamina: number, maxStamina: number, health: number): TagmarPhysicalCondition {
  if (health <= 0) return 'TORPOR';
  if (stamina <= 0) return 'EXHAUSTED';
  const ratio = maxStamina > 0 ? stamina / maxStamina : 0;
  if (ratio < 0.30) return 'FATIGUED';
  if (ratio < 0.70) return 'TIRED';
  return 'RESTED';
}

export function getConditionDetails(condition: TagmarPhysicalCondition): {
  label: string;
  color: string;
  powerMultiplier: number;
  description: string;
} {
  switch (condition) {
    case 'RESTED':
      return { label: 'Revigorado', color: '#69db7c', powerMultiplier: 1.10, description: 'Tônus muscular pleno (+10% poder).' };
    case 'TIRED':
      return { label: 'Cansado', color: '#ffd43b', powerMultiplier: 1.0, description: 'Fôlego regular de combate noturno.' };
    case 'FATIGUED':
      return { label: 'Fadigado', color: '#ff922b', powerMultiplier: 0.80, description: 'Respiração pesada (-20% poder, risco crítico).' };
    case 'EXHAUSTED':
      return { label: 'Exausto', color: '#ff6b6b', powerMultiplier: 0.50, description: 'Estafa completa! Esforço bloqueado.' };
    case 'TORPOR':
      return { label: 'Torpor', color: '#c92a2a', powerMultiplier: 0.0, description: 'Letargia cadavérica! Descanse no Refúgio.' };
  }
}

export function canPerformAction(
  stamina: number,
  health: number,
  requiredStamina: number
): { allowed: boolean; reason?: string } {
  if (health <= 0) {
    return { allowed: false, reason: '💀 Personagem em Torpor cadavérico. Descanse no Sarcófago do Refúgio para regenerar seu sangue.' };
  }
  if (stamina < requiredStamina) {
    return {
      allowed: false,
      reason: `⚡ Energia física esgotada (Exaustão do Tagmar). Necessário: ${requiredStamina} Stamina, Atual: ${stamina}. Descanse no Refúgio!`
    };
  }
  return { allowed: true };
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
  factionBonusPercent = 0,
  condition: TagmarPhysicalCondition = 'RESTED'
): HuntResolutionResult {
  const target = HUNT_TARGET_CONFIGS[targetType];
  const condDetails = getConditionDetails(condition);
  const effectivePower = playerPower * condDetails.powerMultiplier;
  const powerRatio = effectivePower / Math.max(1, target.minPower);
  
  // Chance base com base na superioridade de poder (20% a 98%)
  const calculatedChance = Math.min(0.98, Math.max(0.20, 0.65 + ((powerRatio - 1.0) * 0.25)));
  const normalizedRoll = Math.min(1.0, Math.max(0.0, rollFactor));
  const isSuccess = normalizedRoll <= calculatedChance;
  const bonusMultiplier = 1 + (factionBonusPercent / 100);

  // Resolução baseada na Tabela de Resolução do Tagmar (5 graus)
  if (isSuccess) {
    // Decisivo / Crítico Tagmar (Vermelho): roll no decil superior do sucesso
    const isDecisive = normalizedRoll <= calculatedChance * 0.15 || normalizedRoll <= 0.05;
    // Sucesso Bom Tagmar (Laranja)
    const isGood = !isDecisive && normalizedRoll <= calculatedChance * 0.50;

    if (isDecisive) {
      const earnedGold = Math.floor(target.baseGold * 1.6 * bonusMultiplier);
      const xp = Math.floor(target.baseXp * 2.0 * bonusMultiplier);
      return {
        success: true,
        goldEarned: earnedGold,
        xpEarned: xp,
        damageTaken: 0,
        alertIncrease: Math.max(1, Math.floor(target.masqueradeAlert * 0.5)),
        staminaConsumed: staminaCost,
        resolutionGrade: 'DECISIVE_SUCCESS',
        narrative: `🩸 BOTE PERFEITO (Sucesso Decisivo): Emboscada fulminante nas sombras! Presa abatida instantaneamente sem sofrer retaliação.`
      };
    }

    if (isGood) {
      const earnedGold = Math.floor(target.baseGold * 1.25 * bonusMultiplier);
      const xp = Math.floor(target.baseXp * 1.25 * bonusMultiplier);
      const damage = Math.max(1, Math.floor(target.baseDamageTaken * 0.4));
      return {
        success: true,
        goldEarned: earnedGold,
        xpEarned: xp,
        damageTaken: damage,
        alertIncrease: target.masqueradeAlert,
        staminaConsumed: staminaCost,
        resolutionGrade: 'GOOD_SUCCESS',
        narrative: `✨ CAÇADA EXEMPLAR (Sucesso Bom): Manobra precisa e limpa! Espólio extra e dano recebido reduzido pela metade.`
      };
    }

    // Sucesso Normal Tagmar (Amarelo)
    const goldVariance = 0.90 + (normalizedRoll * 0.2);
    const earnedGold = Math.floor(target.baseGold * goldVariance * bonusMultiplier);
    const xp = Math.floor(target.baseXp * bonusMultiplier);
    const damage = Math.max(2, Math.floor(target.baseDamageTaken * Math.max(0.3, 1.2 - (powerRatio * 0.4))));

    return {
      success: true,
      goldEarned: earnedGold,
      xpEarned: xp,
      damageTaken: damage,
      alertIncrease: target.masqueradeAlert,
      staminaConsumed: staminaCost,
      resolutionGrade: 'NORMAL_SUCCESS',
      narrative: `⚔️ PRESA CAPTURADA (Sucesso Normal): Caçada concluída com sucesso. Alimento e ouro recolhidos.`
    };
  }

  // Falhas (Branco e Verde no Tagmar)
  const isCriticalFailure = normalizedRoll >= 0.92 || (condition === 'FATIGUED' && normalizedRoll >= 0.85);

  if (isCriticalFailure) {
    const penaltyDamage = Math.floor(target.baseDamageTaken * 1.8);
    const penaltyAlert = target.masqueradeAlert * 3;
    return {
      success: false,
      goldEarned: 0,
      xpEarned: 0,
      damageTaken: penaltyDamage,
      alertIncrease: penaltyAlert,
      staminaConsumed: staminaCost,
      resolutionGrade: 'CRITICAL_FAILURE',
      narrative: `💀 DESASTRE / CONTRA-EMBOSCADA (Falha Crítica): Você foi surpreendido e encurralado! Dano severo e Inquisição em alerta triplo!`
    };
  }

  // Falha Normal Tagmar (Branco)
  const penaltyDamage = Math.floor(target.baseDamageTaken * 1.2);
  const consolationXp = Math.floor(target.baseXp * 0.20);
  const penaltyAlert = Math.floor(target.masqueradeAlert * 1.5);

  return {
    success: false,
    goldEarned: 0,
    xpEarned: consolationXp,
    damageTaken: penaltyDamage,
    alertIncrease: penaltyAlert,
    staminaConsumed: staminaCost,
    resolutionGrade: 'FAILURE',
    narrative: `⚠️ PRESA ESCAPOU (Falha): O alvo percebeu a aproximação e dispersou no nevoeiro. Pouca experiência e retaliação leve.`
  };
}

