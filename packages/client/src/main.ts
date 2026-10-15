import { store, GameState } from './state/store.js';
import { renderHeader, attachHeaderEvents } from './components/Header.js';
import { renderSidebar, attachSidebarEvents } from './components/Sidebar.js';
import { renderOverviewPanel, attachOverviewEvents } from './components/OverviewPanel.js';
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
  sidebarEl: HTMLElement;
  mainEl: HTMLElement;
  footerEl: HTMLElement;
} {
  let headerEl = root.querySelector<HTMLElement>('#app-header');
  let tickerEl = root.querySelector<HTMLElement>('#app-ticker-container');
  let sidebarEl = root.querySelector<HTMLElement>('#app-sidebar');
  let mainEl = root.querySelector<HTMLElement>('#main-content');
  let footerEl = root.querySelector<HTMLElement>('#app-footer');

  if (!headerEl || !tickerEl || !sidebarEl || !mainEl || !footerEl) {
    setHtml(root, `
      <div class="bf-stage-layout">
        <header id="app-header"></header>
        <div id="app-ticker-container"></div>
        <div class="bf-body-grid">
          <div id="app-sidebar"></div>
          <main id="main-content" class="bf-content-stage"></main>
        </div>
        <footer id="app-footer" style="text-align: center; padding: 12px; font-size: 11px; color: #6f7182; background: #08060a; border: 2px solid #382c3c; border-top: 1px solid #201524;">
          <strong>NOITE FAMINTA: SANGUE & PRATA</strong> — MMORPG Gótico de Navegador | Estilo Clássico BiteFight & Regras Tagmar
        </footer>
      </div>
    `);
    headerEl = root.querySelector<HTMLElement>('#app-header')!;
    tickerEl = root.querySelector<HTMLElement>('#app-ticker-container')!;
    sidebarEl = root.querySelector<HTMLElement>('#app-sidebar')!;
    mainEl = root.querySelector<HTMLElement>('#main-content')!;
    footerEl = root.querySelector<HTMLElement>('#app-footer')!;
  }

  return { headerEl, tickerEl, sidebarEl, mainEl, footerEl };
}

function renderPanelContent(mainEl: HTMLElement, state: GameState): void {
  let activePanelHtml = '';
  switch (state.activeTab) {
    case 'overview':
      activePanelHtml = renderOverviewPanel(state);
      break;
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

  if (state.activeTab === 'overview') {
    attachOverviewEvents(mainEl);
  } else if (state.activeTab === 'refugio') {
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

  const { headerEl, tickerEl, sidebarEl, mainEl } = ensureAppShell(root);

  // 1. Atualizar Cabeçalho HUD e Abas
  setHtml(headerEl, renderHeader(state));
  attachHeaderEvents(headerEl);

  // 2. Atualizar Menu Lateral BiteFight
  setHtml(sidebarEl, renderSidebar(state));
  attachSidebarEvents(sidebarEl);

  // 3. Atualizar Ticker Gótico apenas se houver novo log
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

  // 4. Atualizar Painel Ativo
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
