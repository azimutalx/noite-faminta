import {
  calculateHuntingPower,
  HUNT_TARGET_CONFIGS,
  HuntTargetType,
  DistrictId
} from '@noite-faminta/shared';
import { GameState, store } from '../state/store.js';
import { startHunt, startDuel, buyMarketOrder } from '../state/api.js';
import { purgeNemesis } from '../state/nemesisApi.js';
import { contestDistrict, claimDividends } from '../state/districtApi.js';

let selectedTarget: HuntTargetType = 'STREET_MORTAL';

const DISTRICTS: Array<{ id: DistrictId; name: string; color: string; clan: string; bonus: string; bc: string; pool?: number }> = [
  { id: 'FINANCIAL_CENTER', name: 'CENTRO FINANCEIRO', color: 'var(--color-gold-coin)', clan: 'Ordem das Sombras', bonus: '+5% Dividendos Mercado', bc: '#69db7c', pool: 5000 },
  { id: 'PORT_DOCKS', name: 'ZONA PORTUÁRIA', color: 'var(--color-silver-light)', clan: 'Matilha Rubra', bonus: '+15% Contrabando', bc: '#69db7c' },
  { id: 'HISTORIC_CATHEDRAL', name: 'CATEDRAL HISTÓRICA', color: '#ff8787', clan: 'Alerta Inquisição', bonus: 'Perigo de Emboscada', bc: '#ff8787' },
  { id: 'WILD_RESERVE', name: 'RESERVA DOS ERMOS', color: '#a9e34b', clan: 'Território Neutro', bonus: '-20% Stamina Lycan', bc: '#69db7c' }
];

function renderDistricts(): string {
  if (DISTRICTS.length === 0) return '<div class="empty-state">Nenhum distrito sob disputa territorial.</div>';
  const cards = DISTRICTS.map(d => `
    <div style="background: linear-gradient(180deg, #13131b 0%, #07070a 100%); border: 1px solid var(--color-border-subtle); padding: var(--space-3); border-radius: var(--radius-xs); display: flex; flex-direction: column; justify-content: space-between; box-shadow: inset 0 1px 2px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.7);">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-weight: 700; color: ${d.color}; font-size: 12px; font-family: var(--font-family-display);">${d.name}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-text-muted);">Clã: <strong style="color: var(--color-silver-light);">${d.clan}</strong></div>
        
        <!-- Barra Visual de Disputa Territorial (Vampiros vs Lycans) -->
        <div class="territory-split-bar" title="Controle Territorial: 55% Vampiros | 45% Lycans">
          <div class="territory-vampire" style="width: 55%;"></div>
          <div class="territory-lycan" style="width: 45%;"></div>
        </div>

        <div style="font-size: 10px; color: ${d.bc}; margin-bottom: var(--space-2); font-weight: 600;">${d.bonus}</div>
      </div>
      <div style="display: flex; gap: var(--space-1); flex-wrap: wrap;">
        <button class="btn btn-secondary btn-contest-district" data-district="${d.id}" style="padding: 4px 8px; font-size: 10px; flex: 1;">⚡ Disputar</button>
        ${d.id === 'FINANCIAL_CENTER' ? `<button class="btn btn-blood btn-claim-dividends" style="padding: 4px 8px; font-size: 10px; flex: 1;">💰 Coletar Taxas</button>` : ''}
      </div>
    </div>
  `).join('');
  return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-2); margin-top: var(--space-2);">${cards}</div>`;
}

const MARKET_ITEMS = [
  { title: 'Lâmina Sanguinária', badge: 'RARO', bc: '#ff8787', bg: 'rgba(224,49,49,0.15)', desc: 'Ataque: +32, Roubo: +8%', price: 250, btnText: '💰 Comprar por 250 Gold', cls: 'btn-primary btn-market-buy' },
  { title: '25 Tokens da Noite', badge: 'TOKENS', bc: '#74c0fc', bg: 'rgba(116,192,252,0.15)', desc: 'Cotação: 16 Ouro / Token', price: 400, tokens: 25, btnText: '💠 Comprar 25 Tokens (400 Gold)', cls: 'btn-primary btn-market-buy' },
  { title: 'Venda de 50 Tokens', badge: 'COMPRA', bc: '#69db7c', bg: 'rgba(105,219,124,0.15)', desc: 'Paga 850 Ouro por 50 Tokens', tokens: 50, reward: 850, btnText: '⚡ Vender 50 Tokens (+850 Gold)', cls: 'btn-secondary btn-market-sell-tokens' }
];

