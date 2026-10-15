import { DistrictId, DistrictState, DistrictContestResult, DistrictDividendResult } from '@noite-faminta/shared';

const API_BASE = '/api/districts';

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

export async function fetchDistrictsStatus(): Promise<ApiResponse<{ districts: DistrictState[] }>> {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      headers: { ...getAuthHeader() }
    });
    const json = (await res.json()) as { districts: DistrictState[]; error?: string };
    if (!res.ok) return { error: json.error ?? 'Falha ao obter status dos distritos' };
    return { data: { districts: json.districts } };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function contestDistrict(
  districtId: DistrictId,
  goldInvestment = 0,
  staminaCost = 15
): Promise<ApiResponse<{ contestResult: DistrictContestResult; updatedGold: number; updatedStamina: number }>> {
  try {
    const res = await fetch(`${API_BASE}/contest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ districtId, goldInvestment, staminaCost })
    });
    const json = (await res.json()) as {
      contestResult?: DistrictContestResult;
      updatedGold?: number;
      updatedStamina?: number;
      error?: string;
    };
    if (!res.ok || !json.contestResult) return { error: json.error ?? 'Falha na disputa territorial' };
    return {
      data: {
        contestResult: json.contestResult,
        updatedGold: json.updatedGold ?? 0,
        updatedStamina: json.updatedStamina ?? 0
      }
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function claimDividends(
  districtId: DistrictId
): Promise<ApiResponse<{ dividendResult: DistrictDividendResult; updatedGold: number }>> {
  try {
    const res = await fetch(`${API_BASE}/claim-dividends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ districtId })
    });
    const json = (await res.json()) as {
      dividendResult?: DistrictDividendResult;
      updatedGold?: number;
      error?: string;
    };
    if (!res.ok || !json.dividendResult) return { error: json.error ?? 'Falha ao recolher dividendos' };
    return {
      data: {
        dividendResult: json.dividendResult,
        updatedGold: json.updatedGold ?? 0
      }
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
