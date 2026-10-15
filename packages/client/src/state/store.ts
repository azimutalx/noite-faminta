import {
  CharacterProfile,
  HideoutChamberId,
  HIDEOUT_CHAMBERS,
  calculateChamberCost,
  normalizeCharacterStats
} from '@noite-faminta/shared';

export type ActiveTab = 'overview' | 'refugio' | 'arvore' | 'metropole' | 'masmorras' | 'taverna';
export type RefugioSubTab = 'chambers' | 'panorama' | 'arsenal' | 'gambits';

export interface UIState {
  refugioSubTab: RefugioSubTab;
  inspectedChamberId: HideoutChamberId | null;
  torchLightingActive: boolean;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  text: string;
  type: 'success' | 'danger' | 'gold' | 'info';
}

export interface MaterialItemSummary {
  id: string;
  template_id: string;
  name: string;
}

export interface GameState {
  character: CharacterProfile;
  activeTab: ActiveTab;
  ui: UIState;
  logs: LogMessage[];
  materials: MaterialItemSummary[];
  isLoading: boolean;
}

const RAW_DEFAULT_CHARACTER: CharacterProfile = {
  id: 'caimita-primordial-01',
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
  health: 425,
  maxHealth: 425,
  stats: {
    strength: 14,
    agility: 12,
    vitality: 15,
    occultism: 18
  },
  evolutionPoints: 4,
  masqueradeAlert: 15,
  hideoutLevel: 2,
  vaultGold: 1200,
  vaultGoldLimit: 30000,
  hideoutRooms: {
    throne_sarcophagus: 1,
    catacomb_vault: 1,
    blood_forge: 1,
    ritual_sanctum: 0,
    gargoyle_parapet: 0,
    minion_crypt: 0
  }
};

const DEFAULT_CHARACTER = normalizeCharacterStats(RAW_DEFAULT_CHARACTER);

type Listener = (state: GameState) => void;

class StateStore {
  private state: GameState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    const saved = hasStorage ? localStorage.getItem('noite_character_state') : null;
    const rawChar = saved ? (JSON.parse(saved) as CharacterProfile) : DEFAULT_CHARACTER;
    const mergedChar: CharacterProfile = {
      ...DEFAULT_CHARACTER,
      ...rawChar,
      stats: {
        ...DEFAULT_CHARACTER.stats,
        ...(rawChar.stats ?? {})
      },
      hideoutRooms: {
        ...(DEFAULT_CHARACTER.hideoutRooms ?? {}),
        ...(rawChar.hideoutRooms ?? {})
      }
    };
    const character = normalizeCharacterStats(mergedChar);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryTab = urlParams?.get('tab') as ActiveTab | null;
    const initialTab = queryTab && ['overview', 'refugio', 'arvore', 'metropole', 'masmorras', 'taverna'].includes(queryTab) ? queryTab : 'overview';

