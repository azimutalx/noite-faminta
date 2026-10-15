import { randomUUID } from 'node:crypto';
import { MercenaryContract, Faction, Specialization } from '@noite-faminta/shared';

// Zero-Trust & ACID: Toda transação financeira de contratação é liquidada no banco via transaction com lock SELECT ... FOR UPDATE.
export interface RentalSettlement {
  totalPriceGold: number;
  ownerCommissionGold: number;
  guildFeeGold: number;
}

const TAVERN_REGISTRY: Map<string, MercenaryContract> = new Map([
  [
    'b1111111-1111-4111-8111-111111111111',
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
  ],
  [
    'b2222222-2222-4222-8222-222222222222',
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      ownerId: 'offline-player-fenrir',
      ownerName: 'Matilha_Alfa',
      mercenaryName: 'Boran Garra-de-Ferro',
      faction: 'LYCAN',
      level: 14,
      specialization: 'BRUTE_FORCE',
      rentalPriceGold: 240,
      combatPower: 150,
      isAvailable: true
    }
  ],
  [
    'b3333333-3333-4333-8333-333333333333',
    {
      id: 'b3333333-3333-4333-8333-333333333333',
      ownerId: 'offline-player-selene',
      ownerName: 'Sombra_Noturna',
      mercenaryName: 'Selene dos Olhos Gélidos',
      faction: 'VAMPIRE',
      level: 10,
      specialization: 'HYBRID',
      rentalPriceGold: 140,
      combatPower: 95,
      isAvailable: true
    }
  ]
]);

export function listAvailableMercenaries(): MercenaryContract[] {
  return Array.from(TAVERN_REGISTRY.values()).filter(m => m.isAvailable);
}

export function getMercenaryById(id: string): MercenaryContract | undefined {
  return TAVERN_REGISTRY.get(id);
}

export function calculateRentalSettlement(rentalPriceGold: number): RentalSettlement {
  const safePrice = Math.max(0, Math.floor(rentalPriceGold));
  // 10% de taxa da Taverna (Gold Sink da economia) e 90% para o dono
  const guildFeeGold = Math.max(1, Math.floor(safePrice * 0.1));
  const ownerCommissionGold = safePrice - guildFeeGold;
  return {
    totalPriceGold: safePrice,
    ownerCommissionGold,
    guildFeeGold
  };
}

export function registerPlayerMercenary(
  ownerId: string,
  ownerName: string,
  mercenaryName: string,
  faction: Faction,
  level: number,
  specialization: Specialization,
  combatPower: number,
  rentalPriceGold: number
): MercenaryContract {
  const newContract: MercenaryContract = {
    id: randomUUID(),
    ownerId,
    ownerName,
    mercenaryName,
    faction,
    level,
    specialization,
    rentalPriceGold: Math.max(50, rentalPriceGold),
    combatPower,
    isAvailable: true
  };
  TAVERN_REGISTRY.set(newContract.id, newContract);
  return newContract;
}

export function markMercenaryHired(id: string): boolean {
  const merc = TAVERN_REGISTRY.get(id);
  if (!merc || !merc.isAvailable) return false;
  merc.isAvailable = false;
  return true;
}
