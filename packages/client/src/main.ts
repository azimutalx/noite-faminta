import { store, GameState } from './state/store.js';
import { renderHeader, attachHeaderEvents } from './components/Header.js';
import { renderRefugioPanel, attachRefugioEvents } from './components/RefugioPanel.js';
import { renderArvoreHibridaPanel, attachArvoreHibridaEvents } from './components/ArvoreHibridaPanel.js';
import { renderMetropolePanel, attachMetropoleEvents } from './components/MetropolePanel.js';
import { renderMasmorrasForjaPanel, attachMasmorrasForjaEvents } from './components/MasmorrasForjaPanel.js';
import { renderTavernaPanel, attachTavernaEvents } from './components/TavernaPanel.js';

function renderApp(state: GameState): void {
  const root = document.getElementById('app');
  if (!root) return;

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

  root.innerHTML = `
    ${renderHeader(state)}
    <main id="main-content" style="flex: 1;">
      ${state.logs[0] ? `
        <div class="gothic-ticker-bar ${state.logs[0].type}">
          <span style="opacity: 0.7;">[${state.logs[0].timestamp}]</span>
          <span>${state.logs[0].text}</span>
        </div>
      ` : ''}
      ${activePanelHtml}
    </main>
    <footer style="text-align: center; padding: var(--space-4) 0; font-size: 12px; color: var(--color-text-muted); border-top: 1px solid var(--color-border-subtle); margin-top: var(--space-6);">
      <strong>NOITE FAMINTA: SANGUE & PRATA</strong> — MMORPG Idle Autoritativo | DevSecOps & Economia Segura
    </footer>
  `;

  attachHeaderEvents(root);
  if (state.activeTab === 'refugio') {
    attachRefugioEvents(root);
  } else if (state.activeTab === 'arvore') {
    attachArvoreHibridaEvents(root);
  } else if (state.activeTab === 'metropole') {
    attachMetropoleEvents(root);
  } else if (state.activeTab === 'masmorras') {
    attachMasmorrasForjaEvents(root);
  } else if (state.activeTab === 'taverna') {
    attachTavernaEvents(root);
  }
}

// Inicialização e subscrição reativa
const initial = store.getState();
renderApp(initial);

store.subscribe((newState) => {
  renderApp(newState);
});
