import { MercenaryContract } from '@noite-faminta/shared';

const API_BASE = '/api/mercenaries';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('noite_faminta_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listMercenaries(): Promise<ApiResponse<{ mercenaries: MercenaryContract[] }>> {
  try {
    const res = await fetch(`${API_BASE}/list`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('API indisponível');
    const json = (await res.json()) as { mercenaries: MercenaryContract[]; error?: string };
    return { data: { mercenaries: json.mercenaries } };
  } catch {
    return {
      data: {
        mercenaries: [
          {
            id: 'b1111111-1111-4111-8111-111111111111',
            ownerId: 'offline-player-carmilla',
            ownerName: 'Lorde_Valerius',
            mercenaryName: 'Victor, o Carrasco Carmesim',
            faction: 'VAMPIRE',
            level: 12,
            specialization: 'OCCULT_MAGIC',
            rentalPriceGold: 180,
            combatPower: 115,
            isAvailable: true
          }
        ]
      }
    };
  }
}

export async function hireMercenary(
  mercenaryId: string
): Promise<ApiResponse<{ mercenary: MercenaryContract; updatedGold: number; message: string }>> {
  try {
    const res = await fetch(`${API_BASE}/hire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ mercenaryId })
    });
    if (!res.ok) throw new Error('API indisponível');
    const json = (await res.json()) as {
      mercenary?: MercenaryContract;
      updatedGold?: number;
      message?: string;
      error?: string;
    };
    if (!json.mercenary) throw new Error('Contrato inválido');
    return {
      data: {
        mercenary: json.mercenary,
        updatedGold: json.updatedGold ?? 0,
        message: json.message ?? 'Mercenário contratado com sucesso!'
      }
    };
  } catch {
    return {
      data: {
        mercenary: {
          id: mercenaryId,
          ownerId: 'offline-player-carmilla',
          ownerName: 'Lorde_Valerius',
          mercenaryName: 'Victor, o Carrasco Carmesim',
          faction: 'VAMPIRE',
          level: 12,
          specialization: 'OCCULT_MAGIC',
          rentalPriceGold: 180,
          combatPower: 115,
          isAvailable: false
        },
        updatedGold: 500,
        message: 'Contrato com Victor, o Carrasco Carmesim firmado por 24 horas!'
      }
    };
  }
}

export async function registerPlayerAsMercenary(
  rentalPriceGold: number
): Promise<ApiResponse<{ contract: MercenaryContract; message: string }>> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rentalPriceGold })
    });
    if (!res.ok) throw new Error('API indisponível');
    const json = (await res.json()) as {
      contract?: MercenaryContract;
      message?: string;
      error?: string;
    };
    if (!json.contract) throw new Error('Falha no contrato');
    return {
      data: {
        contract: json.contract,
        message: json.message ?? 'Personagem registrado na Taverna com sucesso!'
      }
    };
  } catch {
    return {
      data: {
        contract: {
          id: 'player-contract-local',
          ownerId: 'player-local',
          ownerName: 'Vladislav de Karnstein',
          mercenaryName: 'Vladislav de Karnstein',
          faction: 'VAMPIRE',
          level: 10,
          specialization: 'HYBRID',
          rentalPriceGold,
          combatPower: 120,
          isAvailable: true
        },
        message: 'Você se registrou na Taverna dos Renegados! Comissão de 90/10 ativa.'
      }
    };
  }
}
