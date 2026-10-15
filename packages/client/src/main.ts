import { store, GameState } from './state/store.js';
import { renderHeader, attachHeaderEvents } from './components/Header.js';
import { renderRefugioPanel, attachRefugioEvents } from './components/RefugioPanel.js';
import { renderArvoreHibridaPanel, attachArvoreHibridaEvents } from './components/ArvoreHibridaPanel.js';
import { renderMetropolePanel, attachMetropoleEvents } from './components/MetropolePanel.js';
import { renderMasmorrasForjaPanel, attachMasmorrasForjaEvents } from './components/MasmorrasForjaPanel.js';
import { renderTavernaPanel, attachTavernaEvents } from './components/TavernaPanel.js';
import { setHtml } from './utils/dom.js';

let lastLogId: string | null = null;

function ensureAppShell(root: HTMLElement): {
  headerEl: HTMLElement;
  tickerEl: HTMLElement;
  mainEl: HTMLElement;
  footerEl: HTMLElement;
} {
  let headerEl = root.querySelector<HTMLElement>('#app-header');
  let tickerEl = root.querySelector<HTMLElement>('#app-ticker-container');
  let mainEl = root.querySelector<HTMLElement>('#main-content');
  let footerEl = root.querySelector<HTMLElement>('#app-footer');

  if (!headerEl || !tickerEl || !mainEl || !footerEl) {
    setHtml(root, `
      <header id="app-header"></header>
      <div id="app-ticker-container"></div>
      <main id="main-content" style="flex: 1;"></main>
      <footer id="app-footer" style="text-align: center; padding: var(--space-4) 0; font-size: 12px; color: var(--color-text-muted); border-top: 1px solid var(--color-border-subtle); margin-top: var(--space-6);">
        <strong>NOITE FAMINTA: SANGUE & PRATA</strong> — MMORPG Idle Autoritativo | DevSecOps & Economia Segura
      </footer>
    `);
    headerEl = root.querySelector<HTMLElement>('#app-header')!;
    tickerEl = root.querySelector<HTMLElement>('#app-ticker-container')!;
    mainEl = root.querySelector<HTMLElement>('#main-content')!;
    footerEl = root.querySelector<HTMLElement>('#app-footer')!;
  }

  return { headerEl, tickerEl, mainEl, footerEl };
}

function renderPanelContent(mainEl: HTMLElement, state: GameState): void {
  let activePanelHtml = '';
  switch (state.activeTab) {
    case 'refugio':
      activePanelHtml = renderRefugioPanel(state);
      break;
    case 'arvore':
      activePanelHtml = renderArvoreHibridaPanel(state);
      break;
    case 'metropole':
      activePanelHtml = renderMetropolePanel(state);
      break;
    case 'masmorras':
      activePanelHtml = renderMasmorrasForjaPanel(state);
      break;
    case 'taverna':
      activePanelHtml = renderTavernaPanel(state);
      break;
  }

  setHtml(mainEl, activePanelHtml);

  if (state.activeTab === 'refugio') {
    attachRefugioEvents(mainEl);
  } else if (state.activeTab === 'arvore') {
    attachArvoreHibridaEvents(mainEl);
  } else if (state.activeTab === 'metropole') {
    attachMetropoleEvents(mainEl);
  } else if (state.activeTab === 'masmorras') {
    attachMasmorrasForjaEvents(mainEl);
  } else if (state.activeTab === 'taverna') {
    attachTavernaEvents(mainEl);
  }
}

export function renderApp(state: GameState): void {
  const root = document.getElementById('app');
  if (!root) return;

  const { headerEl, tickerEl, mainEl } = ensureAppShell(root);

  // 1. Atualizar Cabeçalho HUD e Abas sem destruir o painel ativo
  setHtml(headerEl, renderHeader(state));
  attachHeaderEvents(headerEl);

  // 2. Atualizar Ticker Gótico apenas se houver novo log
  const currentTopLog = state.logs[0];
  if (currentTopLog && currentTopLog.id !== lastLogId) {
    lastLogId = currentTopLog.id;
    setHtml(tickerEl, `
      <div class="gothic-ticker-bar ${currentTopLog.type}">
        <span style="opacity: 0.7;">[${currentTopLog.timestamp}]</span>
        <span>${currentTopLog.text}</span>
      </div>
    `);
  } else if (!currentTopLog) {
    setHtml(tickerEl, '');
  }

  // 3. Atualizar Painel Ativo
  renderPanelContent(mainEl, state);
}

// Inicialização e subscrição reativa
if (typeof document !== 'undefined') {
  const initial = store.getState();
  renderApp(initial);

  store.subscribe((newState) => {
    renderApp(newState);
  });
}
