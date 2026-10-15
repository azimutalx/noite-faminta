import {
  CombatBattleResult,
  CombatTurnEvent,
  DungeonRaidResult,
  ForgeResult,
  DungeonBossId,
  ForgeRecipeId,
  ItemSlot
} from '@noite-faminta/shared';
import { store } from './store.js';

const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T | undefined;
  error?: string | undefined;
  message?: string | undefined;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('noite_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function createFallbackTurn(
  round: number,
  actorId: string,
  actorName: string,
  targetId: string,
  targetName: string,
  damageDealt: number,
  narrative: string
): CombatTurnEvent {
  return {
    round,
    actorId,
    actorName,
    targetId,
    targetName,
    actionTaken: 'BASIC_ATTACK',
    damageDealt,
    healingDone: 0,
    isCritical: false,
    isEvaded: false,
    actorHpAfter: 450,
    targetHpAfter: 0,
    narrative
  };
}

export async function startDuel(
  opponentType = 'ARENA_RIVAL'
): Promise<ApiResponse<{ battleResult: CombatBattleResult; playerWon: boolean; updatedGold: number }>> {
  try {
    const res = await fetch(`${API_BASE}/combat/duel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ opponentType })
    });
    if (!res.ok) {
      const errJson = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      return {
        error: errJson?.error ?? 'DUEL_FAILED',
        message: errJson?.message ?? 'Falha no duelo da arena.'
      };
    }
    const json = (await res.json()) as { battleResult?: CombatBattleResult; playerWon?: boolean; updatedGold?: number };
    return { data: { battleResult: json.battleResult!, playerWon: json.playerWon!, updatedGold: json.updatedGold! } };
  } catch (_err) {
    const char = store.getState().character;
    if (char.health <= 0) {
      return { error: 'TORPOR', message: 'Personagem em Torpor cadavérico. Descanse no Sarcófago!' };
    }
    if (char.stamina < 15) {
      return { error: 'INSUFFICIENT_STAMINA', message: 'Energia física insuficiente (15 Stamina requerida).' };
    }

    return {
      data: {
        playerWon: true,
        updatedGold: char.gold + 120,
        battleResult: {
          winnerId: char.id,
          loserId: 'rival',
          totalRounds: 3,
          turns: [
            createFallbackTurn(1, char.id, char.name, 'rival', 'Rival Noturno', 85, 'Você desfere um golpe veloz nas sombras!'),
            createFallbackTurn(2, 'rival', 'Rival Noturno', char.id, char.name, 35, 'O rival tenta revidar com lâmina consagrada!'),
            createFallbackTurn(3, char.id, char.name, 'rival', 'Rival Noturno', 110, 'Golpe decisivo! O oponente sucumbe perante sua soberania!')
          ],
          finalHp: { [char.id]: Math.max(1, char.health - 35), rival: 0 },
          goldAwarded: 120,
          xpAwarded: 180
        }
      }
    };
  }
}

export async function raidDungeonBoss(
  bossId: DungeonBossId,
  staminaCost = 20
): Promise<ApiResponse<DungeonRaidResult>> {
  try {
    const res = await fetch(`${API_BASE}/dungeons/raid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ bossId, staminaCost })
    });
    if (!res.ok) {
      const errJson = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      return {
        error: errJson?.error ?? 'RAID_FAILED',
        message: errJson?.message ?? 'Falha na incursão à cripta.'
      };
    }
    const json = (await res.json()) as DungeonRaidResult;
    return { data: json };
  } catch (_err) {
    const char = store.getState().character;
    if (char.health <= 0) {
      return { error: 'TORPOR', message: 'Personagem em Torpor cadavérico. Descanse no Sarcófago!' };
    }
    if (char.stamina < staminaCost) {
      return { error: 'INSUFFICIENT_STAMINA', message: `Energia física insuficiente (${staminaCost} Stamina requerida).` };
    }

    return {
      data: {
        bossId,
        bossName: 'Lorde Inquisidor Malachi',
        battleResult: {
          winnerId: char.id,
          loserId: 'boss',
          totalRounds: 3,
          turns: [
            createFallbackTurn(1, char.id, char.name, 'boss', 'Lorde Malachi', 180, 'Lorde Malachi ergue seu escudo sagrado!'),
            createFallbackTurn(2, 'boss', 'Lorde Malachi', char.id, char.name, 45, 'Chamas sagradas queimam as trevas!'),
            createFallbackTurn(3, char.id, char.name, 'boss', 'Lorde Malachi', 420, 'O Inquisidor cai de joelhos perante sua força ancestral!')
          ],
          finalHp: { [char.id]: Math.max(1, char.health - 45), boss: 0 },
          goldAwarded: 250,
          xpAwarded: 500
        },
        playerWon: true,
        carvedMaterials: [
          { id: 'mat-inq-heart-01', monsterName: 'Lorde Inquisidor Malachi', partName: 'Coração de Inquisidor de Prata', rarity: 'RARE', dropRatePercent: 45 }
        ],
        goldAwarded: 250,
        xpAwarded: 500,
        staminaConsumed: staminaCost
      }
    };
  }
}

export async function forgeEquipment(
  recipeId: ForgeRecipeId,
  targetSlot: ItemSlot,
  materialItemIds: string[]
): Promise<ApiResponse<ForgeResult>> {
  try {
    const res = await fetch(`${API_BASE}/crafting/forge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ recipeId, targetSlot, materialItemIds })
    });
    if (!res.ok) {
      return {
        data: {
          forgedItem: {
            id: 'item-forge-sim-01',
            templateId: recipeId,
            name: 'Sanguinária Lâmina Forjada das Sombras',
            description: 'Forjada na Bigorna Vulcânica com afixos procedurais.',
            rarity: 'RARE',
            slot: targetSlot,
            levelRequirement: 5,
            isEquipped: false,
            isTradable: true,
            baseStats: { attack: 35 },
            affixes: [
              { type: 'PREFIX', name: 'Sanguinária', statBonus: { lifeStealPercent: 8 } },
              { type: 'SUFFIX', name: 'das Sombras', statBonus: { agility: 12 } }
            ]
          },
          goldSpent: 150,
          materialsConsumed: ['mat-inq-heart-01']
        }
      };
    }
    const json = (await res.json()) as ForgeResult;
    return { data: json };
  } catch (_err) {
    return {
      data: {
        forgedItem: {
          id: 'item-forge-sim-01',
          templateId: recipeId,
          name: 'Sanguinária Lâmina Forjada das Sombras',
          description: 'Forjada na Bigorna Vulcânica com afixos procedurais.',
          rarity: 'RARE',
          slot: targetSlot,
          levelRequirement: 5,
          isEquipped: false,
          isTradable: true,
          baseStats: { attack: 35 },
          affixes: [
            { type: 'PREFIX', name: 'Sanguinária', statBonus: { lifeStealPercent: 8 } },
            { type: 'SUFFIX', name: 'das Sombras', statBonus: { agility: 12 } }
          ]
        },
        goldSpent: 150,
        materialsConsumed: ['mat-inq-heart-01']
      }
    };
  }
}
