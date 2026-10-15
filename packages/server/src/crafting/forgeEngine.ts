import crypto from 'node:crypto';
import {
  GameItem,
  ItemAffix,
  ItemRarity,
  MonsterMaterial,
  DungeonBoss,
  ForgeRecipe,
  ForgeRecipeId,
  resolveCarvingDrop,
  calculateAffixStatValue
} from '@noite-faminta/shared';

export const FORGE_RECIPES: Record<ForgeRecipeId, ForgeRecipe> = {
  FORGE_WEAPON_BLADE: {
    id: 'FORGE_WEAPON_BLADE',
    name: 'Lâmina Forjada em Sangue & Prata',
    description: 'Arma consagrada nas brasas ocultas da noite. Corta carnes sobrenaturais.',
    targetSlot: 'WEAPON',
    baseRarity: 'RARE',
    requiredMaterials: [
      { materialTemplateId: 'mat-inq-heart', materialName: 'Coração de Inquisidor de Prata', count: 1 }
    ],
    goldCost: 150
  },
  FORGE_ARMOR_PLATE: {
    id: 'FORGE_ARMOR_PLATE',
    name: 'Couraça de Titã da Noite',
    description: 'Armadura pesada reforçada com tendões primordiais e placas sagradas.',
    targetSlot: 'ARMOR',
    baseRarity: 'RARE',
    requiredMaterials: [
      { materialTemplateId: 'mat-alpha-tendon', materialName: 'Tendão Hipertrofiado Ancestral', count: 1 }
    ],
    goldCost: 200
  },
  FORGE_AMULET_RELIC: {
    id: 'FORGE_AMULET_RELIC',
    name: 'Relíquia Oculta da Lua Carmesim',
    description: 'Amuleto imbuído com sangue ancestral. Amplifica a comunhão com as trevas.',
    targetSlot: 'AMULET',
    baseRarity: 'EPIC',
    requiredMaterials: [
      { materialTemplateId: 'mat-crimson-blood', materialName: 'Essência de Sangue Carmesim', count: 1 }
    ],
    goldCost: 350
  }
};

interface AffixTemplate {
  name: string;
  type: 'PREFIX' | 'SUFFIX';
  statBonusKey: keyof ItemAffix['statBonus'];
}

const PREFIX_TEMPLATES: AffixTemplate[] = [
  { name: 'Sanguinário', type: 'PREFIX', statBonusKey: 'lifeStealPercent' },
  { name: 'Carniceiro', type: 'PREFIX', statBonusKey: 'criticalChancePercent' },
  { name: 'Arcano Proibido', type: 'PREFIX', statBonusKey: 'occultism' },
  { name: 'Titânico', type: 'PREFIX', statBonusKey: 'vitality' }
];

const SUFFIX_TEMPLATES: AffixTemplate[] = [
  { name: 'da Lua Carmesim', type: 'SUFFIX', statBonusKey: 'strength' },
  { name: 'da Inquisição de Ferro', type: 'SUFFIX', statBonusKey: 'vitality' },
  { name: 'das Sombras Eternas', type: 'SUFFIX', statBonusKey: 'agility' },
  { name: 'da Prosperidade Obscura', type: 'SUFFIX', statBonusKey: 'goldBonusPercent' }
];

export function extractCarvingLoot(
  boss: DungeonBoss,
  rollRandom: () => number,
  luckBonus = 0
): MonsterMaterial[] {
  const loot: MonsterMaterial[] = [];
  for (const material of boss.carvingTable) {
    const outcome = resolveCarvingDrop(material, rollRandom(), luckBonus);
    if (outcome.obtained) {
      loot.push(material);
    }
  }
  return loot;
}

function generateAffix(
  template: AffixTemplate,
  rarity: ItemRarity,
  rollRandom: () => number
): ItemAffix {
  const statValue = calculateAffixStatValue(rarity, rollRandom());
  return {
    type: template.type,
    name: template.name,
    statBonus: {
      [template.statBonusKey]: statValue
    }
  };
}

export function executeAncestralForge(
  recipe: ForgeRecipe,
  rollRandom: () => number
): GameItem {
  const rarity = recipe.baseRarity;
  const prefixIdx = Math.floor(rollRandom() * PREFIX_TEMPLATES.length);
  const suffixIdx = Math.floor(rollRandom() * SUFFIX_TEMPLATES.length);

  const prefix = generateAffix(PREFIX_TEMPLATES[prefixIdx]!, rarity, rollRandom);
  const suffix = generateAffix(SUFFIX_TEMPLATES[suffixIdx]!, rarity, rollRandom);

  const baseAttack = recipe.targetSlot === 'WEAPON' ? 25 + Math.floor(rollRandom() * 15) : undefined;
  const baseDefense = recipe.targetSlot === 'ARMOR' ? 20 + Math.floor(rollRandom() * 12) : undefined;
  const baseMagicPower = recipe.targetSlot === 'AMULET' ? 18 + Math.floor(rollRandom() * 10) : undefined;

  return {
    id: crypto.randomUUID(),
    templateId: recipe.id,
    name: `${prefix.name} ${recipe.name} ${suffix.name}`,
    description: recipe.description,
    rarity,
    slot: recipe.targetSlot,
    levelRequirement: rarity === 'EPIC' ? 10 : 5,
    isEquipped: false,
    isTradable: true,
    baseStats: {
      ...(baseAttack ? { attack: baseAttack } : {}),
      ...(baseDefense ? { defense: baseDefense } : {}),
      ...(baseMagicPower ? { magicPower: baseMagicPower } : {})
    },
    affixes: [prefix, suffix]
  };
}
