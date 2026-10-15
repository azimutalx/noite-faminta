import { InquisitionNemesis, NemesisPurgeResult } from '@noite-faminta/shared';

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

export async function fetchCurrentNemesis(): Promise<
  ApiResponse<{ masqueradeAlert: number; activeNemesis: InquisitionNemesis | null }>
> {
  try {
    const res = await fetch(`${API_BASE}/nemesis/current`, {
      method: 'GET',
      headers: { ...getAuthHeader() }
    });
    const json = (await res.json()) as {
      masqueradeAlert: number;
      activeNemesis: InquisitionNemesis | null;
      error?: string;
    };
    if (!res.ok) return { error: json.error ?? 'ERRO_NEMESIS' };
    return { data: json };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export async function purgeNemesis(): Promise<ApiResponse<NemesisPurgeResult>> {
  try {
    const res = await fetch(`${API_BASE}/nemesis/purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    const json = (await res.json()) as NemesisPurgeResult & { error?: string; message?: string };
    if (!res.ok) return { error: json.error ?? 'ERRO_PURGE', message: json.message };
    return { data: json };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}