function renderMarketSection(): string {
  if (MARKET_ITEMS.length === 0) return '<div class="empty-state">Mercado vazio no momento.</div>';
  const cards = MARKET_ITEMS.map(item => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-1);">
          <strong style="color: var(--color-silver-light); font-size: 13px;">${item.title}</strong>
          <span class="badge" style="background: ${item.bg}; color: ${item.bc};">${item.badge}</span>
        </div>
        <p style="font-size: 11px; color: var(--color-text-muted); margin-bottom: var(--space-2);">${item.desc}</p>
      </div>
      <button class="btn ${item.cls}" ${item.price ? `data-price="${item.price}"` : ''} ${item.tokens ? `data-tokens="${item.tokens}"` : ''} ${item.reward ? `data-reward="${item.reward}"` : ''} style="width: 100%; font-size: 11px;">
        ${item.btnText}
      </button>
    </div>
  `).join('');

  return `
    <div class="glass-panel" style="border-top: 2px solid var(--color-gold-coin);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
        <div>
          <h2 style="font-size: 18px; color: var(--color-gold-coin); margin-bottom: var(--space-1);">🏛️ Mercado Global & Tokens da Noite</h2>
          <p style="font-size: 12px; color: var(--color-text-muted);">Livro de ordens com liquidação atômica e taxa de 5% de queima.</p>
        </div>
        <div class="badge" style="background: rgba(255, 215, 0, 0.15); color: var(--color-gold-coin);">Taxa: 5% Queima</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">${cards}</div>
    </div>
  `;
}

export function renderMetropolePanel(state: GameState): string {
  const { character, logs } = state;
  const playerPower = calculateHuntingPower(character.stats, character.level);
  const targetConfig = HUNT_TARGET_CONFIGS[selectedTarget];
  const powerDiff = playerPower - targetConfig.minPower;
  const isAdvantaged = powerDiff >= 0;

  const logEntries = logs.length === 0
    ? '<div class="empty-state" style="color: var(--color-text-muted); font-size: 12px; padding: var(--space-3);">Nenhum evento registrado ainda nesta noite...</div>'
    : logs.map(l => `<div class="log-entry ${l.type}"><span style="color: var(--color-text-muted);">[${l.timestamp}]</span> ${l.text}</div>`).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Banner Cenográfico Noturno -->
      <div class="metropolis-banner" style="background-image: url('/assets/metropolis_night.jpg');">
        <div class="metropolis-banner-overlay">
          <div style="font-weight: 700; font-size: 18px; color: var(--color-silver-light); text-shadow: 0 2px 4px rgba(0,0,0,0.8);">METRÓPOLE SOMBRIA</div>
          <div style="font-size: 12px; color: var(--color-silver-muted); text-shadow: 0 1px 2px rgba(0,0,0,0.9);">
            Névoa gótica, arranha-céus cinzentos e disputa de facções sob a vigília da Inquisição.
          </div>
        </div>
      </div>

      <!-- Distritos da Metrópole -->
      <div class="glass-panel">
        <h2 style="font-size: 18px; margin-bottom: var(--space-1);">Distritos de Influência</h2>
        <p style="color: var(--color-text-muted); font-size: 12px;">Guerra semanal de facções com dividendos de mercado e bônus territoriais.</p>
        ${renderDistricts()}
      </div>

      <!-- Caçada Humana & Logs -->
      <div class="panel-grid">
        <div class="glass-panel accent-border">
          <h2 style="font-size: 18px; margin-bottom: var(--space-2);">Caçada Noturna (Manhunt)</h2>
          <div style="margin-bottom: var(--space-3);">
            <label style="display: block; font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-1);">SELECIONE A PRESA:</label>
            <select id="select-target" style="width: 100%; background: #070709; color: var(--color-text-bright); border: 1px solid var(--color-border-subtle); padding: var(--space-2); border-radius: var(--radius-sm); font-family: var(--font-family-body);">
              <option value="STREET_MORTAL" ${selectedTarget === 'STREET_MORTAL' ? 'selected' : ''}>Mortal Solitário (Poder: 15, ~50 Ouro)</option>
              <option value="NOCTURNAL_PATROL" ${selectedTarget === 'NOCTURNAL_PATROL' ? 'selected' : ''}>Patrulha Noturna (Poder: 50, ~180 Ouro)</option>
              <option value="INQUISITION_OUTPOST" ${selectedTarget === 'INQUISITION_OUTPOST' ? 'selected' : ''}>Posto da Inquisição (Poder: 140, ~520 Ouro)</option>
              <option value="ANCIENT_CRYPT" ${selectedTarget === 'ANCIENT_CRYPT' ? 'selected' : ''}>Cripta Ancestral (Poder: 320, ~1600 Ouro)</option>
            </select>
          </div>
          <div style="background: rgba(0,0,0,0.4); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3);">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: var(--space-1);">
              <span>Seu Poder:</span> <strong style="color: var(--color-silver-light);">${playerPower}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: var(--space-1);">
              <span>Dificuldade do Alvo:</span> <strong style="color: ${isAdvantaged ? '#51cf66' : '#ff6b6b'};">${targetConfig.minPower} Poder</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-text-muted);">
              <span>Custo: 10 Stamina</span> <span>Alerta: +${targetConfig.masqueradeAlert}%</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <button id="btn-start-hunt" class="btn btn-blood" style="width: 100%;">🩸 Iniciar Caçada Humana</button>
            <button id="btn-arena-duel" class="btn btn-secondary" style="width: 100%;">⚔️ Desafiar Rival na Arena (Gambits)</button>
            <button id="btn-purge-nemesis" class="btn btn-secondary" style="width: 100%; border-color: #ff8787; color: #ff8787;">🛡️ Purgar Nêmesis da Inquisição</button>
          </div>
        </div>

        <div class="glass-panel">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <h2 style="font-size: 18px;">Console da Noite (Battle Log)</h2>
            <span style="font-size: 11px; color: var(--color-text-muted);">AO VIVO</span>
          </div>
          <div class="battle-log" id="battle-log-container">${logEntries}</div>
        </div>
      </div>

      ${renderMarketSection()}
    </div>
  `;
}

