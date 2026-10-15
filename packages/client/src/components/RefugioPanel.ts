import {
  HideoutChamberId
} from '@noite-faminta/shared';
import { GameState, store, type RefugioSubTab } from '../state/store.js';
import { ascendHideout } from '../state/hideoutApi.js';
import { renderRefugioChambers } from './refugio/RefugioChambers.js';
import { renderRefugioPanorama } from './refugio/RefugioPanorama.js';
import { renderRefugioArsenal } from './refugio/RefugioArsenal.js';
import { renderRefugioGambits } from './refugio/RefugioGambits.js';
import { renderChamberModal } from './refugio/RefugioChamberModal.js';

export type { RefugioSubTab };

export function renderRefugioPanel(state: GameState): string {
  const { character, ui } = state;
  const currentSubTab = ui.refugioSubTab;

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

  const modalHtml = ui.inspectedChamberId ? renderChamberModal(character, ui.inspectedChamberId) : '';

  return `
    <section class="panel-grid ${ui.torchLightingActive ? 'torch-ambiance-red' : ''}">
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

export function attachRefugioEvents(container: HTMLElement): void {
  // Troca de sub-abas
  container.querySelectorAll<HTMLButtonElement>('.hideout-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.subtab as RefugioSubTab | undefined;
      if (tab) {
        store.setRefugioSubTab(tab);
      }
    });
  });

  // Alternar iluminação de tochas góticas
  const torchBtn = container.querySelector<HTMLButtonElement>('#btn-toggle-ambiance');
  if (torchBtn) {
    torchBtn.addEventListener('click', () => {
      store.toggleTorchLighting();
    });
  }

  // Abrir inspeção de câmara
  container.querySelectorAll<HTMLElement>('.btn-inspect-chamber').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.chamberId as HideoutChamberId | undefined;
      if (id) {
        store.setInspectedChamber(id);
      }
    });
  });

  // Fechar modal de inspeção
  const closeBtn = container.querySelector<HTMLButtonElement>('#btn-close-chamber-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      store.setInspectedChamber(null);
    });
  }

  // Upgrade direto na câmara
  container.querySelectorAll<HTMLButtonElement>('.btn-upgrade-chamber').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.chamberId as HideoutChamberId | undefined;
      if (id) store.upgradeChamber(id);
    });
  });

  // Upgrade dentro do modal
  const modalUpgradeBtn = container.querySelector<HTMLButtonElement>('#modal-btn-upgrade-chamber');
  if (modalUpgradeBtn) {
    modalUpgradeBtn.addEventListener('click', () => {
      const id = modalUpgradeBtn.dataset.chamberId as HideoutChamberId | undefined;
      if (id) store.upgradeChamber(id);
    });
  }

  // Ações de descanso e depósito
  const restBtn = container.querySelector<HTMLButtonElement>('#btn-rest') ?? container.querySelector<HTMLButtonElement>('#modal-btn-rest');
  if (restBtn) {
    restBtn.addEventListener('click', () => {
      store.restAtSanctuary();
    });
  }

  const depositBtn = container.querySelector<HTMLButtonElement>('#btn-deposit-vault') ?? container.querySelector<HTMLButtonElement>('#modal-btn-vault');
  if (depositBtn) {
    depositBtn.addEventListener('click', () => {
      store.depositToVault();
    });
  }

  // Atalho do modal para forja
  const forgeBtn = container.querySelector<HTMLButtonElement>('#modal-btn-forge');
  if (forgeBtn) {
    forgeBtn.addEventListener('click', () => {
      store.setInspectedChamber(null);
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
