import { describe, it, expect, beforeEach } from 'vitest';
import { store, ActiveTab, RefugioSubTab } from '../src/state/store.js';
import {
  calculateMaxHealth,
  calculateTotalMaxHealth,
  calculateMaxStamina,
  calculateTotalMaxStamina,
  calculateVaultLimit,
  calculateTotalVaultLimit,
  calculateChamberCost,
  normalizeCharacterStats
} from '@noite-faminta/shared';

// Mock de localStorage para ambiente de testes Node/Vitest
const localStorageMock = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value.toString(); },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { storage = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('packages/client: StateStore & Hierarquia de Estado e UI', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('deve inicializar o estado com o personagem normalizado e abas padrão', () => {
    const state = store.getState();
    expect(state).toBeDefined();
    expect(state.character).toBeDefined();
    expect(state.character.name).toBe('Vladislav de Karnstein');
    expect(state.character.faction).toBe('VAMPIRE');
    expect(state.activeTab).toBe('overview');
    expect(state.ui).toBeDefined();
    expect(state.ui.refugioSubTab).toBe('chambers');
    expect(state.ui.inspectedChamberId).toBeNull();
    expect(state.ui.torchLightingActive).toBe(false);
    expect(state.logs.length).toBeGreaterThan(0);

    // Validação da hierarquia de atributos normalizados
    const expectedMaxHp = calculateTotalMaxHealth(
      state.character.stats.vitality,
      state.character.level,
      state.character.hideoutRooms?.throne_sarcophagus ?? 0
    );
    expect(state.character.maxHealth).toBe(expectedMaxHp);
  });

  it('deve alternar abas de forma reativa e notificar ouvintes', () => {
    let notifiedTab: ActiveTab = 'refugio';
    const unsubscribe = store.subscribe((newState) => {
      notifiedTab = newState.activeTab;
    });

    store.setActiveTab('metropole');
    expect(store.getState().activeTab).toBe('metropole');
    expect(notifiedTab).toBe('metropole');

    store.setActiveTab('arvore');
    expect(store.getState().activeTab).toBe('arvore');
    expect(notifiedTab).toBe('arvore');

    unsubscribe();
  });

  it('deve gerenciar estado de UI (sub-abas, modal de inspeção, iluminação) sem poluir o personagem', () => {
    store.setRefugioSubTab('arsenal');
    expect(store.getState().ui.refugioSubTab).toBe('arsenal');
    expect(store.getState().ui.inspectedChamberId).toBeNull();

    store.setInspectedChamber('blood_forge');
    expect(store.getState().ui.inspectedChamberId).toBe('blood_forge');

    store.setInspectedChamber(null);
    expect(store.getState().ui.inspectedChamberId).toBeNull();

    const torchBefore = store.getState().ui.torchLightingActive;
    store.toggleTorchLighting();
    expect(store.getState().ui.torchLightingActive).toBe(!torchBefore);
  });

  it('deve atualizar o personagem e sincronizar no localStorage mantendo normalização', () => {
    store.updateCharacter({ gold: 9999, level: 5 });
    const state = store.getState();

    expect(state.character.gold).toBe(9999);
    expect(state.character.level).toBe(5);

    const saved = JSON.parse(localStorage.getItem('noite_character_state') || '{}');
    expect(saved.gold).toBe(9999);
    expect(saved.level).toBe(5);

    // Vitalidade 15, level 5, throne_sarcophagus 1:
    // calculateMaxHealth(15, 5) = 100 + 225 + 100 = 425 + 40 = 465
    expect(state.character.maxHealth).toBe(465);
  });

  it('deve executar upgrade de câmara aplicando regras autoritativas e recalculando stats', () => {
    // Dar ouro abundante para teste
    store.updateCharacter({ gold: 50000 });
    const charBefore = store.getState().character;
    const currentLvl = charBefore.hideoutRooms?.throne_sarcophagus ?? 0;
    const cost = calculateChamberCost('throne_sarcophagus', currentLvl);

    const success = store.upgradeChamber('throne_sarcophagus');
    expect(success).toBe(true);

    const charAfter = store.getState().character;
    expect(charAfter.gold).toBe(charBefore.gold - cost);
    expect(charAfter.hideoutRooms?.throne_sarcophagus).toBe(currentLvl + 1);

    // O HP máximo deve ter aumentado pelo bônus da câmara (+40)
    expect(charAfter.maxHealth).toBe(charBefore.maxHealth + 40);
  });

  it('deve recusar upgrade de câmara se não houver ouro suficiente', () => {
    store.updateCharacter({ gold: 5 });
    const success = store.upgradeChamber('throne_sarcophagus');
    expect(success).toBe(false);
  });

  it('deve descansar no santuário restaurando 100% da vida e da energia física (stamina)', () => {
    store.updateCharacter({ health: 50, stamina: 10 });
    expect(store.getState().character.health).toBe(50);
    expect(store.getState().character.stamina).toBe(10);

    const rested = store.restAtSanctuary();
    expect(rested).toBe(true);
    expect(store.getState().character.health).toBe(store.getState().character.maxHealth);
    expect(store.getState().character.stamina).toBe(store.getState().character.maxStamina);

    // Descansar de novo deve ser ignorado pois já está no ápice
    const restedAgain = store.restAtSanctuary();
    expect(restedAgain).toBe(false);
  });

  it('deve depositar ouro no cofre respeitando os limites da câmara e saldo disponível', () => {
    store.updateCharacter({ gold: 5000, vaultGold: 1000, vaultGoldLimit: 15000 });
    const deposited = store.depositToVault();

    expect(deposited).toBe(5000);
    expect(store.getState().character.gold).toBe(0);
    expect(store.getState().character.vaultGold).toBe(6000);

    // Segundo depósito sem ouro na bolsa
    const depositedZero = store.depositToVault();
    expect(depositedZero).toBe(0);
  });

  it('deve adicionar mensagens de log mantendo limite seguro de histórico', () => {
    store.addLog('Teste de mensagem de combate', 'danger');
    const state = store.getState();
    expect(state.logs[0].text).toBe('Teste de mensagem de combate');
    expect(state.logs[0].type).toBe('danger');
    expect(state.logs.length).toBeLessThanOrEqual(26);
  });

  it('deve gerenciar materiais de forja sem mutação destrutiva', () => {
    store.setMaterials([{ id: 'm1', template_id: 'ferro_vulcanico', name: 'Ferro Vulcânico' }]);
    expect(store.getState().materials.length).toBe(1);

    store.addMaterials([{ id: 'm2', template_id: 'prata_lunar', name: 'Prata Lunar' }]);
    expect(store.getState().materials.length).toBe(2);
    expect(store.getState().materials[1].name).toBe('Prata Lunar');
  });
});

