import crypto from 'node:crypto';
import { InquisitionNemesis, NemesisTrait } from '@noite-faminta/shared';

const NEMESIS_NAMES = [
  'Comandante Silva',
  'Frei Tomás',
  'Inquisidor Belisário',
  'Irmã Beatriz',
  'Capitão Valério',
  'Prelado Justino'
];

const NEMESIS_TITLES = [
  'O Flagelo dos Imortais',
  'O Caçador da Lua Prateada',
  'O Portador da Chama Sagrada',
  'O Martelo da Ordem de Ferro',
  'O Executor Inexorável'
];

const AVAILABLE_TRAITS: NemesisTrait[] = [
  'HOLY_BLADE',
  'SILVER_ARMOR',
  'PURIFYING_FIRE',
  'RELENTLESS_TRACKER'
];

export function generateProceduralNemesis(
  characterLevel: number,
  killCount = 0
): InquisitionNemesis {
  const nameIdx = crypto.randomInt(0, NEMESIS_NAMES.length);
  const titleIdx = crypto.randomInt(0, NEMESIS_TITLES.length);
  const traitIdx = crypto.randomInt(0, AVAILABLE_TRAITS.length);

  const rankLevel = Math.max(1, characterLevel + killCount);
  const baseHealth = 600 + (rankLevel * 120);

  const baseStrength = 15 + (rankLevel * 4);
  const baseAgility = 14 + (rankLevel * 3);
  const baseVitality = 18 + (rankLevel * 4);
  const baseOccultism = 12 + (rankLevel * 3);

  const trait = AVAILABLE_TRAITS[traitIdx] ?? 'HOLY_BLADE';

  return {
    id: `nemesis-${crypto.randomUUID()}`,
    name: NEMESIS_NAMES[nameIdx] ?? 'Caçador Inquisidor de Prata',
    title: NEMESIS_TITLES[titleIdx] ?? 'O Executor Inexorável',
    rankLevel,
    health: baseHealth,
    maxHealth: baseHealth,
    stats: {
      strength: baseStrength,
      agility: baseAgility,
      vitality: baseVitality,
      occultism: baseOccultism
    },
    traits: [trait],
    killCount,
    status: 'HUNTING',
    gambits: [
      { id: 'nem-g1', condition: 'HP_BELOW_30', action: 'SHIELD_BREAKER_STRIKE', priority: 1 },
      { id: 'nem-g2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
    ]
  };
}
