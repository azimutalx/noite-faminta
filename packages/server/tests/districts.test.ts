import { describe, it, expect } from 'vitest';
import {
  getAllDistricts,
  getDistrictById,
  executeDistrictContest,
  claimFinancialDividends,
  addMarketTaxToDividendPool
} from '../src/districts/districtEngine.js';

describe('Guerra de Bairros & Dividendos da Metrópole Sombria (District Engine)', () => {
  it('deve listar todos os 4 distritos com suas métricas territoriais iniciais', () => {
    const districts = getAllDistricts();
    expect(districts.length).toBe(4);
    
    const ids = districts.map(d => d.id);
    expect(ids).toContain('FINANCIAL_CENTER');
    expect(ids).toContain('PORT_DOCKS');
    expect(ids).toContain('HISTORIC_CATHEDRAL');
    expect(ids).toContain('WILD_RESERVE');

    const financial = getDistrictById('FINANCIAL_CENTER');
    expect(financial).toBeDefined();
    expect(financial?.dominantFaction).toBe('VAMPIRE');
    expect(financial?.weeklyDividendsPool).toBeGreaterThanOrEqual(5000);
  });

  it('deve acumular infâmia na disputa territorial e atualizar o clã dominante', () => {
    const mockRoll = () => 50; // Determinístico para testes
    const initial = getDistrictById('PORT_DOCKS');
    expect(initial).toBeDefined();
    const prevVampInfamy = initial!.infamyVampire;

    // Vampiros investem ouro e disputam as Docas
    const contestResult = executeDistrictContest('PORT_DOCKS', 'VAMPIRE', 200, 15, mockRoll);

    expect(contestResult.success).toBe(true);
    expect(contestResult.infamyGained).toBe(60); // 50 base + 10 de ouro (200 / 20)
    expect(contestResult.newInfamyVampire).toBe(prevVampInfamy + 60);
  });

  it('deve alimentar o pool de dividendos do Centro Financeiro com taxas do mercado', () => {
    const initialPool = getDistrictById('FINANCIAL_CENTER')!.weeklyDividendsPool;
    addMarketTaxToDividendPool(250);

    const updated = getDistrictById('FINANCIAL_CENTER')!;
    expect(updated.weeklyDividendsPool).toBe(initialPool + 250);
  });

  it('deve autorizar reivindicação de dividendos para a facção dominante e deduzir do pool', () => {
    // Centro Financeiro é dominado por Vampiros
    const claimResult = claimFinancialDividends('VAMPIRE', 'FINANCIAL_CENTER');
    expect(claimResult.success).toBe(true);
    expect(claimResult.goldClaimed).toBeGreaterThan(0);
    expect(claimResult.message).toContain('Dividendos recolhidos');
  });

  it('deve rejeitar saque de dividendos se o solicitante for de facção rival', () => {
    // Lycan tentando sacar dividendos de território dominado por Vampiros
    const claimResult = claimFinancialDividends('LYCAN', 'FINANCIAL_CENTER');
    expect(claimResult.success).toBe(false);
    expect(claimResult.goldClaimed).toBe(0);
    expect(claimResult.message).toContain('Apenas a facção dominante');
  });

  it('deve rejeitar saque de dividendos em distritos que não sejam o Centro Financeiro', () => {
    const claimResult = claimFinancialDividends('LYCAN', 'PORT_DOCKS');
    expect(claimResult.success).toBe(false);
    expect(claimResult.goldClaimed).toBe(0);
  });
});
