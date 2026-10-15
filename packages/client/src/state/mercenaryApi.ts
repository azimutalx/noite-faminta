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
    const json = (await res.json()) as { mercenaries: MercenaryContract[]; error?: string };
    if (!res.ok) return { error: json.error ?? 'Falha ao listar mercenários' };
    return { data: { mercenaries: json.mercenaries } };
  } catch (err) {
    return { error: (err as Error).message };
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
    const json = (await res.json()) as {
      mercenary?: MercenaryContract;
      updatedGold?: number;
      message?: string;
      error?: string;
    };
    if (!res.ok || !json.mercenary) return { error: json.error ?? 'Falha ao contratar mercenário' };
    return {
      data: {
        mercenary: json.mercenary,
        updatedGold: json.updatedGold ?? 0,
        message: json.message ?? 'Mercenário contratado com sucesso!'
      }
    };
  } catch (err) {
    return { error: (err as Error).message };
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
    const json = (await res.json()) as {
      contract?: MercenaryContract;
      message?: string;
      error?: string;
    };
    if (!res.ok || !json.contract) return { error: json.error ?? 'Falha ao disponibilizar personagem' };
    return {
      data: {
        contract: json.contract,
        message: json.message ?? 'Personagem registrado na Taverna com sucesso!'
      }
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
