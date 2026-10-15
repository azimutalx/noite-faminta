import { GameState, store, ActiveTab } from '../state/store.js';
import { getPhysicalCondition, getConditionDetails } from '@noite-faminta/shared';

export function renderHeader(state: GameState): string {
  const { character, activeTab } = state;
  const isVampire = character.faction === 'VAMPIRE';
  const factionBadgeClass = isVampire ? 'badge-vampire' : 'badge-lycan';
  const factionName = isVampire ? 'Caimita (Vampiro)' : 'Garou (Lupino)';

  const condition = getPhysicalCondition(character.stamina, character.maxStamina, character.health);
  const condDetails = getConditionDetails(condition);

  const hpPercent = Math.min(100, Math.round((character.health / character.maxHealth) * 100));
  const staminaPercent = Math.min(100, Math.round((character.stamina / character.maxStamina) * 100));
  const xpPercent = Math.min(100, Math.round((character.experience / character.experienceToNextLevel) * 100));
  const alertPercent = Math.min(100, character.masqueradeAlert);

  return `
    <header class="glass-panel accent-border" style="box-shadow: 0 8px 30px rgba(0,0,0,0.9), 0 0 20px rgba(139,10,10,0.15);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <!-- Medalhão de Nível de Jogo -->
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2b2b3a 0%, #0d0d14 100%); border: 2px solid var(--color-gold-coin); border-radius: var(--radius-xs); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(205,163,79,0.3), inset 0 2px 4px rgba(0,0,0,0.8);">
            <span style="font-size: 8px; color: var(--color-text-muted); font-weight: 700; letter-spacing: 0.05em;">NVL</span>
            <span style="font-size: 18px; font-weight: 900; color: var(--color-gold-coin); font-family: var(--font-family-mono); line-height: 1;">${character.level}</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 2px; flex-wrap: wrap;">
              <h1 style="font-size: 22px; letter-spacing: 0.08em; text-shadow: 0 2px 6px rgba(0,0,0,0.9);">${character.name}</h1>
              <span class="badge ${factionBadgeClass}">${factionName}</span>
              <span class="badge" style="background: rgba(212,214,226,0.1); color: var(--color-silver-light);">RANK ${character.hideoutLevel}</span>
              <span class="badge" style="background: rgba(0,0,0,0.6); border: 1px solid ${condDetails.color}; color: ${condDetails.color}; font-size: 10px;" title="${condDetails.description}">
                ${condDetails.label.toUpperCase()}
              </span>
            </div>
            <p style="font-size: 12px; color: var(--color-text-muted); font-family: var(--font-family-body);">
              Especialização: <strong style="color: var(--color-silver-light);">${character.specialization}</strong> • Pontos de Evolução: <strong style="color: var(--color-gold-coin); font-family: var(--font-family-mono);">${character.evolutionPoints}</strong>
            </p>
          </div>
        </div>

        <!-- Recursos e Moedas de Jogo -->
        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
          <div class="badge badge-gold" style="padding: 6px 12px; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);" title="Ouro para forja e treinos">
            🪙 <strong style="font-family: var(--font-family-mono); font-size: 14px; margin-left: 4px;">${character.gold.toLocaleString('pt-BR')}</strong> <span style="font-size: 10px; opacity: 0.8;">GOLD</span>
          </div>
          <div class="badge" style="padding: 6px 12px; font-size: 13px; background: rgba(180, 182, 195, 0.15); color: var(--color-silver-light); border: 1px solid rgba(212,214,226,0.25); box-shadow: 0 2px 8px rgba(0,0,0,0.6);" title="Tokens da Noite">
            💠 <strong style="font-family: var(--font-family-mono); font-size: 14px; margin-left: 4px; color: #da77f2;">${character.tokens}</strong> <span style="font-size: 10px; opacity: 0.8;">TOKENS</span>
          </div>
        </div>
      </div>

      <!-- Medidores Vitais (HUD Tático Blindado com 4 Barras) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4);">
        <div style="background: rgba(0,0,0,0.35); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid rgba(220,30,30,0.2);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: var(--space-1); font-family: var(--font-family-mono);">
            <span style="letter-spacing: 0.08em; color: #ff8787; font-weight: 700;">🩸 VITALIDADE ${character.health <= 0 ? '(TORPOR)' : ''}</span>
            <span style="font-weight: 700; color: #ff8787;">${character.health} / ${character.maxHealth}</span>
          </div>
          <div class="progress-container">
            <div class="progress-fill fill-health" style="width: ${hpPercent}%;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.35); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid rgba(56,158,226,0.2);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: var(--space-1); font-family: var(--font-family-mono);">
            <span style="letter-spacing: 0.08em; color: #74c0fc; font-weight: 700;">⚡ ENERGIA (${condDetails.label.toUpperCase()})</span>
            <span style="font-weight: 700; color: ${condDetails.color};">${character.stamina} / ${character.maxStamina}</span>
          </div>
          <div class="progress-container">
            <div class="progress-fill fill-stamina" style="width: ${staminaPercent}%;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.35); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid rgba(205,163,79,0.2);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: var(--space-1); font-family: var(--font-family-mono);">
            <span style="letter-spacing: 0.08em; color: var(--color-gold-coin); font-weight: 700;">⚔️ EXPERIÊNCIA</span>
            <span style="font-weight: 700; color: var(--color-gold-coin);">${character.experience} / ${character.experienceToNextLevel}</span>
          </div>
          <div class="progress-container">
            <div class="progress-fill fill-xp" style="width: ${xpPercent}%;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.35); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid rgba(240,78,30,0.2);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: var(--space-1); font-family: var(--font-family-mono);">
            <span style="letter-spacing: 0.08em; color: #ff922b; font-weight: 700;">👁️ INQUISIÇÃO</span>
            <span style="font-weight: 700; color: #ff922b;">${alertPercent}%</span>
          </div>
          <div class="progress-container">
            <div class="progress-fill fill-alert" style="width: ${alertPercent}%;"></div>
          </div>
        </div>
      </div>

      <!-- Navegação dos Painéis -->
      <nav class="nav-tabs" id="main-nav">
        <button class="nav-tab ${activeTab === 'refugio' ? 'active' : ''}" data-tab="refugio">
          🏰 1. Refúgio Ancestral
        </button>
        <button class="nav-tab ${activeTab === 'arvore' ? 'active' : ''}" data-tab="arvore">
          🩸 2. Árvore Híbrida
        </button>
        <button class="nav-tab ${activeTab === 'metropole' ? 'active' : ''}" data-tab="metropole">
          🏙️ 3. Metrópole & Caçada
        </button>
        <button class="nav-tab ${activeTab === 'masmorras' ? 'active' : ''}" data-tab="masmorras">
          🗡️ 4. Masmorras & Forja
        </button>
        <button class="nav-tab ${activeTab === 'taverna' ? 'active' : ''}" data-tab="taverna">
          🍻 5. Taverna dos Renegados
        </button>
      </nav>
    </header>
  `;
}

export function attachHeaderEvents(container: HTMLElement): void {
  const tabs = container.querySelectorAll<HTMLButtonElement>('#main-nav .nav-tab');
  tabs.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab') as ActiveTab | null;
      if (targetTab) {
        store.setActiveTab(targetTab);
      }
    });
  });
}