describe('packages/client: Validação da Hierarquia de Fórmulas Canônicas', () => {
  it('hierarquia de vida máxima deve respeitar a fórmula canônica (vitalidade e nível)', () => {
    const vitality = 15;
    const level = 3;
    const hpCalculado = calculateMaxHealth(vitality, level);

    // 100 base + (15 * 15) + (3 * 20) = 100 + 225 + 60 = 385
    expect(hpCalculado).toBe(385);
  });

  it('hierarquia de estamina deve respeitar o nível do refúgio/câmara', () => {
    expect(calculateMaxStamina(1)).toBe(100);
    expect(calculateMaxStamina(2)).toBe(110);
    expect(calculateMaxStamina(3)).toBe(120);
  });

  it('hierarquia do limite do cofre deve respeitar o nível do refúgio', () => {
    expect(calculateVaultLimit(1)).toBe(5000);
    expect(calculateVaultLimit(2)).toBe(15000);
    expect(calculateVaultLimit(3)).toBe(25000);
  });

  it('custo de upgrade de câmaras deve crescer de forma exponencial previsível', () => {
    const custoLvl0 = calculateChamberCost('throne_sarcophagus', 0);
    const custoLvl1 = calculateChamberCost('throne_sarcophagus', 1);
    const custoLvl2 = calculateChamberCost('throne_sarcophagus', 2);

    expect(custoLvl1).toBeGreaterThan(custoLvl0);
    expect(custoLvl2).toBeGreaterThan(custoLvl1);
  });
});
