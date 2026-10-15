import { describe, it, expect } from 'vitest';
import { store, GameState } from '../src/state/store.js';
import { renderHeader } from '../src/components/Header.js';
import { renderRefugioPanel } from '../src/components/RefugioPanel.js';
import { renderMetropolePanel } from '../src/components/MetropolePanel.js';
import { renderTavernaPanel } from '../src/components/TavernaPanel.js';
import { renderMasmorrasForjaPanel } from '../src/components/MasmorrasForjaPanel.js';
import { renderArvoreHibridaPanel } from '../src/components/ArvoreHibridaPanel.js';
import {
  calculateHuntingPower,
  calculateMercenaryCombatPower
} from '@noite-faminta/shared';

describe('packages/client: Validação Estrutural e Visual dos Componentes', () => {
  it('renderHeader deve renderizar métricas vitais e dados do personagem corretamente', () => {
    const state = store.getState();
    const html = renderHeader(state);

    expect(html).toContain(state.character.name);
    expect(html).toContain(`NVL</span>`);
    expect(html).toContain(`>${state.character.level}</span>`);
    expect(html).toContain(state.character.gold.toLocaleString('pt-BR'));
    expect(html).toContain(`${state.character.tokens}`);

    // Barras vitais
    expect(html).toContain('🩸 VITALIDADE');
    expect(html).toContain('⚡ ENERGIA');
    expect(html).toContain('⚔️ EXPERIÊNCIA');
    expect(html).toContain('👁️ INQUISIÇÃO');

    // Abas de navegação
    expect(html).toContain('data-tab="refugio"');
    expect(html).toContain('data-tab="arvore"');
    expect(html).toContain('data-tab="metropole"');
    expect(html).toContain('data-tab="masmorras"');
    expect(html).toContain('data-tab="taverna"');
  });

  it('renderRefugioPanel deve renderizar sub-abas e alternar visualização conforme UIState', () => {
    const baseState = store.getState();

    // 1. Sub-aba Câmaras
    const chambersHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, refugioSubTab: 'chambers', inspectedChamberId: null }
    });
    expect(chambersHtml).toContain('hideout-subtab-btn active');
    expect(chambersHtml).toContain('Câmaras & Canteiro de Obras');
    expect(chambersHtml).not.toContain('chamber-modal-backdrop');

    // 2. Sub-aba Panorama
    const panoramaHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, refugioSubTab: 'panorama', inspectedChamberId: null }
    });
    expect(panoramaHtml).toContain('Fortaleza Exterior');

    // 3. Sub-aba Arsenal
    const arsenalHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, refugioSubTab: 'arsenal', inspectedChamberId: null }
    });
    expect(arsenalHtml).toContain('Arsenal & Paperdoll');

    // 4. Sub-aba Gambits
    const gambitsHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, refugioSubTab: 'gambits', inspectedChamberId: null }
    });
    expect(gambitsHtml).toContain('Matriz de Gambits');

    // 5. Modal de Inspeção Aberto
    const modalHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, inspectedChamberId: 'throne_sarcophagus' }
    });
    expect(modalHtml).toContain('chamber-modal-backdrop');
    expect(modalHtml).toContain('Trono Carmesim & Sarcófago');

    // 6. Tochas acesas
    const torchHtml = renderRefugioPanel({
      ...baseState,
      ui: { ...baseState.ui, torchLightingActive: true }
    });
    expect(torchHtml).toContain('torch-ambiance-red');
  });

  it('renderMetropolePanel deve calcular poder com fórmula canônica e listar alvos', () => {
    const state = store.getState();
    const html = renderMetropolePanel(state);

    expect(html).toContain('Seu Poder Efetivo:');
    expect(html).toContain('Console da Noite (Battle Log)');
    expect(html).toContain('Mercado Global & Tokens da Noite');
    expect(html).toContain('CENTRO FINANCEIRO');
    expect(html).toContain('TAGMAR:');
  });

  it('renderMetropolePanel deve desabilitar caçada e alertar exaustão se o personagem não tiver stamina', () => {
    const exhaustedState: GameState = {
      ...store.getState(),
      character: {
        ...store.getState().character,
        stamina: 0
      }
    };
    const html = renderMetropolePanel(exhaustedState);

    // Botão de caçada deve estar desabilitado e alertar exaustão
    expect(html).toContain('id="btn-start-hunt" class="btn btn-blood" style="width: 100%;" disabled');
    expect(html).toContain('⛔ Exausto (Stamina 0/');
    expect(html).toContain('TAGMAR: EXAUSTO');
  });

  it('renderTavernaPanel deve calcular poder de mercenário com fórmula canônica compartilhada', () => {
    const state = store.getState();
    const html = renderTavernaPanel(state);
    const expectedMercenaryPower = calculateMercenaryCombatPower(state.character.stats);

    expect(html).toContain(`Seu Poder Calculado: <strong style="color: #74c0fc;">⚡ ${expectedMercenaryPower}</strong>`);
    expect(html).toContain('Taverna dos Renegados');
    expect(html).toContain('Victor, o Carrasco Carmesim');
    expect(html).toContain('Firmar Contrato');
  });

  it('renderMasmorrasForjaPanel deve renderizar chefes e bigorna vulcânica', () => {
    const state = store.getState();
    const html = renderMasmorrasForjaPanel(state);

    expect(html).toContain('Lorde Malachi');
    expect(html).toContain('Alfa Fenrir');
    expect(html).toContain('Soberana Carmilla');
    expect(html).toContain('Bigorna Vulcânica & Forja Rúnica');
  });

  it('renderArvoreHibridaPanel deve listar as 4 gemas de linhagem e custos de infusão', () => {
    const state = store.getState();
    const html = renderArvoreHibridaPanel(state);

    expect(html).toContain('Força Primordial');
    expect(html).toContain('Agilidade Noturna');
    expect(html).toContain('Vitalidade Sanguínea');
    expect(html).toContain('Magia Oculta / Gnose');
    expect(html).toContain('btn-train');
  });
});