    this.state = {
      character,
      activeTab: initialTab,
      ui: {
        refugioSubTab: 'chambers',
        inspectedChamberId: null,
        torchLightingActive: false
      },
      logs: [
        {
          id: '1',
          timestamp: new Date().toLocaleTimeString(),
          text: 'Conexão estabelecida com a Metrópole. O Véu da Noite protege suas ações.',
          type: 'info'
        }
      ],
      materials: [],
      isLoading: false
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public setActiveTab(tab: ActiveTab): void {
    this.state.activeTab = tab;
    this.notify();
  }

  public setRefugioSubTab(subTab: RefugioSubTab): void {
    this.state.ui = {
      ...this.state.ui,
      refugioSubTab: subTab,
      inspectedChamberId: null
    };
    this.notify();
  }

  public setInspectedChamber(chamberId: HideoutChamberId | null): void {
    this.state.ui = { ...this.state.ui, inspectedChamberId: chamberId };
    this.notify();
  }

  public toggleTorchLighting(): void {
    const nextActive = !this.state.ui.torchLightingActive;
    this.state.ui = { ...this.state.ui, torchLightingActive: nextActive };
    this.addLog(
      nextActive ? '🕯️ As tochas carmesins do santuário foram acesas!' : '🌙 As tochas foram apagadas. A luz lunar penetra as criptas.',
      'info'
    );
  }

  public upgradeChamber(chamberId: HideoutChamberId): boolean {
    const rooms = { ...(this.state.character.hideoutRooms ?? {}) };
    const currentLvl = rooms[chamberId] ?? 0;
    const cfg = HIDEOUT_CHAMBERS[chamberId];
    if (!cfg || currentLvl >= cfg.maxLevel) return false;

    const cost = calculateChamberCost(chamberId, currentLvl);
    if (this.state.character.gold < cost) {
      this.addLog(`Ouro insuficiente para erguer esta ala. Necessário: ${cost.toLocaleString('pt-BR')} Gold.`, 'danger');
      return false;
    }

    const nextLvl = currentLvl + 1;
    rooms[chamberId] = nextLvl;

    const updatedChar: CharacterProfile = normalizeCharacterStats({
      ...this.state.character,
      gold: this.state.character.gold - cost,
      hideoutRooms: rooms
    });

    this.updateCharacter(updatedChar);

    this.addLog(
      `🧱 OBRA GÓTICA CONCLUÍDA! A ala [${cfg.name}] ascendeu para o Nível ${nextLvl}!`,
      'gold'
    );
    return true;
  }

  public restAtSanctuary(): boolean {
    const isHealthFull = this.state.character.health >= this.state.character.maxHealth;
    const isStaminaFull = this.state.character.stamina >= this.state.character.maxStamina;
    if (isHealthFull && isStaminaFull) {
      this.addLog('Sua vitalidade e energia já estão no ápice (Revigorado).', 'info');
      return false;
    }
    this.updateCharacter({
      health: this.state.character.maxHealth,
      stamina: this.state.character.maxStamina
    });
    this.addLog(
      '⚰️ Você repousou no sarcófago imperial das catacumbas: Vitalidade e Energia Física 100% restauradas (Revigorado pelo Tagmar)!',
      'success'
    );
    return true;
  }

  public depositToVault(): number {
    const available = Math.min(
      this.state.character.gold,
      this.state.character.vaultGoldLimit - this.state.character.vaultGold
    );
    if (available <= 0) {
      this.addLog('Cofre blindado lotado ou sem ouro livre na bolsa.', 'info');
      return 0;
    }
    this.updateCharacter({
      gold: this.state.character.gold - available,
      vaultGold: this.state.character.vaultGold + available
    });
    this.addLog(`Depositou ${available.toLocaleString('pt-BR')} Gold nas arcas blindadas do cofre.`, 'gold');
    return available;
  }

  public updateCharacter(updater: Partial<CharacterProfile>): void {
    const merged: CharacterProfile = {
      ...this.state.character,
      ...updater,
      stats: {
        ...this.state.character.stats,
        ...(updater.stats ?? {})
      },
      hideoutRooms: {
        ...(this.state.character.hideoutRooms ?? {}),
        ...(updater.hideoutRooms ?? {})
      }
    };

    this.state.character = normalizeCharacterStats(merged);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('noite_character_state', JSON.stringify(this.state.character));
      } catch {
        // Ignora erros de quota excedida ou navegação restrita
      }
    }
    this.notify();
  }

  public addLog(text: string, type: LogMessage['type'] = 'info'): void {
    const newLog: LogMessage = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      text,
      type
    };
    this.state.logs = [newLog, ...this.state.logs.slice(0, 25)];
    this.notify();
  }

  public setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.notify();
  }

  public setMaterials(materials: MaterialItemSummary[]): void {
    this.state.materials = materials;
    this.notify();
  }

  public addMaterials(newMats: MaterialItemSummary[]): void {
    this.state.materials = [...this.state.materials, ...newMats];
    this.notify();
  }
}

export const store = new StateStore();
