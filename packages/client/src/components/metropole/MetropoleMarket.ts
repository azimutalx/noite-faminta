import { store } from '../../state/store.js';
import { buyMarketOrder } from '../../state/api.js';

export const MARKET_ITEMS = [
  {
    title: 'Lâmina Sanguinária',
    badge: 'RARO',
    bc: '#ff8787',
    bg: 'rgba(224,49,49,0.15)',
    desc: 'Ataque: +32, Roubo: +8%',
    price: 250,
    btnText: '💰 Comprar por 250 Gold',
    cls: 'btn-primary btn-market-buy'
  },
  {
    title: '25 Tokens da Noite',
    badge: 'TOKENS',
    bc: '#74c0fc',
    bg: 'rgba(116,192,252,0.15)',
    desc: 'Cotação: 16 Ouro / Token',
    price: 400,
    tokens: 25,
    btnText: '💠 Comprar 25 Tokens (400 Gold)',
    cls: 'btn-primary btn-market-buy'
  },
  {
    title: 'Venda de 50 Tokens',
    badge: 'COMPRA',
    bc: '#69db7c',
    bg: 'rgba(105,219,124,0.15)',
    desc: 'Paga 850 Ouro por 50 Tokens',
    tokens: 50,
    reward: 850,
    btnText: '⚡ Vender 50 Tokens (+850 Gold)',
    cls: 'btn-secondary btn-market-sell-tokens'
  }
];

export function renderMarketSection(): string {
  if (MARKET_ITEMS.length === 0) return '<div class="empty-state">Mercado vazio no momento.</div>';
  const cards = MARKET_ITEMS.map((item) => `
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

export function attachMarketEvents(container: HTMLElement): void {
  const buyBtns = container.querySelectorAll<HTMLButtonElement>('.btn-market-buy');
  buyBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const price = Number(btn.getAttribute('data-price') ?? 0);
      const tokens = Number(btn.getAttribute('data-tokens') ?? 0);
      const state = store.getState();
      if (state.character.gold < price) {
        return store.addLog(`Ouro insuficiente (${state.character.gold}/${price}).`, 'danger');
      }
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
      if (state.character.tokens < 50) {
        return store.addLog(`Tokens insuficientes (${state.character.tokens}/50).`, 'danger');
      }
      store.updateCharacter({ gold: state.character.gold + 850, tokens: state.character.tokens - 50 });
      store.addLog('🏛️ VENDA CONCLUÍDA! -50 Tokens vendidos por +850 Ouro!', 'gold');
    });
  }
}
