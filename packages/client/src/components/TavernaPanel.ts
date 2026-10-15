import { MercenaryContract } from '@noite-faminta/shared';
import { GameState, store } from '../state/store.js';
import { hireMercenary, registerPlayerAsMercenary } from '../state/mercenaryApi.js';

let cachedMercenaries: MercenaryContract[] = [
  {
    id: 'b1111111-1111-4111-8111-111111111111',
    ownerId: 'offline-player-carmilla',
    ownerName: 'Lorde_Valerius',
    mercenaryName: 'Victor, o Carrasco Carmesim',
    faction: 'VAMPIRE',
    level: 12,
    specialization: 'OCCULT_MAGIC',
    rentalPriceGold: 180,
    combatPower: 115,
    isAvailable: true
  },
  {
    id: 'b2222222-2222-4222-8222-222222222222',
    ownerId: 'offline-player-fenrir',
    ownerName: 'Matilha_Alfa',
    mercenaryName: 'Boran Garra-de-Ferro',
    faction: 'LYCAN',
    level: 14,
    specialization: 'BRUTE_FORCE',
    rentalPriceGold: 240,
    combatPower: 150,
    isAvailable: true
  },
  {
    id: 'b3333333-3333-4333-8333-333333333333',
    ownerId: 'offline-player-selene',
    ownerName: 'Sombra_Noturna',
    mercenaryName: 'Selene dos Olhos Gélidos',
    faction: 'VAMPIRE',
    level: 10,
    specialization: 'HYBRID',
    rentalPriceGold: 140,
    combatPower: 95,
    isAvailable: true
  }
];

function renderMercenaryCards(mercenaries: MercenaryContract[]): string {
  if (mercenaries.length === 0) {
    return '<div class="empty-state" style="padding: var(--space-4); text-align: center; color: var(--color-text-muted);">Nenhum mercenário disponível na Taverna no momento.</div>';
  }

  return mercenaries.map(m => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-2); border-left: 3px solid ${m.faction === 'VAMPIRE' ? '#ff8787' : '#f7b045'}; background: linear-gradient(180deg, #121219 0%, #08080c 100%);">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-1);">
          <strong style="color: var(--color-silver-light); font-size: 14px; font-family: var(--font-family-display);">${m.mercenaryName}</strong>
          <span class="badge ${m.faction === 'VAMPIRE' ? 'badge-vampire' : 'badge-lycan'}">${m.faction}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: var(--space-2);">
          Contratante: <strong style="color: var(--color-silver-light);">${m.ownerName}</strong> • Nível ${m.level} • ${m.specialization}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; background: rgba(0,0,0,0.4); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3); font-family: var(--font-family-mono);">
          <span>PODER DE BATALHA:</span>
          <strong style="color: #74c0fc;">⚡ ${m.combatPower}</strong>
        </div>
      </div>
      <button class="btn btn-primary btn-hire-mercenary" data-id="${m.id}" data-price="${m.rentalPriceGold}" style="width: 100%; font-size: 11px;">
        📜 Firmar Contrato (${m.rentalPriceGold} Gold)
      </button>
    </div>
  `).join('');
}

export function renderTavernaPanel(state: GameState): string {
  const { character } = state;

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Banner Temático da Taverna dos Renegados -->
      <div class="glass-panel" style="border-left: 3px solid var(--color-gold-coin);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
          <h2 style="font-size: 20px; color: var(--color-gold-coin);">🍻 Taverna dos Renegados</h2>
          <span class="badge" style="background: rgba(255, 215, 0, 0.15); color: var(--color-gold-coin);">MERCENÁRIOS OFFLINE</span>
        </div>
        <p style="color: var(--color-text-muted); font-size: 13px; line-height: 1.5; max-width: 680px;">
          Contrate personagens de outros jogadores offline para formar duplas e trios contra os chefes das Masmorras.
          A comissão de 90% é depositada com segurança no baú do refúgio do dono, com 10% de taxa da Taverna.
        </p>
      </div>

      <!-- Disponibilizar o Próprio Personagem para Aluguel -->
      <div class="glass-panel accent-border">
        <h3 style="font-size: 16px; margin-bottom: var(--space-2);">Disponibilizar Seu Personagem para Aluguel</h3>
        <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-3);">
          Enquanto você estiver offline, outros aventureiros poderão contratá-lo. Você não corre risco de morte e o Ouro vai direto para o seu baú secreto!
        </p>
        <div style="display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap;">
          <div style="font-size: 13px; color: var(--color-silver-light);">
            Seu Poder Calculado: <strong style="color: #74c0fc;">⚡ ${character.stats.strength * 2 + character.stats.agility * 2 + character.stats.occultism * 3}</strong>
          </div>
          <button id="btn-register-mercenary" class="btn btn-blood" style="padding: 8px 16px;">
            💰 Alugar Meu Personagem (Taxa: 150 Ouro)
          </button>
        </div>
      </div>

      <!-- Lista de Mercenários Prontos para Combate -->
      <div class="glass-panel">
        <h3 style="font-size: 16px; margin-bottom: var(--space-3);">Mercenários Disponíveis para Contratação</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
          ${renderMercenaryCards(cachedMercenaries)}
        </div>
      </div>
    </div>
  `;
}

export function attachTavernaEvents(container: HTMLElement): void {
  const hireBtns = container.querySelectorAll<HTMLButtonElement>('.btn-hire-mercenary');
  hireBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const mercId = btn.getAttribute('data-id');
      const price = Number(btn.getAttribute('data-price') ?? 0);
      if (!mercId) return;

      const state = store.getState();
      if (state.character.gold < price) {
        store.addLog(`Ouro insuficiente para contratar este mercenário (${state.character.gold}/${price} Ouro).`, 'danger');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Contratando...';
      const res = await hireMercenary(mercId);
      btn.disabled = false;
      btn.textContent = `⚔️ Contratar (${price} Ouro)`;

      if (res.data) {
        store.updateCharacter({ gold: res.data.updatedGold });
        store.addLog(`🍻 MERCENÁRIO CONTRATADO! ${res.data.mercenary.mercenaryName} agora reforça o seu grupo nas Masmorras! (-${price} Ouro).`, 'gold');
        cachedMercenaries = cachedMercenaries.filter(m => m.id !== mercId);
        store.setActiveTab('taverna');
      } else {
        store.addLog(`Falha ao contratar mercenário: ${res.error}`, 'danger');
      }
    });
  });

  const registerBtn = container.querySelector<HTMLButtonElement>('#btn-register-mercenary');
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      registerBtn.disabled = true;
      registerBtn.textContent = 'Registrando...';
      const res = await registerPlayerAsMercenary(150);
      registerBtn.disabled = false;
      registerBtn.textContent = '💰 Alugar Meu Personagem (Taxa: 150 Ouro)';

      if (res.data) {
        store.addLog(`🍻 TAVERNA: ${res.data.message}`, 'success');
      } else {
        store.addLog(`Erro ao cadastrar na Taverna: ${res.error}`, 'danger');
      }
    });
  }
}
