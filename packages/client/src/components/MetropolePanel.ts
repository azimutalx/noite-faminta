import {
  calculateHuntingPower,
  HUNT_TARGET_CONFIGS,
  HuntTargetType,
  DistrictId,
  getPhysicalCondition,
  getConditionDetails,
  canPerformAction
} from '@noite-faminta/shared';
import { GameState, store } from '../state/store.js';
import { startHunt, startDuel } from '../state/api.js';
import { purgeNemesis } from '../state/nemesisApi.js';
import { contestDistrict, claimDividends } from '../state/districtApi.js';
import { renderMarketSection, attachMarketEvents } from './metropole/MetropoleMarket.js';

let selectedTarget: HuntTargetType = 'STREET_MORTAL';

const DISTRICTS: Array<{ id: DistrictId; name: string; color: string; clan: string; bonus: string; bc: string; pool?: number }> = [
  { id: 'FINANCIAL_CENTER', name: 'CENTRO FINANCEIRO', color: 'var(--color-gold-coin)', clan: 'Ordem das Sombras', bonus: '+5% Dividendos Mercado', bc: '#69db7c', pool: 5000 },
  { id: 'PORT_DOCKS', name: 'ZONA PORTUÁRIA', color: 'var(--color-silver-light)', clan: 'Matilha Rubra', bonus: '+15% Contrabando', bc: '#69db7c' },
  { id: 'HISTORIC_CATHEDRAL', name: 'CATEDRAL HISTÓRICA', color: '#ff8787', clan: 'Alerta Inquisição', bonus: 'Perigo de Emboscada', bc: '#ff8787' },
  { id: 'WILD_RESERVE', name: 'RESERVA DOS ERMOS', color: '#a9e34b', clan: 'Território Neutro', bonus: '-20% Stamina Lycan', bc: '#69db7c' }
];

function renderDistricts(characterStamina: number): string {
  if (DISTRICTS.length === 0) return '<div class="empty-state">Nenhum distrito sob disputa territorial.</div>';
  const cards = DISTRICTS.map(d => `
    <div style="background: linear-gradient(180deg, #13131b 0%, #07070a 100%); border: 1px solid var(--color-border-subtle); padding: var(--space-3); border-radius: var(--radius-xs); display: flex; flex-direction: column; justify-content: space-between; box-shadow: inset 0 1px 2px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.7);">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-weight: 700; color: ${d.color}; font-size: 12px; font-family: var(--font-family-display);">${d.name}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-text-muted);">Clã: <strong style="color: var(--color-silver-light);">${d.clan}</strong></div>
        <div class="territory-split-bar" title="Controle Territorial: 55% Vampiros | 45% Lycans">
          <div class="territory-vampire" style="width: 55%;"></div>
          <div class="territory-lycan" style="width: 45%;"></div>
        </div>
        <div style="font-size: 10px; color: ${d.bc}; margin-bottom: var(--space-2); font-weight: 600;">${d.bonus}</div>
      </div>
      <div style="display: flex; gap: var(--space-1); flex-wrap: wrap;">
        <button class="btn btn-secondary btn-contest-district" data-district="${d.id}" ${characterStamina < 15 ? 'disabled' : ''} style="padding: 4px 8px; font-size: 10px; flex: 1;">⚡ Disputar (15 ST)</button>
        ${d.id === 'FINANCIAL_CENTER' ? `<button class="btn btn-blood btn-claim-dividends" style="padding: 4px 8px; font-size: 10px; flex: 1;">💰 Taxas</button>` : ''}
      </div>
    </div>
  `).join('');
  return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-2); margin-top: var(--space-2);">${cards}</div>`;
}

