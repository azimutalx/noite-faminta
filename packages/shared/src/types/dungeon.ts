import { Faction } from './character.js';
import { ItemRarity, ItemSlot, MonsterMaterial, GameItem } from './item.js';
import { CombatBattleResult, GambitRule } from './combat.js';

export type DungeonBossId = 'INQUISITOR_MALACHI' | 'ANCIENT_FENRIR' | 'CRIMSON_CARMILLA';

export interface DungeonBoss {
  id: DungeonBossId;
  name: string;
  title: string;
  description: string;
  faction: Faction | 'INQUISITION';
  level: number;
  health: number;
  maxHealth: number;
  stats: {
    strength: number;
    agility: number;
    vitality: number;
    occultism: number;
  };
  gambits: GambitRule[];
  carvingTable: MonsterMaterial[];
  staminaCost: number;
  goldReward: number;
  xpReward: number;
}

export type ForgeRecipeId = 'FORGE_WEAPON_BLADE' | 'FORGE_ARMOR_PLATE' | 'FORGE_AMULET_RELIC';

export interface ForgeRecipeRequirement {
  materialTemplateId: string;
  materialName: string;
  count: number;
}

export interface ForgeRecipe {
  id: ForgeRecipeId;
  name: string;
  description: string;
  targetSlot: ItemSlot;
  baseRarity: ItemRarity;
  requiredMaterials: ForgeRecipeRequirement[];
  goldCost: number;
}

export interface DungeonRaidResult {
  bossId: DungeonBossId;
  bossName: string;
  battleResult: CombatBattleResult;
  playerWon: boolean;
  carvedMaterials: MonsterMaterial[];
  goldAwarded: number;
  xpAwarded: number;
  staminaConsumed: number;
}

export interface ForgeResult {
  forgedItem: GameItem;
  goldSpent: number;
  materialsConsumed: string[];
}
