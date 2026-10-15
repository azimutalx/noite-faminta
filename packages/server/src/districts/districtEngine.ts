import { randomInt } from 'node:crypto';
import {
  DistrictId,
  DistrictState,
  DistrictContestResult,
  DistrictDividendResult,
  Faction
} from '@noite-faminta/shared';

// Estado em memória autoritativo dos distritos da Metrópole Sombria
const DISTRICT_REGISTRY: Record<DistrictId, DistrictState> = {
  FINANCIAL_CENTER: {
    id: 'FINANCIAL_CENTER',
    name: 'Centro Financeiro & Bancos Ocultos',
    dominantFaction: 'VAMPIRE',
    dominantClanName: 'Ordem das Sombras',
    infamyVampire: 1450,
    infamyLycan: 1120,
    bonusDescription: '+5% Dividendos de todas as taxas do Mercado Global',
    weeklyDividendsPool: 5000
  },
  PORT_DOCKS: {
    id: 'PORT_DOCKS',
    name: 'Zona Portuária & Docas Nebulosas',
    dominantFaction: 'LYCAN',
    dominantClanName: 'Matilha Rubra',
    infamyVampire: 980,
    infamyLycan: 1600,
    bonusDescription: '+15% Chance de drops de materiais de contrabando',
    weeklyDividendsPool: 0
  },
  HISTORIC_CATHEDRAL: {
    id: 'HISTORIC_CATHEDRAL',
    name: 'Catedral Histórica & Catacumbas',
    dominantFaction: 'NEUTRAL',
    dominantClanName: 'Sob Cerco Inquisitorial',
    infamyVampire: 720,
    infamyLycan: 750,
    bonusDescription: 'Regeneração acelerada de Vida e resistência à Inquisição',
    weeklyDividendsPool: 0
  },
  WILD_RESERVE: {
    id: 'WILD_RESERVE',
    name: 'Reserva dos Ermos & Floresta Ancestral',
    dominantFaction: 'LYCAN',
    dominantClanName: 'Guardiões do Sangue da Terra',
    infamyVampire: 430,
    infamyLycan: 1280,
    bonusDescription: '-20% Consumo de Stamina em incursões noturnas',
    weeklyDividendsPool: 0
  }
};

export function getAllDistricts(): DistrictState[] {
  return Object.values(DISTRICT_REGISTRY).map(d => ({ ...d }));
}

export function getDistrictById(districtId: DistrictId): DistrictState | undefined {
  const d = DISTRICT_REGISTRY[districtId];
  return d ? { ...d } : undefined;
}

export function addMarketTaxToDividendPool(taxAmount: number): void {
  if (taxAmount > 0) {
    DISTRICT_REGISTRY.FINANCIAL_CENTER.weeklyDividendsPool += Math.floor(taxAmount);
  }
}

export function executeDistrictContest(
  districtId: DistrictId,
  characterFaction: Faction,
  goldInvestment: number,
  staminaCost: number,
  rollFn: (min: number, max: number) => number = (min, max) => randomInt(min, max + 1)
): DistrictContestResult {
  const district = DISTRICT_REGISTRY[districtId];
  if (!district) {
    throw new Error(`Distrito desconhecido: ${districtId}`);
  }

  const baseInfamy = rollFn(25, 60);
  const goldBonusInfamy = Math.min(200, Math.floor(goldInvestment / 20));
  const totalInfamyGained = baseInfamy + goldBonusInfamy;

  if (characterFaction === 'VAMPIRE') {
    district.infamyVampire += totalInfamyGained;
  } else {
    district.infamyLycan += totalInfamyGained;
  }

  // Recalcular dominância do distrito
  let newDominant: Faction | 'NEUTRAL' = district.dominantFaction;
  let newClanName = district.dominantClanName;
  const diff = Math.abs(district.infamyVampire - district.infamyLycan);

  if (diff < 50) {
    newDominant = 'NEUTRAL';
    newClanName = 'Território em Disputa Sangrenta';
  } else if (district.infamyVampire > district.infamyLycan) {
    newDominant = 'VAMPIRE';
    newClanName = 'Ordem das Sombras';
  } else {
    newDominant = 'LYCAN';
    newClanName = 'Matilha Rubra';
  }

  district.dominantFaction = newDominant;
  district.dominantClanName = newClanName;

  const narrative = characterFaction === newDominant
    ? `A sua facção expandiu o domínio sobre ${district.name}! (+${totalInfamyGained} Infâmia).`
    : `Você realizou sabotagens em ${district.name}, reduzindo o controle inimigo (+${totalInfamyGained} Infâmia).`;

  return {
    success: true,
    districtId,
    newInfamyVampire: district.infamyVampire,
    newInfamyLycan: district.infamyLycan,
    dominantFaction: district.dominantFaction,
    infamyGained: totalInfamyGained,
    staminaSpent: staminaCost,
    narrative
  };
}

export function claimFinancialDividends(
  characterFaction: Faction,
  districtId: DistrictId
): DistrictDividendResult {
  if (districtId !== 'FINANCIAL_CENTER') {
    return {
      success: false,
      goldClaimed: 0,
      remainingPool: 0,
      message: 'Apenas o Centro Financeiro distribui dividendos de taxas do mercado.'
    };
  }

  const district = DISTRICT_REGISTRY.FINANCIAL_CENTER;
  if (district.dominantFaction !== characterFaction) {
    return {
      success: false,
      goldClaimed: 0,
      remainingPool: district.weeklyDividendsPool,
      message: `Apenas a facção dominante (${district.dominantFaction}) pode recolher dividendos da metrópole.`
    };
  }

  if (district.weeklyDividendsPool <= 0) {
    return {
      success: false,
      goldClaimed: 0,
      remainingPool: 0,
      message: 'O cofre de dividendos do Centro Financeiro está vazio no momento.'
    };
  }

  // Paga 25% do pool acumulado por saque autorizado
  const payout = Math.max(100, Math.floor(district.weeklyDividendsPool * 0.25));
  const goldClaimed = Math.min(payout, district.weeklyDividendsPool);
  district.weeklyDividendsPool -= goldClaimed;

  return {
    success: true,
    goldClaimed,
    remainingPool: district.weeklyDividendsPool,
    message: `Dividendos recolhidos com sucesso! +${goldClaimed} Ouro adicionados ao seu baú.`
  };
}
