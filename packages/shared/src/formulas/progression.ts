import { CharacterProfile } from '../types/character.js';

export interface StatTrainingCostResult {
  goldCost: number;
  totalPointsAfterTraining: number;
}

export function calculateRequiredXp(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.85));
}

export function calculateLevelFromTotalXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  let accumulatedXp = 0;
  while (level < 100) {
    const requiredForNext = calculateRequiredXp(level);
    if (accumulatedXp + requiredForNext > totalXp) {
      break;
    }
    accumulatedXp += requiredForNext;
    level++;
  }
  return level;
}

export function calculateMaxHealth(vitality: number, level: number): number {
  const safeVitality = Math.max(1, vitality);
  const safeLevel = Math.max(1, level);
  return 100 + (safeVitality * 15) + (safeLevel * 20);
}

export function calculateTotalMaxHealth(vitality: number, level: number, throneRoomLevel = 0): number {
  const base = calculateMaxHealth(vitality, level);
  const chamberBonus = Math.max(0, throneRoomLevel) * 40;
  return base + chamberBonus;
}

export function calculateMaxStamina(hideoutLevel: number): number {
  const safeHideout = Math.max(1, hideoutLevel);
  return 100 + ((safeHideout - 1) * 10);
}

export function calculateTotalMaxStamina(hideoutLevel: number, ritualSanctumLevel = 0): number {
  const base = calculateMaxStamina(hideoutLevel);
  const chamberBonus = Math.max(0, ritualSanctumLevel) * 15;
  return base + chamberBonus;
}

export function calculateVaultLimit(hideoutLevel: number): number {
  const safeHideout = Math.max(1, hideoutLevel);
  return 5000 + ((safeHideout - 1) * 10000);
}

export function calculateTotalVaultLimit(hideoutLevel: number, catacombVaultLevel = 0): number {
  const base = calculateVaultLimit(hideoutLevel);
  const chamberBonus = Math.max(0, catacombVaultLevel) * 15000;
  return base + chamberBonus;
}

export function calculateMercenaryCombatPower(stats: { strength: number; agility: number; occultism: number }): number {
  return (stats.strength * 2) + (stats.agility * 2) + (stats.occultism * 3);
}

export function normalizeCharacterStats(character: CharacterProfile): CharacterProfile {
  const rooms = character.hideoutRooms ?? {};
  const maxHealth = calculateTotalMaxHealth(
    character.stats.vitality,
    character.level,
    rooms.throne_sarcophagus ?? 0
  );
  const maxStamina = calculateTotalMaxStamina(
    character.hideoutLevel,
    rooms.ritual_sanctum ?? 0
  );
  const vaultGoldLimit = calculateTotalVaultLimit(
    character.hideoutLevel,
    rooms.catacomb_vault ?? 0
  );
  return {
    ...character,
    maxHealth,
    health: Math.min(character.health, maxHealth),
    maxStamina,
    stamina: Math.min(character.stamina, maxStamina),
    vaultGoldLimit
  };
}

export function calculateStatTrainingCost(currentStatValue: number, pointsToTrain: number): StatTrainingCostResult {
  const safePoints = Math.max(1, pointsToTrain);
  let totalCost = 0;
  for (let i = 0; i < safePoints; i++) {
    const statLevel = currentStatValue + i;
    totalCost += Math.floor(25 * Math.pow(statLevel, 1.25));
  }
  return {
    goldCost: totalCost,
    totalPointsAfterTraining: currentStatValue + safePoints
  };
}

export function calculateEvolutionPointsPerLevel(): number {
  return 3;
}

export interface HideoutStageInfo {
  stageId: 'WASTELAND' | 'CABIN' | 'CRYPT' | 'MANSION' | 'CASTLE';
  minLevel: number;
  maxLevel: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  imageAsset: string;
  defenseBonusText: string;
}

export function calculateHideoutUpgradeCost(currentLevel: number): number {
  const safeLevel = Math.max(1, currentLevel);
  return Math.floor(150 * Math.pow(safeLevel, 1.45));
}
export const calculateHideoutCost = calculateHideoutUpgradeCost;

export function getHideoutStage(hideoutLevel: number): HideoutStageInfo {
  const lvl = Math.max(1, hideoutLevel);
  if (lvl === 1) {
    return {
      stageId: 'WASTELAND',
      minLevel: 1,
      maxLevel: 1,
      title: 'Terreno Baldio das Sombras',
      subtitle: 'Lote Abandonado & Escombros Góticos',
      description: 'Um descampado desolado cercado por arame enferrujado e terra estéril na periferia. O solo esconde um rascunho de catacumba.',
      icon: '🏚️',
      imageAsset: '/assets/refugio_terreno_baldio.svg',
      defenseBonusText: 'Baú básico: 5.000 Ouro • Recuperação lenta'
    };
  }
  if (lvl <= 3) {
    return {
      stageId: 'CABIN',
      minLevel: 2,
      maxLevel: 3,
      title: 'Cabana Velha Decrépita',
      subtitle: 'Casebre Oculto & Alçapão Sinistro',
      description: 'Paredes de madeira apodrecida e teto gotejante disfarçam o alçapão reforçado que leva ao seu refúgio subterrâneo.',
      icon: '🛖',
      imageAsset: '/assets/refugio_cabana_velha.svg',
      defenseBonusText: 'Baú expandido: até 25.000 Ouro • +20 Stamina Máxima'
    };
  }
  if (lvl <= 6) {
    return {
      stageId: 'CRYPT',
      minLevel: 4,
      maxLevel: 6,
      title: 'Cripta & Casarão de Pedra',
      subtitle: 'Muralha de Ardósia & Portão Forjado',
      description: 'Construção maciça de pedra escura erguida sobre fundações antigas. Gárgulas de pedra silenciosas vigiam a entrada.',
      icon: '🏛️',
      imageAsset: '/assets/refugio_cripta_pedra.svg',
      defenseBonusText: 'Baú fortificado: até 55.000 Ouro • +50 Stamina Máxima'
    };
  }
  if (lvl <= 9) {
    return {
      stageId: 'MANSION',
      minLevel: 7,
      maxLevel: 9,
      title: 'Mansão Gótica Aristocrática',
      subtitle: 'Solar das Sombras & Vitrais Carmesins',
      description: 'Um palacete imponente com vitrais de sangue, torres esguias e catacumbas secretas que rivalizam com as cortes imortais.',
      icon: '🏰',
      imageAsset: '/assets/refugio_mansao_gotica.svg',
      defenseBonusText: 'Baú colossal: até 85.000 Ouro • +80 Stamina Máxima'
    };
  }
  return {
    stageId: 'CASTLE',
    minLevel: 10,
    maxLevel: 99,
    title: 'Castelo Imperial das Sombras',
    subtitle: 'Fortaleza Eterna de Sangue & Prata',
    description: 'Uma monumental fortaleza gótica cujos pináculos rasgam a névoa noturna. Baluartes armados, abóbadas místicas e trono soberano.',
    icon: '👑',
    imageAsset: '/assets/refugio_castelo_imperial.svg',
    defenseBonusText: 'Baú inexpugnável: 95.000+ Ouro • +100 Stamina Máxima'
  };
}

