import { CharacterProfile } from '@noite-faminta/shared';

export type ActiveTab = 'refugio' | 'arvore' | 'metropole' | 'masmorras' | 'taverna';

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
  logs: LogMessage[];
  materials: MaterialItemSummary[];
  isLoading: boolean;
}

const DEFAULT_CHARACTER: CharacterProfile = {
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
  health: 480,
  maxHealth: 550,
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
  vaultGoldLimit: 15000,
  hideoutRooms: {
    throne_sarcophagus: 1,
    catacomb_vault: 1,
    blood_forge: 1,
    ritual_sanctum: 0,
    gargoyle_parapet: 0,
    minion_crypt: 0
  }
};

type Listener = (state: GameState) => void;

class StateStore {
  private state: GameState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const saved = localStorage.getItem('noite_character_state');
    const rawChar = saved ? (JSON.parse(saved) as CharacterProfile) : DEFAULT_CHARACTER;
    const character: CharacterProfile = {
      ...DEFAULT_CHARACTER,
      ...rawChar,
      hideoutRooms: {
        ...(DEFAULT_CHARACTER.hideoutRooms ?? {}),
        ...(rawChar.hideoutRooms ?? {})
      }
    };
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryTab = urlParams?.get('tab') as ActiveTab | null;
    const initialTab = queryTab && ['refugio', 'arvore', 'metropole', 'masmorras', 'taverna'].includes(queryTab) ? queryTab : 'refugio';
    this.state = {
      character,
      activeTab: initialTab,
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

  public updateCharacter(updater: Partial<CharacterProfile>): void {
    this.state.character = {
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
    localStorage.setItem('noite_character_state', JSON.stringify(this.state.character));
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
