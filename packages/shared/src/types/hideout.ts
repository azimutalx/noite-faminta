export type HideoutChamberId =
  | 'throne_sarcophagus'
  | 'catacomb_vault'
  | 'blood_forge'
  | 'ritual_sanctum'
  | 'gargoyle_parapet'
  | 'minion_crypt';

export interface HideoutChamberConfig {
  id: HideoutChamberId;
  name: string;
  category: 'GOVERNANCE' | 'ECONOMY' | 'CRAFTING' | 'OCCULT' | 'DEFENSE' | 'MINIONS';
  icon: string;
  svgAsset: string;
  tagline: string;
  lore: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
}

export interface ChamberBonusInfo {
  title: string;
  currentValueText: string;
  nextValueText: string;
}

export interface HideoutChamberStatus {
  id: HideoutChamberId;
  config: HideoutChamberConfig;
  level: number;
  isUnlocked: boolean;
  upgradeCost: number;
  canAfford: boolean;
  bonus: ChamberBonusInfo;
  stageName: string;
}
