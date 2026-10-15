import {
  CharacterProfile,
  HideoutChamberId,
  HIDEOUT_CHAMBERS,
  getChamberStatus
} from '@noite-faminta/shared';

export function renderRefugioChambers(character: CharacterProfile): string {
  const rooms = character.hideoutRooms ?? {};
  const chamberIds: HideoutChamberId[] = [
    'throne_sarcophagus',
    'catacomb_vault',
    'blood_forge',
    'ritual_sanctum',
    'gargoyle_parapet',
    'minion_crypt'
  ];

  let totalBuiltLevels = 0;
  const maxPossibleLevels = chamberIds.length * 5;

  const chamberCardsHtml = chamberIds.map(id => {
    const level = rooms[id] ?? 0;
    totalBuiltLevels += level;
    const status = getChamberStatus(id, level, character.gold);
    const cfg = HIDEOUT_CHAMBERS[id];
    const isUnlocked = level > 0;

    // Indicador visual de pips de alvenaria construída (1 a 5)
    let pipsHtml = '';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= level ? 'filled' : '';
      pipsHtml += `<div class="chamber-pip ${filled}" title="Nível ${i}"></div>`;
    }

    const actionBtnLabel = isUnlocked
      ? `🔨 Expandir (${status.upgradeCost.toLocaleString('pt-BR')} Ouro)`
      : `🧱 Erigir Ala (${status.upgradeCost.toLocaleString('pt-BR')} Ouro)`;

    const isMaxLevel = level >= cfg.maxLevel;

    return `
      <div class="chamber-card ${isUnlocked ? 'unlocked' : 'ruins'}" data-chamber-id="${id}">
        <div class="chamber-thumb-frame btn-inspect-chamber" data-chamber-id="${id}" title="Clique para Inspecionar Obras & Plantas">
          <img src="${cfg.svgAsset}" alt="${cfg.name}" class="chamber-thumb-img" />
          <span class="chamber-status-ribbon ${isUnlocked ? '' : 'ruins'}">
            ${isUnlocked ? `NÍVEL ${level} • ${status.stageName}` : 'RUÍNAS • NÃO CONSTRUÍDO'}
          </span>
        </div>

        <div class="chamber-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2);">
            <div>
              <div style="font-size: 11px; color: var(--color-gold-coin); text-transform: uppercase; font-family: var(--font-family-mono); letter-spacing: 0.05em;">
                ${cfg.icon} ${cfg.category}
              </div>
              <h3 style="font-size: 15px; color: var(--color-silver-light); margin-top: 2px;">
                ${cfg.name}
              </h3>
            </div>
            <span class="badge ${isUnlocked ? 'badge-gold' : ''}" style="${isUnlocked ? '' : 'background: rgba(220,20,20,0.15); color: #ff8787;'}">
              ${isUnlocked ? `NVL ${level}/5` : 'BLOQUEADO'}
            </span>
          </div>

          <p style="font-size: 11px; color: var(--color-text-muted); line-height: 1.35;">
            ${cfg.tagline}
          </p>

          <div class="chamber-pips-container">
            ${pipsHtml}
          </div>

          <div class="chamber-bonus-box">
            <div style="font-size: 10px; color: var(--color-gold-coin); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">
              🛡️ Efeito Arquitetural Ativo:
            </div>
            <div>${status.bonus.currentValueText}</div>
            ${!isMaxLevel ? `<div style="font-size: 10px; color: var(--color-silver-muted); margin-top: 3px; font-style: italic;">Próximo: ${status.bonus.nextValueText}</div>` : ''}
          </div>
        </div>

        <div class="chamber-actions-row">
          <button class="btn btn-secondary btn-inspect-chamber" data-chamber-id="${id}" style="font-size: 10px; padding: 6px 10px;" title="Ver Planta Detalhada">
            📜 Inspecionar
          </button>
          <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-blood'} btn-upgrade-chamber" data-chamber-id="${id}" ${isMaxLevel || !status.canAfford ? 'disabled' : ''} style="flex: 1; font-size: 10px; padding: 6px 12px;">
            ${isMaxLevel ? '⭐ Obra-Prima (Máx)' : actionBtnLabel}
          </button>
        </div>
      </div>
    `;
  }).join('');

  const sovereigntyPercent = Math.min(100, Math.round((totalBuiltLevels / maxPossibleLevels) * 100));

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Painel de Soberania & Canteiro das Câmaras -->
      <div class="sanctuary-blueprint-header">
        <div class="architect-crest-badge">
          <div class="architect-symbol-frame">
            🏰
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <h2 style="font-size: 17px; color: var(--color-gold-coin);">
                Santuário das Sombras: Câmaras & Canteiro de Obras
              </h2>
              <span class="badge badge-gold">${sovereigntyPercent}% CONSTRUÍDO</span>
            </div>
            <div style="font-size: 12px; color: var(--color-silver-light); margin-top: 2px;">
              ${totalBuiltLevels} de ${maxPossibleLevels} obras arquiteturais erguidas • Clique em qualquer ala para inspecionar
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--color-silver-muted); text-transform: uppercase;">Ouro Disponível na Bolsa</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-gold-coin); font-family: var(--font-family-mono);">
              🪙 ${character.gold.toLocaleString('pt-BR')}
            </div>
          </div>
          <button id="btn-toggle-ambiance" class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" title="Alternar iluminação das tochas do castelo">
            🕯️ Tochas
          </button>
        </div>
      </div>

      <!-- Grelha de Câmaras Interativas -->
      <div class="chambers-grid">
        ${chamberCardsHtml}
      </div>
    </div>
  `;
}
