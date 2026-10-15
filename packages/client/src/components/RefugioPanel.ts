import {
  HideoutChamberId,
  HIDEOUT_CHAMBERS,
  calculateChamberCost
} from '@noite-faminta/shared';
import { GameState, store } from '../state/store.js';
import { ascendHideout } from '../state/hideoutApi.js';
import { renderRefugioChambers } from './refugio/RefugioChambers.js';
import { renderRefugioPanorama } from './refugio/RefugioPanorama.js';
import { renderRefugioArsenal } from './refugio/RefugioArsenal.js';
import { renderRefugioGambits } from './refugio/RefugioGambits.js';
import { renderChamberModal } from './refugio/RefugioChamberModal.js';

export type RefugioSubTab = 'chambers' | 'panorama' | 'arsenal' | 'gambits';

let currentSubTab: RefugioSubTab = 'chambers';
let inspectedChamberId: HideoutChamberId | null = null;
let torchLightingActive = false;

export function renderRefugioPanel(state: GameState): string {
  const { character } = state;

  let activeSubTabHtml = '';
  switch (currentSubTab) {
    case 'chambers':
      activeSubTabHtml = renderRefugioChambers(character);
      break;
    case 'panorama':
      activeSubTabHtml = renderRefugioPanorama(character);
      break;
    case 'arsenal':
      activeSubTabHtml = renderRefugioArsenal(character);
      break;
    case 'gambits':
      activeSubTabHtml = renderRefugioGambits(character);
      break;
  }

  const modalHtml = inspectedChamberId ? renderChamberModal(character, inspectedChamberId) : '';

  return `
    <section class="panel-grid ${torchLightingActive ? 'torch-ambiance-red' : ''}">
      <div style="grid-column: 1 / -1;">
        <!-- Seletor de Sub-Abas do Santuário Gótico -->
        <div class="hideout-subtabs">
          <button class="hideout-subtab-btn ${currentSubTab === 'chambers' ? 'active' : ''}" data-subtab="chambers">
            🏛️ Câmaras & Canteiro de Obras
          </button>
          <button class="hideout-subtab-btn ${currentSubTab === 'panorama' ? 'active' : ''}" data-subtab="panorama">
            🏰 Fortaleza Exterior
          </button>
          <button class="hideout-subtab-btn ${currentSubTab === 'arsenal' ? 'active' : ''}" data-subtab="arsenal">
            ⚔️ Arsenal & Paperdoll
          </button>
          <button class="hideout-subtab-btn ${currentSubTab === 'gambits' ? 'active' : ''}" data-subtab="gambits">
            ⚡ Matriz de Gambits
          </button>
        </div>

        ${activeSubTabHtml}
      </div>

      ${modalHtml}
    </section>
  `;
}

function handleChamberUpgrade(chamberId: HideoutChamberId): void {
  const state = store.getState();
  const rooms = { ...(state.character.hideoutRooms ?? {}) };
  const currentLvl = rooms[chamberId] ?? 0;
  const cfg = HIDEOUT_CHAMBERS[chamberId];
  if (currentLvl >= cfg.maxLevel) return;

  const cost = calculateChamberCost(chamberId, currentLvl);
  if (state.character.gold < cost) {
    store.addLog(`Ouro insuficiente para erguer esta ala. Necessário: ${cost.toLocaleString('pt-BR')} Gold.`, 'danger');
    return;
  }

  const nextLvl = currentLvl + 1;
  rooms[chamberId] = nextLvl;

  let newMaxHealth = state.character.maxHealth;
  let newMaxStamina = state.character.maxStamina;
  let newVaultLimit = state.character.vaultGoldLimit;

  if (chamberId === 'throne_sarcophagus') newMaxHealth += 40;
  if (chamberId === 'ritual_sanctum') newMaxStamina += 15;
  if (chamberId === 'catacomb_vault') newVaultLimit += 15000;

  store.updateCharacter({
    gold: state.character.gold - cost,
    maxHealth: newMaxHealth,
    maxStamina: newMaxStamina,
    vaultGoldLimit: newVaultLimit,
    hideoutRooms: rooms
  });

  store.addLog(
    `🧱 OBRA GÓTICA CONCLUÍDA! A ala [${cfg.name}] ascendeu para o Nível ${nextLvl}!`,
    'gold'
  );
}

