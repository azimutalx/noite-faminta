import { Faction, Specialization } from './character.js';

export type DistrictId =
  | 'FINANCIAL_CENTER'
  | 'PORT_DOCKS'
  | 'HISTORIC_CATHEDRAL'
  | 'WILD_RESERVE';

export interface DistrictState {
  id: DistrictId;
  name: string;
  dominantFaction: Faction | 'NEUTRAL';
  dominantClanName: string;
  infamyVampire: number;
  infamyLycan: number;
  bonusDescription: string;
  weeklyDividendsPool: number;
}

export interface DistrictContestResult {
  success: boolean;
  districtId: DistrictId;
  newInfamyVampire: number;
  newInfamyLycan: number;
  dominantFaction: Faction | 'NEUTRAL';
  infamyGained: number;
  staminaSpent: number;
  narrative: string;
}

export interface DistrictDividendResult {
  success: boolean;
  goldClaimed: number;
  remainingPool: number;
  message: string;
}

export interface MercenaryContract {
  id: string;
  ownerId: string;
  ownerName: string;
  mercenaryName: string;
  faction: Faction;
  level: number;
  specialization: Specialization;
  rentalPriceGold: number;
  combatPower: number;
  isAvailable: boolean;
}