function attachHuntEvents(container: HTMLElement): void {
  const select = container.querySelector<HTMLSelectElement>('#select-target');
  if (select) {
    select.addEventListener('change', () => {
      selectedTarget = select.value as HuntTargetType;
      store.setActiveTab('metropole');
    });
  }

  const huntBtn = container.querySelector<HTMLButtonElement>('#btn-start-hunt');
  if (huntBtn) {
    huntBtn.addEventListener('click', async () => {
      const state = store.getState();
      if (state.character.stamina < 10) return store.addLog('Energia insuficiente.', 'danger');
      if (state.character.health <= 0) return store.addLog('Personagem ferido. Descanse no Refúgio.', 'danger');
      const res = await startHunt(selectedTarget, 10);
      if (res.data) {
        const { outcome, updatedStatus } = res.data;
        store.updateCharacter(updatedStatus);
        const msg = outcome.success
          ? `⚔️ Caçada vitoriosa! +${outcome.goldEarned} Gold, +${outcome.xpEarned} XP (-${outcome.damageTaken} HP).`
          : `⚠️ Emboscada! Sofreu ${outcome.damageTaken} de dano! (+${outcome.alertIncrease}% de Alerta).`;
        store.addLog(msg, outcome.success ? 'success' : 'danger');
      }
    });
  }

  const arenaBtn = container.querySelector<HTMLButtonElement>('#btn-arena-duel');
  if (arenaBtn) {
    arenaBtn.addEventListener('click', async () => {
      store.addLog('Iniciando duelo com Gambits na Arena Noturna...', 'info');
      const res = await startDuel('ARENA_RIVAL');
      if (res.data) {
        for (const t of res.data.battleResult.turns) {
          const type = t.damageDealt > 0 ? (t.actorId === store.getState().character.id ? 'success' : 'danger') : 'info';
          store.addLog(`[Round ${t.round}] ${t.narrative}`, type);
        }
        if (res.data.playerWon) {
          store.updateCharacter({ gold: res.data.updatedGold });
          store.addLog(`🏆 VITÓRIA! +${res.data.battleResult.goldAwarded} Gold, +${res.data.battleResult.xpAwarded} XP!`, 'gold');
        } else {
          store.addLog('💀 DERROTA NO DUELO! Treine seus atributos na Árvore Híbrida.', 'danger');
        }
      }
    });
  }

  const purgeBtn = container.querySelector<HTMLButtonElement>('#btn-purge-nemesis');
  if (purgeBtn) {
    purgeBtn.addEventListener('click', async () => {
      purgeBtn.disabled = true;
      const res = await purgeNemesis();
      purgeBtn.disabled = false;
      if (res.data?.playerWon) {
        store.updateCharacter({ masqueradeAlert: 0, gold: store.getState().character.gold + res.data.goldAwarded });
        store.addLog(`🏆 NÊMESIS DERROTADO! ${res.data.nemesis.name} eliminado! Alerta ZERADO!`, 'gold');
      } else {
        store.addLog('A emboscada do Nêmesis foi violenta! Fortaleça-se antes de desafiá-lo.', 'danger');
      }
    });
  }
}