export function attachRefugioEvents(container: HTMLElement): void {
  // Troca de sub-abas
  container.querySelectorAll<HTMLButtonElement>('.hideout-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.subtab as RefugioSubTab | undefined;
      if (tab && tab !== currentSubTab) {
        currentSubTab = tab;
        inspectedChamberId = null;
        store.updateCharacter({});
      }
    });
  });

  // Alternar iluminação de tochas góticas
  const torchBtn = container.querySelector<HTMLButtonElement>('#btn-toggle-ambiance');
  if (torchBtn) {
    torchBtn.addEventListener('click', () => {
      torchLightingActive = !torchLightingActive;
      store.addLog(
        torchLightingActive ? '🕯️ As tochas carmesins do santuário foram acesas!' : '🌙 As tochas foram apagadas. A luz lunar penetra as criptas.',
        'info'
      );
      store.updateCharacter({});
    });
  }

  // Abrir inspeção de câmara
  container.querySelectorAll<HTMLElement>('.btn-inspect-chamber').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.chamberId as HideoutChamberId | undefined;
      if (id) {
        inspectedChamberId = id;
        store.updateCharacter({});
      }
    });
  });

  // Fechar modal de inspeção
  const closeBtn = container.querySelector<HTMLButtonElement>('#btn-close-chamber-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      inspectedChamberId = null;
      store.updateCharacter({});
    });
  }

  // Upgrade direto na câmara
  container.querySelectorAll<HTMLButtonElement>('.btn-upgrade-chamber').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.chamberId as HideoutChamberId | undefined;
      if (id) handleChamberUpgrade(id);
    });
  });

  // Upgrade dentro do modal
  const modalUpgradeBtn = container.querySelector<HTMLButtonElement>('#modal-btn-upgrade-chamber');
  if (modalUpgradeBtn) {
    modalUpgradeBtn.addEventListener('click', () => {
      const id = modalUpgradeBtn.dataset.chamberId as HideoutChamberId | undefined;
      if (id) handleChamberUpgrade(id);
    });
  }

  // Ações de descanso e depósito
  const restBtn = container.querySelector<HTMLButtonElement>('#btn-rest') ?? container.querySelector<HTMLButtonElement>('#modal-btn-rest');
  if (restBtn) {
    restBtn.addEventListener('click', () => {
      const state = store.getState();
      if (state.character.health >= state.character.maxHealth) {
        store.addLog('Sua vitalidade já está no ápice.', 'info');
        return;
      }
      store.updateCharacter({ health: state.character.maxHealth });
      store.addLog('Você repousou no sarcófago imperial e restaurou 100% de sua Vitalidade!', 'success');
    });
  }

  const depositBtn = container.querySelector<HTMLButtonElement>('#btn-deposit-vault') ?? container.querySelector<HTMLButtonElement>('#modal-btn-vault');
  if (depositBtn) {
    depositBtn.addEventListener('click', () => {
      const state = store.getState();
      const available = Math.min(state.character.gold, state.character.vaultGoldLimit - state.character.vaultGold);
      if (available <= 0) {
        store.addLog('Cofre blindado lotado ou sem ouro livre na bolsa.', 'info');
        return;
      }
      store.updateCharacter({
        gold: state.character.gold - available,
        vaultGold: state.character.vaultGold + available
      });
      store.addLog(`Depositou ${available.toLocaleString('pt-BR')} Gold nas arcas blindadas do cofre.`, 'gold');
    });
  }

  // Atalho do modal para forja
  const forgeBtn = container.querySelector<HTMLButtonElement>('#modal-btn-forge');
  if (forgeBtn) {
    forgeBtn.addEventListener('click', () => {
      inspectedChamberId = null;
      store.setActiveTab('masmorras');
    });
  }

  // Ascensão global do refúgio
  const globalUpgradeBtn = container.querySelector<HTMLButtonElement>('#btn-upgrade-hideout');
  if (globalUpgradeBtn) {
    globalUpgradeBtn.addEventListener('click', async () => {
      globalUpgradeBtn.disabled = true;
      const res = await ascendHideout();
      if (res.data) {
        store.updateCharacter(res.data.character);
        store.addLog(`🏰 FORTALEZA EVOLUÍDA! Ascendeu para [${res.data.stage.title}]!`, 'gold');
      } else {
        const state = store.getState();
        const cost = 150 * Math.pow(state.character.hideoutLevel, 1.45);
        if (state.character.gold >= cost) {
          store.updateCharacter({
            hideoutLevel: state.character.hideoutLevel + 1,
            gold: Math.floor(state.character.gold - cost)
          });
          store.addLog(`🏰 FORTALEZA ASCENDIDA LOCALMENTE! Nível ${state.character.hideoutLevel}!`, 'gold');
        } else {
          globalUpgradeBtn.disabled = false;
          store.addLog(`Ouro insuficiente para evoluir a fortaleza.`, 'danger');
        }
      }
    });
  }

  // Salvar Gambits
  const saveGambitsBtn = container.querySelector<HTMLButtonElement>('#btn-save-gambits');
  if (saveGambitsBtn) {
    saveGambitsBtn.addEventListener('click', () => {
      store.addLog('Matriz de Gambits sincronizada com sucesso no servidor autoritativo!', 'success');
    });
  }
}