export function renderMetropolePanel(state: GameState): string {
  const { character, logs } = state;
  const playerPower = calculateHuntingPower(character.stats, character.level);
  const targetConfig = HUNT_TARGET_CONFIGS[selectedTarget];
  const staminaCost = targetConfig.staminaCost;
  const condition = getPhysicalCondition(character.stamina, character.maxStamina, character.health);
  const condDetails = getConditionDetails(condition);
  const huntCheck = canPerformAction(character.stamina, character.health, staminaCost);
  const canDuel = character.stamina >= 15 && character.health > 0;
  const powerDiff = playerPower - targetConfig.minPower;
  const isAdvantaged = powerDiff >= 0;

  const logEntries = logs.length === 0
    ? '<div class="empty-state" style="color: var(--color-text-muted); font-size: 12px; padding: var(--space-3);">Nenhum evento registrado ainda nesta noite...</div>'
    : logs.map(l => `<div class="log-entry ${l.type}"><span style="color: var(--color-text-muted);">[${l.timestamp}]</span> ${l.text}</div>`).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <div class="metropolis-banner" style="background-image: url('/assets/metropolis_night.jpg');">
        <div class="metropolis-banner-overlay">
          <div style="font-weight: 700; font-size: 18px; color: var(--color-silver-light); text-shadow: 0 2px 4px rgba(0,0,0,0.8);">METRÓPOLE SOMBRIA</div>
          <div style="font-size: 12px; color: var(--color-silver-muted); text-shadow: 0 1px 2px rgba(0,0,0,0.9);">
            Névoa gótica, arranha-céus cinzentos e disputa territorial sob a vigília da Inquisição.
          </div>
        </div>
      </div>

      <div class="glass-panel">
        <h2 style="font-size: 18px; margin-bottom: var(--space-1);">Distritos de Influência</h2>
        <p style="color: var(--color-text-muted); font-size: 12px;">Guerra semanal de facções com dividendos de mercado e bônus territoriais.</p>
        ${renderDistricts(character.stamina)}
      </div>

      <div class="panel-grid">
        <div class="glass-panel accent-border">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <h2 style="font-size: 18px; margin: 0;">Caçada Noturna (Manhunt)</h2>
            <span class="badge" style="background: rgba(0,0,0,0.6); border: 1px solid ${condDetails.color}; color: ${condDetails.color}; font-size: 10px;" title="${condDetails.description}">
              TAGMAR: ${condDetails.label.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 11px; color: ${condDetails.color}; margin-bottom: var(--space-3);">
            ${condDetails.description}
          </div>

          <div style="margin-bottom: var(--space-3);">
            <label style="display: block; font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-1);">SELECIONE A PRESA:</label>
            <select id="select-target" style="width: 100%; background: #070709; color: var(--color-text-bright); border: 1px solid var(--color-border-subtle); padding: var(--space-2); border-radius: var(--radius-sm); font-family: var(--font-family-body);">
              <option value="STREET_MORTAL" ${selectedTarget === 'STREET_MORTAL' ? 'selected' : ''}>Mortal Solitário (Poder: 15, Custo: 10 Stamina)</option>
              <option value="NOCTURNAL_PATROL" ${selectedTarget === 'NOCTURNAL_PATROL' ? 'selected' : ''}>Patrulha Noturna (Poder: 50, Custo: 15 Stamina)</option>
              <option value="INQUISITION_OUTPOST" ${selectedTarget === 'INQUISITION_OUTPOST' ? 'selected' : ''}>Posto da Inquisição (Poder: 140, Custo: 25 Stamina)</option>
              <option value="ANCIENT_CRYPT" ${selectedTarget === 'ANCIENT_CRYPT' ? 'selected' : ''}>Cripta Ancestral (Poder: 320, Custo: 35 Stamina)</option>
            </select>
          </div>

          <div style="background: rgba(0,0,0,0.4); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3);">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: var(--space-1);">
              <span>Seu Poder Efetivo:</span> <strong style="color: var(--color-silver-light);">${Math.floor(playerPower * condDetails.powerMultiplier)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: var(--space-1);">
              <span>Dificuldade do Alvo:</span> <strong style="color: ${isAdvantaged ? '#51cf66' : '#ff6b6b'};">${targetConfig.minPower} Poder</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-text-muted);">
              <span>Custo: <strong style="color: ${character.stamina >= staminaCost ? '#74c0fc' : '#ff6b6b'};">${staminaCost} Stamina</strong> (Possui: ${character.stamina})</span>
              <span>Alerta: +${targetConfig.masqueradeAlert}%</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            <button id="btn-start-hunt" class="btn btn-blood" style="width: 100%;" ${!huntCheck.allowed ? 'disabled' : ''}>
              ${
                character.health <= 0
                  ? '💀 Em Torpor (Descanse no Sarcófago)'
                  : character.stamina < staminaCost
                  ? `⛔ Exausto (Stamina ${character.stamina}/${staminaCost} - Descanse)`
                  : `🩸 Iniciar Caçada (${staminaCost} Stamina)`
              }
            </button>
            <button id="btn-arena-duel" class="btn btn-secondary" style="width: 100%;" ${!canDuel ? 'disabled' : ''}>
              ${!canDuel ? '⛔ Arena Bloqueada (15 Stamina Requerida)' : '⚔️ Duelo com Gambits na Arena (15 Stamina)'}
            </button>
            <button id="btn-purge-nemesis" class="btn btn-secondary" style="width: 100%; border-color: #ff8787; color: #ff8787;">
              🛡️ Purgar Nêmesis da Inquisição
            </button>
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
      const cfg = HUNT_TARGET_CONFIGS[selectedTarget];
      const check = canPerformAction(state.character.stamina, state.character.health, cfg.staminaCost);
      if (!check.allowed) {
        store.addLog(check.reason!, 'danger');
        return;
      }

      huntBtn.disabled = true;
      huntBtn.textContent = '🩸 Caçando na Noite...';
      const res = await startHunt(selectedTarget, cfg.staminaCost);
      huntBtn.disabled = false;

      if (res.error) {
        store.addLog(`❌ Caçada impedida: ${res.message ?? res.error}`, 'danger');
        return;
      }

      if (res.data) {
        const { outcome, updatedStatus } = res.data;
        store.updateCharacter(updatedStatus);

        let logType: 'success' | 'danger' | 'gold' = outcome.success ? 'success' : 'danger';
        if (outcome.resolutionGrade === 'DECISIVE_SUCCESS' || outcome.resolutionGrade === 'GOOD_SUCCESS') {
          logType = 'gold';
        }

        store.addLog(outcome.narrative, logType);
        if (outcome.success) {
          store.addLog(
            `💰 Espólio: +${outcome.goldEarned} Gold, +${outcome.xpEarned} XP (-${outcome.damageTaken} HP, -${outcome.staminaConsumed} Stamina).`,
            'gold'
          );
        } else {
          store.addLog(
            `⚠️ Penalidade: Sofreu ${outcome.damageTaken} de dano! (+${outcome.alertIncrease}% Alerta, -${outcome.staminaConsumed} Stamina).`,
            'danger'
          );
        }
      }
    });
  }

  const arenaBtn = container.querySelector<HTMLButtonElement>('#btn-arena-duel');
  if (arenaBtn) {
    arenaBtn.addEventListener('click', async () => {
      const state = store.getState();
      if (state.character.stamina < 15) {
        store.addLog('⚡ Energia física insuficiente para a Arena (15 Stamina requerida). Descanse no Refúgio!', 'danger');
        return;
      }
      if (state.character.health <= 0) {
        store.addLog('💀 Personagem em Torpor cadavérico. Descanse no Sarcófago!', 'danger');
        return;
      }
      arenaBtn.disabled = true;
      store.addLog('Iniciando duelo com Gambits na Arena Noturna (-15 Stamina)...', 'info');
      const res = await startDuel('ARENA_RIVAL');
      arenaBtn.disabled = false;
      if (res.data) {
        const current = store.getState().character;
        store.updateCharacter({ stamina: Math.max(0, current.stamina - 15) });
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
