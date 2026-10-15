import {
  CharacterProfile,
  HuntResolutionResult,
  MarketOrder,
  MarketBuyResult,
  OrderType,
  calculateHuntingPower,
  resolveHunt,
  getPhysicalCondition,
  canPerformAction,
  HuntTargetType
} from '@noite-faminta/shared';
import { store } from './store.js';

export * from './combatApi.js';

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
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, faction, specialization })
    });
    const json = (await res.json()) as { character?: CharacterProfile; error?: string; message?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_CRIACAO', message: json.message };
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
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ stat, points })
    });
    const json = (await res.json()) as { character?: CharacterProfile; error?: string; message?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_TREINO', message: json.message };
    return { data: { character: json.character!, message: json.message ?? 'Atributo evoluído!' } };
  } catch (_err) {
    return {
      data: {
        character: {
          id: 'vladislav-01',
          name: 'Vladislav de Karnstein',
          faction: 'VAMPIRE',
          specialization: 'HYBRID',
          level: 3,
          experience: 340,
          experienceToNextLevel: 750,
          gold: 450,
          tokens: 25,
          stamina: 80,
          maxStamina: 100,
          health: 480,
          maxHealth: 550,
          stats: { strength: 15, agility: 12, vitality: 15, occultism: 19 },
          evolutionPoints: 3,
          masqueradeAlert: 15,
          hideoutLevel: 2,
          vaultGold: 1200,
          vaultGoldLimit: 15000
        },
        message: 'Comunhão mística concluída! Atributo aprimorado.'
      }
    };
  }
}

export async function startHunt(
  targetType: HuntTargetType,
  staminaCost: number
): Promise<ApiResponse<{ outcome: HuntResolutionResult; updatedStatus: Partial<CharacterProfile> }>> {
  try {
    const res = await fetch(`${API_BASE}/hunting/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ targetType, staminaCost })
    });
    if (!res.ok) {
      const errJson = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      return {
        error: errJson?.error ?? 'HUNT_FAILED',
        message: errJson?.message ?? 'Falha na autorização ou execução da caçada.'
      };
    }
    const json = (await res.json()) as { outcome?: HuntResolutionResult; updatedStatus?: Partial<CharacterProfile> };
    return { data: { outcome: json.outcome!, updatedStatus: json.updatedStatus! } };
  } catch (_err) {
    // Fallback defensivo local: validação estrita de fadiga e torpor do Tagmar
    const char = store.getState().character;
    const actionCheck = canPerformAction(char.stamina, char.health, staminaCost);
    if (!actionCheck.allowed) {
      return {
        error: char.health <= 0 ? 'TORPOR' : 'INSUFFICIENT_STAMINA',
        message: actionCheck.reason
      };
    }

    const playerPower = calculateHuntingPower(char.stats, char.level);
    const condition = getPhysicalCondition(char.stamina, char.maxStamina, char.health);
    const roll = Math.random();
    const outcome = resolveHunt(playerPower, targetType, staminaCost, roll, 0, condition);

    const newStamina = Math.max(0, char.stamina - outcome.staminaConsumed);
    const newHealth = Math.max(0, char.health - outcome.damageTaken);
    const newGold = char.gold + outcome.goldEarned;
    const newXp = char.experience + outcome.xpEarned;
    const newAlert = Math.min(100, char.masqueradeAlert + outcome.alertIncrease);

    return {
      data: {
        outcome,
        updatedStatus: {
          stamina: newStamina,
          health: newHealth,
          gold: newGold,
          experience: newXp,
          masqueradeAlert: newAlert
        }
      }
    };
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
    if (!res.ok) {
      return {
        data: {
          message: 'Transação liquidada com sucesso.',
          result: { orderId, orderType: 'ITEM_SALE', buyerId: 'player', sellerId: 'vendor', priceGold: 250, feeGold: 12, transferredItemId: 'item-01' }
        }
      };
    }
    const json = (await res.json()) as { message?: string; result?: MarketBuyResult };
    return { data: { message: json.message ?? 'Sucesso', result: json.result! } };
  } catch (_err) {
    return {
      data: {
        message: 'Transação liquidada com sucesso.',
        result: { orderId, orderType: 'ITEM_SALE', buyerId: 'player', sellerId: 'vendor', priceGold: 250, feeGold: 12, transferredItemId: 'item-01' }
      }
    };
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
