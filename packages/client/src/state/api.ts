import {
  CharacterProfile,
  HuntResolutionResult,
  CombatBattleResult,
  DungeonBoss,
  DungeonRaidResult,
  ForgeRecipe,
  ForgeResult,
  DungeonBossId,
  ForgeRecipeId,
  ItemSlot,
  MarketOrder,
  MarketBuyResult,
  OrderType
} from '@noite-faminta/shared';

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

export async function createCharacter(
  name: string,
  faction: 'VAMPIRE' | 'LYCAN',
  specialization: 'BRUTE_FORCE' | 'OCCULT_MAGIC' | 'HYBRID'
): Promise<ApiResponse<{ character: CharacterProfile }>> {
  try {
    const res = await fetch(`${API_BASE}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ name, faction, specialization })
    });
    const json = (await res.json()) as { character?: CharacterProfile; error?: string; message?: string };
    if (!res.ok) {
      return { error: json.error ?? 'ERRO_CRIACAO', message: json.message };
    }
    return { data: { character: json.character! } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function trainStat(
  stat: 'strength' | 'agility' | 'vitality' | 'occultism',
  points: number
): Promise<ApiResponse<{ character: CharacterProfile; message: string }>> {
  try {
    const res = await fetch(`${API_BASE}/characters/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ stat, points })
    });
    const json = (await res.json()) as { character?: CharacterProfile; error?: string; message?: string };
    if (!res.ok) {
      return { error: json.error ?? 'ERRO_TREINO', message: json.message };
    }
    return { data: { character: json.character!, message: json.message ?? 'Atributo evoluído!' } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function startHunt(
  targetType: 'STREET_MORTAL' | 'NOCTURNAL_PATROL' | 'INQUISITION_OUTPOST' | 'ANCIENT_CRYPT',
  staminaCost: number
): Promise<ApiResponse<{ outcome: HuntResolutionResult; updatedStatus: Partial<CharacterProfile> }>> {
  try {
    const res = await fetch(`${API_BASE}/hunting/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ targetType, staminaCost })
    });
    const json = (await res.json()) as {
      outcome?: HuntResolutionResult;
      updatedStatus?: Partial<CharacterProfile>;
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      return { error: json.error ?? 'ERRO_CACADA', message: json.message };
    }
    return {
      data: {
        outcome: json.outcome!,
        updatedStatus: json.updatedStatus!
      }
    };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function startDuel(
  opponentType = 'ARENA_RIVAL'
): Promise<ApiResponse<{ battleResult: CombatBattleResult; playerWon: boolean; updatedGold: number }>> {
  try {
    const res = await fetch(`${API_BASE}/combat/duel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ opponentType })
    });
    const json = (await res.json()) as {
      battleResult?: CombatBattleResult;
      playerWon?: boolean;
      updatedGold?: number;
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      return { error: json.error ?? 'ERRO_DUELO', message: json.message };
    }
    return {
      data: {
        battleResult: json.battleResult!,
        playerWon: json.playerWon!,
        updatedGold: json.updatedGold!
      }
    };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function listDungeonBosses(): Promise<ApiResponse<{ bosses: DungeonBoss[] }>> {
  try {
    const res = await fetch(`${API_BASE}/dungeons/bosses`, {
      method: 'GET',
      headers: { ...getAuthHeader() }
    });
    const json = (await res.json()) as { bosses?: DungeonBoss[]; error?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_BOSSES' };
    return { data: { bosses: json.bosses ?? [] } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function raidDungeonBoss(
  bossId: DungeonBossId,
  staminaCost = 20
): Promise<ApiResponse<DungeonRaidResult>> {
  try {
    const res = await fetch(`${API_BASE}/dungeons/raid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ bossId, staminaCost })
    });
    const json = (await res.json()) as DungeonRaidResult & { error?: string; message?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_RAID', message: json.message };
    return { data: json };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function listForgeRecipes(): Promise<ApiResponse<{ recipes: ForgeRecipe[] }>> {
  try {
    const res = await fetch(`${API_BASE}/crafting/recipes`, {
      method: 'GET',
      headers: { ...getAuthHeader() }
    });
    const json = (await res.json()) as { recipes?: ForgeRecipe[]; error?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_RECIPES' };
    return { data: { recipes: json.recipes ?? [] } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function listInventoryMaterials(): Promise<
  ApiResponse<{ materials: Array<{ id: string; template_id: string; name: string }> }>
> {
  try {
    const res = await fetch(`${API_BASE}/crafting/materials`, {
      method: 'GET',
      headers: { ...getAuthHeader() }
    });
    const json = (await res.json()) as {
      materials?: Array<{ id: string; template_id: string; name: string }>;
      error?: string;
    };
    if (!res.ok) return { error: json.error ?? 'ERRO_MATERIALS' };
    return { data: { materials: json.materials ?? [] } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
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
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ recipeId, targetSlot, materialItemIds })
    });
    const json = (await res.json()) as ForgeResult & { error?: string; message?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_FORGE', message: json.message };
    return { data: json };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function fetchMarketOrders(): Promise<ApiResponse<{ orders: MarketOrder[] }>> {
  try {
    const res = await fetch(`${API_BASE}/market/orders`, { method: 'GET', headers: { ...getAuthHeader() } });
    const json = (await res.json()) as { orders?: MarketOrder[]; error?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_ORDERS' };
    return { data: { orders: json.orders ?? [] } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function buyMarketOrder(orderId: string): Promise<ApiResponse<{ message: string; result: MarketBuyResult }>> {
  try {
    const res = await fetch(`${API_BASE}/market/orders/${orderId}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    const json = (await res.json()) as { message?: string; result?: MarketBuyResult; error?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_BUY_ORDER', message: json.error };
    return { data: { message: json.message ?? 'Sucesso', result: json.result! } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function createMarketOrder(payload: {
  orderType: OrderType;
  priceGold?: number | undefined;
  tokenAmount?: number | undefined;
}): Promise<ApiResponse<{ message: string; orderId?: string | undefined }>> {
  try {
    const res = await fetch(`${API_BASE}/market/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    const json = (await res.json()) as { message?: string; orderId?: string; error?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_CREATE_ORDER' };
    return { data: { message: json.message ?? 'Ordem criada!', ...(json.orderId ? { orderId: json.orderId } : {}) } };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}
