export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'ANCESTRAL';

export type ItemSlot = 'WEAPON' | 'ARMOR' | 'HELMET' | 'BOOTS' | 'AMULET' | 'MATERIAL';

export interface ItemAffix {
  type: 'PREFIX' | 'SUFFIX';
  name: string;
  statBonus: {
    strength?: number;
    agility?: number;
    vitality?: number;
    occultism?: number;
    lifeStealPercent?: number;
    criticalChancePercent?: number;
    goldBonusPercent?: number;
  };
}

export interface GameItem {
  id: string; // UUID único para evitar duplicações
  templateId: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  levelRequirement: number;
  isEquipped: boolean;
  isTradable: boolean;
  baseStats: {
    attack?: number;
    defense?: number;
    magicPower?: number;
  };
  affixes: ItemAffix[];
  monsterOrigin?: string; // Ex: 'Lorde Inquisidor' ou 'Alfa Ancestral' (Monster Hunter)
}

// Peças anatômicas extraídas de monstros (Carving)
export interface MonsterMaterial {
  id: string;
  monsterName: string;
  partName: string; // Ex: 'Coração de Inquisidor', 'Presa de Lycan'
  rarity: ItemRarity;
  dropRatePercent: number;
}
