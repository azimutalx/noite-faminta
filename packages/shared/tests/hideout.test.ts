import { describe, it, expect } from 'vitest';
import {
  HIDEOUT_CHAMBERS,
  calculateChamberUpgradeCost,
  getChamberStageName,
  getChamberBonus,
  getChamberStatus
} from '../src/formulas/hideout.js';
import { HideoutChamberId } from '../src/types/hideout.js';

describe('Sistema Interativo de Câmaras do Refúgio Gótico', () => {
  const allChambers: HideoutChamberId[] = [
    'throne_sarcophagus',
    'catacomb_vault',
    'blood_forge',
    'ritual_sanctum',
    'gargoyle_parapet',
    'minion_crypt'
  ];

  it('possui todas as 6 câmaras devidamente configuradas com ativos e lore', () => {
    expect(allChambers.length).toBe(6);
    allChambers.forEach(id => {
      const cfg = HIDEOUT_CHAMBERS[id];
      expect(cfg).toBeDefined();
      expect(cfg.name.length).toBeGreaterThan(0);
      expect(cfg.svgAsset).toMatch(/^\/assets\/camara_.*\.svg$/);
      expect(cfg.maxLevel).toBe(5);
      expect(cfg.lore.length).toBeGreaterThan(10);
    });
  });

  it('calcula custos de expansão arquitetural de forma progressiva', () => {
    const costLevel0 = calculateChamberUpgradeCost('throne_sarcophagus', 0);
    const costLevel1 = calculateChamberUpgradeCost('throne_sarcophagus', 1);
    const costLevel2 = calculateChamberUpgradeCost('throne_sarcophagus', 2);

    expect(costLevel0).toBeGreaterThan(0);
    expect(costLevel1).toBeGreaterThan(costLevel0);
    expect(costLevel2).toBeGreaterThan(costLevel1);
  });

  it('determina corretamente os estágios nominais de alvenaria e arquitetura', () => {
    expect(getChamberStageName(0)).toBe('Ruínas Desmoronadas');
    expect(getChamberStageName(1)).toBe('Alvenaria Básica de Pedra');
    expect(getChamberStageName(2)).toBe('Abóbada Fortificada com Ferro');
    expect(getChamberStageName(5)).toBe('Catedral Soberana Ancestral');
  });

  it('calcula bônus específicos por câmara e status de acessibilidade de ouro', () => {
    const vaultBonus = getChamberBonus('catacomb_vault', 2);
    expect(vaultBonus.currentValueText).toContain('30.000');

    // Jogador com pouco ouro
    const poorStatus = getChamberStatus('catacomb_vault', 1, 10);
    expect(poorStatus.isUnlocked).toBe(true);
    expect(poorStatus.canAfford).toBe(false);

    // Jogador com ouro suficiente
    const richStatus = getChamberStatus('catacomb_vault', 1, 100000);
    expect(richStatus.canAfford).toBe(true);
  });
});
