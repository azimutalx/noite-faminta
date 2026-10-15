import { DungeonBoss, DungeonBossId } from '@noite-faminta/shared';

export const DUNGEON_BOSSES: Record<DungeonBossId, DungeonBoss> = {
  INQUISITOR_MALACHI: {
    id: 'INQUISITOR_MALACHI',
    name: 'Lorde Inquisidor Malachi',
    title: 'O Flagelo Sagrado da Noite',
    description: 'Comandante supremo da Ordem da Prata. Empunha lâminas consagradas e odeia criaturas das trevas.',
    faction: 'INQUISITION',
    level: 5,
    health: 1200,
    maxHealth: 1200,
    stats: {
      strength: 28,
      agility: 22,
      vitality: 35,
      occultism: 15
    },
    gambits: [
      { id: 'm1', condition: 'HP_BELOW_30', action: 'SHIELD_BREAKER_STRIKE', priority: 1 },
      { id: 'm2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
    ],
    carvingTable: [
      {
        id: 'mat-inq-heart',
        monsterName: 'Lorde Inquisidor Malachi',
        partName: 'Coração de Inquisidor de Prata',
        rarity: 'RARE',
        dropRatePercent: 45
      },
      {
        id: 'mat-inq-plate',
        monsterName: 'Lorde Inquisidor Malachi',
        partName: 'Placa de Armadura Consagrada',
        rarity: 'UNCOMMON',
        dropRatePercent: 75
      }
    ],
    staminaCost: 20,
    goldReward: 250,
    xpReward: 500
  },
  ANCIENT_FENRIR: {
    id: 'ANCIENT_FENRIR',
    name: 'Alfa Ancestral Fenrir',
    title: 'A Fera da Lua de Sangue',
    description: 'Um Lycan primordial corrompido pela fúria de séculos. Sua regeneração e força são temíveis.',
    faction: 'LYCAN',
    level: 8,
    health: 1800,
    maxHealth: 1800,
    stats: {
      strength: 42,
      agility: 28,
      vitality: 45,
      occultism: 12
    },
    gambits: [
      { id: 'f1', condition: 'HP_BELOW_30', action: 'LUPINE_HEAL', priority: 1 },
      { id: 'f2', condition: 'IN_FRENZY', action: 'FERAL_RAMPAGE', priority: 2 },
      { id: 'f3', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 3 }
    ],
    carvingTable: [
      {
        id: 'mat-alpha-fang',
        monsterName: 'Alfa Ancestral Fenrir',
        partName: 'Presa de Titã Lupino',
        rarity: 'RARE',
        dropRatePercent: 40
      },
      {
        id: 'mat-alpha-tendon',
        monsterName: 'Alfa Ancestral Fenrir',
        partName: 'Tendão Hipertrofiado Ancestral',
        rarity: 'UNCOMMON',
        dropRatePercent: 70
      }
    ],
    staminaCost: 25,
    goldReward: 420,
    xpReward: 850
  },
  CRIMSON_CARMILLA: {
    id: 'CRIMSON_CARMILLA',
    name: 'Vampira Carmesim Carmilla',
    title: 'A Soberana da Cripta Esquecida',
    description: 'Uma arquivampira que sobreviveu à Grande Purga. Manipula o sangue dos seus oponentes.',
    faction: 'VAMPIRE',
    level: 12,
    health: 2400,
    maxHealth: 2400,
    stats: {
      strength: 30,
      agility: 48,
      vitality: 40,
      occultism: 55
    },
    gambits: [
      { id: 'c1', condition: 'HP_BELOW_30', action: 'BLOOD_DRAIN_RITE', priority: 1 },
      { id: 'c2', condition: 'ENEMY_EVADING', action: 'SHADOW_EVASION', priority: 2 },
      { id: 'c3', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 3 }
    ],
    carvingTable: [
      {
        id: 'mat-crimson-blood',
        monsterName: 'Vampira Carmesim Carmilla',
        partName: 'Essência de Sangue Carmesim',
        rarity: 'EPIC',
        dropRatePercent: 30
      },
      {
        id: 'mat-carmilla-veil',
        monsterName: 'Vampira Carmesim Carmilla',
        partName: 'Véu Noturno Ancestral',
        rarity: 'RARE',
        dropRatePercent: 60
      }
    ],
    staminaCost: 30,
    goldReward: 650,
    xpReward: 1300
  }
};

export function getDungeonBoss(bossId: DungeonBossId): DungeonBoss | undefined {
  return DUNGEON_BOSSES[bossId];
}

export function listDungeonBosses(): DungeonBoss[] {
  return Object.values(DUNGEON_BOSSES);
}
