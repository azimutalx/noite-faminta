import { CharacterStats, Faction } from './character.js';

export type GambitCondition =
  | 'HP_BELOW_30'
  | 'ENEMY_IS_LYCAN'
  | 'ENEMY_IS_VAMPIRE'
  | 'ENEMY_EVADING'
  | 'IN_FRENZY'
  | 'ALWAYS';

export type GambitAction =
  | 'BLOOD_DRAIN_RITE'
  | 'LUPINE_HEAL'
  | 'SHIELD_BREAKER_STRIKE'
  | 'SHADOW_EVASION'
  | 'FERAL_RAMPAGE'
  | 'BASIC_ATTACK';

export interface GambitRule {
  id: string;
  condition: GambitCondition;
  action: GambitAction;
  priority: number; // 1 (mais alta) a 5 (mais baixa)
}

export interface CombatFighter {
  id: string;
  name: string;
  faction: Faction;
  level: number;
  health: number;
  maxHealth: number;
  stats: CharacterStats;
  gambits: GambitRule[];
  isInFrenzy?: boolean | undefined;
  isEvading?: boolean | undefined;
}

export interface CombatTurnEvent {
  round: number;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  actionTaken: GambitAction;
  triggeredCondition?: GambitCondition | undefined;
  damageDealt: number;
  healingDone: number;
  isCritical: boolean;
  isEvaded: boolean;
  actorHpAfter: number;
  targetHpAfter: number;
  narrative: string;
}

export interface CombatBattleResult {
  winnerId: string;
  loserId: string;
  totalRounds: number;
  turns: CombatTurnEvent[];
  finalHp: Record<string, number>;
  xpAwarded: number;
  goldAwarded: number;
}