function attachMarketEvents(container: HTMLElement): void {
  const buyBtns = container.querySelectorAll<HTMLButtonElement>('.btn-market-buy');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const price = Number(btn.getAttribute('data-price') ?? 0);
      const tokens = Number(btn.getAttribute('data-tokens') ?? 0);
      const state = store.getState();
      if (state.character.gold < price) return store.addLog(`Ouro insuficiente (${state.character.gold}/${price}).`, 'danger');
      btn.disabled = true;
      await buyMarketOrder('demo-market-order');
      btn.disabled = false;
      store.updateCharacter({ gold: state.character.gold - price, tokens: state.character.tokens + tokens });
      store.addLog(`🏛️ COMPRA REALIZADA! -${price} Ouro.${tokens > 0 ? ` +${tokens} Tokens creditados!` : ''}`, 'gold');
    });
  });

  const sellBtn = container.querySelector<HTMLButtonElement>('.btn-market-sell-tokens');
  if (sellBtn) {
    sellBtn.addEventListener('click', () => {
      const state = store.getState();
      if (state.character.tokens < 50) return store.addLog(`Tokens insuficientes (${state.character.tokens}/50).`, 'danger');
      store.updateCharacter({ gold: state.character.gold + 850, tokens: state.character.tokens - 50 });
      store.addLog('🏛️ VENDA CONCLUÍDA! -50 Tokens vendidos por +850 Ouro!', 'gold');
    });
  }
}

function attachDistrictEvents(container: HTMLElement): void {
  const contestBtns = container.querySelectorAll<HTMLButtonElement>('.btn-contest-district');
  contestBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const districtId = btn.getAttribute('data-district') as DistrictId;
      const state = store.getState();
      if (state.character.stamina < 15) return store.addLog('Stamina insuficiente para disputar o distrito (15 requerida).', 'danger');
      btn.disabled = true;
      const res = await contestDistrict(districtId, 50, 15);
      btn.disabled = false;
      if (res.data) {
        store.updateCharacter({ gold: res.data.updatedGold, stamina: res.data.updatedStamina });
        store.addLog(`⚔️ GUERRA TERRITORIAL: ${res.data.contestResult.narrative}`, 'gold');
      } else {
        store.addLog(`Erro ao disputar distrito: ${res.error}`, 'danger');
      }
    });
  });

  const claimBtn = container.querySelector<HTMLButtonElement>('.btn-claim-dividends');
  if (claimBtn) {
    claimBtn.addEventListener('click', async () => {
      claimBtn.disabled = true;
      const res = await claimDividends('FINANCIAL_CENTER');
      claimBtn.disabled = false;
      if (res.data) {
        store.updateCharacter({ gold: res.data.updatedGold });
        store.addLog(`💰 DIVIDENDOS COLETADOS: ${res.data.dividendResult.message}`, 'gold');
      } else {
        store.addLog(`Não foi possível recolher dividendos: ${res.error}`, 'danger');
      }
    });
  }
}

export function attachMetropoleEvents(container: HTMLElement): void {
  attachHuntEvents(container);
  attachMarketEvents(container);
  attachDistrictEvents(container);
}
