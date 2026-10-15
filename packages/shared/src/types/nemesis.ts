import { GambitRule, CombatBattleResult } from './combat.js';

export type NemesisTrait =
  | 'HOLY_BLADE'
  | 'SILVER_ARMOR'
  | 'PURIFYING_FIRE'
  | 'RELENTLESS_TRACKER';

export interface InquisitionNemesis {
  id: string;
  name: string;
  title: string;
  rankLevel: number;
  health: number;
  maxHealth: number;
  stats: {
    strength: number;
    agility: number;
    vitality: number;
    occultism: number;
  };
  traits: NemesisTrait[];
  killCount: number;
  status: 'HUNTING' | 'DEFEATED';
  gambits: GambitRule[];
}

export interface NemesisPurgeResult {
  nemesis: InquisitionNemesis;
  battleResult: CombatBattleResult;
  playerWon: boolean;
  alertCleared: boolean;
  holyRelicName?: string | undefined;
  goldAwarded: number;
  xpAwarded: number;
}
