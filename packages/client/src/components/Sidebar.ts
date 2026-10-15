import { GameState, store, ActiveTab } from '../state/store.js';

interface MenuItem {
  tab: ActiveTab;
  label: string;
  icon: string;
  isSpecial?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { tab: 'overview', label: 'Visão Geral', icon: '👤' },
  { tab: 'refugio', label: 'Refúgio', icon: '🏰' },
  { tab: 'metropole', label: 'Metrópole & Caçada', icon: '🏙️' },
  { tab: 'masmorras', label: 'Masmorras & Forja', icon: '🗡️' },
  { tab: 'arvore', label: 'Árvore Híbrida', icon: '🩸' },
  { tab: 'taverna', label: 'Taverna & Clã', icon: '🍺' }
];

export function renderSidebar(state: GameState): string {
  const currentTab = state.activeTab;

  const buttonsHtml = MENU_ITEMS.map((item) => {
    const isActive = currentTab === item.tab;
    const activeClass = isActive ? 'active' : '';
    const specialClass = item.isSpecial ? 'voodoo' : '';

    return `
      <button class="bf-nav-btn ${activeClass} ${specialClass}" data-tab="${item.tab}">
        <span>${item.icon} ${item.label}</span>
        <span style="font-size: 8px; opacity: 0.5;">▶</span>
      </button>
    `;
  }).join('');

  return `
    <aside class="bf-sidebar">
      <div class="bf-lantern-header">
        <span class="bf-lantern-logo">Noite Faminta</span>
        <span class="bf-lantern-sub">Sangue & Prata</span>
      </div>

      <nav style="display: flex; flex-direction: column; gap: 3px;">
        ${buttonsHtml}

        <button class="bf-nav-btn voodoo" id="btn-sidebar-voodoo">
          <span>💎 Loja Voodoo</span>
          <span style="font-size: 8px; opacity: 0.7;">◆</span>
        </button>

        <button class="bf-nav-btn" id="btn-sidebar-sarcophagus" style="margin-top: 6px; border-color: #631818;">
          <span>⚰️ Descansar</span>
          <span style="font-size: 9px; color: #ff8787;">100%</span>
        </button>
      </nav>

      <div style="margin-top: auto; padding-top: 14px; text-align: center; border-top: 1px solid rgba(212,214,226,0.08); font-size: 9px; color: #6f7182;">
        <div>Servidor: s1-br</div>
        <div style="margin-top: 2px; color: #ff8787;">Véu Noturno Ativo</div>
      </div>
    </aside>
  `;
}

export function attachSidebarEvents(container: HTMLElement): void {
  container.querySelectorAll<HTMLButtonElement>('.bf-nav-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab as ActiveTab | undefined;
      if (targetTab) {
        store.setActiveTab(targetTab);
      }
    });
  });

  const voodooBtn = container.querySelector<HTMLButtonElement>('#btn-sidebar-voodoo');
  if (voodooBtn) {
    voodooBtn.addEventListener('click', () => {
      store.addLog('💎 Loja Voodoo: Relíquias e Pedras de Sangue disponíveis no Santuário e Mercado.', 'info');
      store.setActiveTab('metropole');
    });
  }

  const sarcophagusBtn = container.querySelector<HTMLButtonElement>('#btn-sidebar-sarcophagus');
  if (sarcophagusBtn) {
    sarcophagusBtn.addEventListener('click', () => {
      store.restAtSanctuary();
    });
  }
}
