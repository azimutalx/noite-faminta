import { CharacterProfile, HideoutStageInfo } from '@noite-faminta/shared';

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

export async function upgradeHideout(): Promise<ApiResponse<{
  message: string;
  character: CharacterProfile;
  stage: HideoutStageInfo;
}>> {
  try {
    const res = await fetch(`${API_BASE}/characters/hideout/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = (await res.json()) as {
      message?: string;
      character?: CharacterProfile;
      stage?: HideoutStageInfo;
      error?: string;
    };
    if (!res.ok) {
      return { error: json.error ?? 'ERRO_UPGRADE_HIDEOUT', message: json.message ?? json.error };
    }
    return {
      data: {
        message: json.message ?? 'Refúgio evoluído com sucesso!',
        character: json.character!,
        stage: json.stage!
      }
    };
  } catch (err) {
    return { error: 'NETWORK_ERROR', message: String(err) };
  }
}

export const ascendHideout = upgradeHideout;

