import {
  CharacterProfile,
  HideoutChamberId,
  HIDEOUT_CHAMBERS,
  getChamberStatus,
  getChamberStageName
} from '@noite-faminta/shared';

export function renderChamberModal(character: CharacterProfile, chamberId: HideoutChamberId): string {
  const rooms = character.hideoutRooms ?? {};
  const currentLevel = rooms[chamberId] ?? 0;
  const cfg = HIDEOUT_CHAMBERS[chamberId];
  const status = getChamberStatus(chamberId, currentLevel, character.gold);
  const isMaxLevel = currentLevel >= cfg.maxLevel;
  const nextLevel = currentLevel + 1;
  const nextStageName = getChamberStageName(nextLevel);

  let specificActionBtn = '';
  if (chamberId === 'throne_sarcophagus') {
    specificActionBtn = `<button id="modal-btn-rest" class="btn btn-blood" style="font-size: 11px;">🩸 Descansar no Sarcófago (Curar 100% HP)</button>`;
  } else if (chamberId === 'catacomb_vault') {
    specificActionBtn = `<button id="modal-btn-vault" class="btn btn-secondary" style="font-size: 11px;">🪙 Guardar Ouro no Baú</button>`;
  } else if (chamberId === 'blood_forge') {
    specificActionBtn = `<button id="modal-btn-forge" class="btn btn-primary" style="font-size: 11px;">⚒️ Acessar Bigorna Ancestral</button>`;
  }

  return `
    <div id="chamber-modal-backdrop" class="chamber-modal-backdrop">
      <div class="chamber-modal-dialog">
        <div class="chamber-modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span style="font-size: 22px;">${cfg.icon}</span>
            <div>
              <h2 style="font-size: 18px; color: var(--color-gold-coin); margin: 0;">${cfg.name}</h2>
              <div style="font-size: 11px; color: var(--color-silver-muted); text-transform: uppercase;">
                ${cfg.category} • ${status.stageName}
              </div>
            </div>
          </div>
          <button id="btn-close-chamber-modal" class="btn btn-secondary" style="padding: 4px 10px; font-size: 14px;">✕</button>
        </div>

        <div class="chamber-modal-banner">
          <img src="${cfg.svgAsset}" alt="${cfg.name}" />
          <div style="position: absolute; bottom: var(--space-2); right: var(--space-3); background: rgba(0,0,0,0.8); border: 1px solid var(--color-border-gold); padding: 2px 8px; border-radius: var(--radius-xs); font-size: 10px; color: var(--color-gold-coin); font-weight: 700;">
            ${currentLevel > 0 ? `NÍVEL ${currentLevel} / ${cfg.maxLevel}` : 'RUÍNAS • PROJETO PENDENTE'}
          </div>
        </div>

        <div class="chamber-modal-content">
          <p style="font-size: 12px; color: var(--color-silver-light); line-height: 1.5; font-style: italic; background: rgba(0,0,0,0.3); padding: var(--space-2); border-left: 2px solid var(--color-gold-coin); margin: 0;">
            "${cfg.lore}"
          </p>

          <!-- Planta Arquitetural: O que o personagem está construindo -->
          <div class="construction-blueprint-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 12px; color: var(--color-gold-coin); text-transform: uppercase; letter-spacing: 0.05em;">
                📜 Planta Arquitetural & Progresso de Obra
              </strong>
              <span class="badge ${currentLevel > 0 ? 'badge-gold' : ''}">
                ${currentLevel > 0 ? `Estágio ${currentLevel}` : 'Não Erguido'}
              </span>
            </div>

            <div class="construction-tier-compare">
              <div class="tier-box">
                <div style="font-size: 10px; color: var(--color-silver-muted); text-transform: uppercase; margin-bottom: 2px;">
                  Estrutura Atual
                </div>
                <div style="font-weight: 700; color: var(--color-silver-light); font-size: 12px;">
                  ${status.stageName}
                </div>
                <div style="font-size: 11px; color: #69db7c; margin-top: 4px;">
                  ${status.bonus.currentValueText}
                </div>
              </div>

              <div class="tier-box next">
                <div style="font-size: 10px; color: var(--color-gold-coin); text-transform: uppercase; margin-bottom: 2px;">
                  Próxima Alvenaria (Evolução)
                </div>
                <div style="font-weight: 700; color: #ffd700; font-size: 12px;">
                  ${isMaxLevel ? 'Obra Arquitetural Plena' : nextStageName}
                </div>
                <div style="font-size: 11px; color: var(--color-silver-light); margin-top: 4px;">
                  ${isMaxLevel ? 'O santuário atingiu seu ápice gótico.' : status.bonus.nextValueText}
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-2); border-top: 1px solid rgba(212,214,226,0.1); flex-wrap: wrap; gap: var(--space-2);">
            <div>
              ${specificActionBtn}
            </div>

            <div style="display: flex; align-items: center; gap: var(--space-3);">
              ${!isMaxLevel ? `
                <div style="text-align: right;">
                  <div style="font-size: 10px; color: var(--color-silver-muted); text-transform: uppercase;">Custo da Obra</div>
                  <div style="font-size: 14px; font-weight: 700; color: var(--color-gold-coin); font-family: var(--font-family-mono);">
                    🪙 ${status.upgradeCost.toLocaleString('pt-BR')} Ouro
                  </div>
                </div>
              ` : ''}

              <button id="modal-btn-upgrade-chamber" class="btn ${currentLevel > 0 ? 'btn-primary' : 'btn-blood'}" data-chamber-id="${chamberId}" ${isMaxLevel || !status.canAfford ? 'disabled' : ''} style="font-size: 11px; padding: 8px 18px;">
                ${isMaxLevel ? '⭐ Máximo Atingido' : (currentLevel > 0 ? `🔨 Expandir para Nível ${nextLevel}` : '🧱 Erigir esta Ala')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
