import { getHideoutStage, calculateHideoutCost, CharacterProfile } from '@noite-faminta/shared';

const HIDEOUT_MILESTONES = [
  { level: 1, name: 'Baldio', icon: '🏚️' },
  { level: 2, name: 'Cabana', icon: '🛖' },
  { level: 4, name: 'Cripta', icon: '🏛️' },
  { level: 7, name: 'Mansão', icon: '🏰' },
  { level: 10, name: 'Castelo', icon: '👑' }
];

export function renderRefugioPanorama(character: CharacterProfile): string {
  const stage = getHideoutStage(character.hideoutLevel);
  const upgradeCost = calculateHideoutCost(character.hideoutLevel);
  const canAffordUpgrade = character.gold >= upgradeCost;
  const vaultPercent = Math.min(100, Math.round((character.vaultGold / character.vaultGoldLimit) * 100));

  const milestonesHtml = HIDEOUT_MILESTONES.map(m => {
    let statusClass = 'locked';
    if (character.hideoutLevel >= m.level) {
      const isCurrent = character.hideoutLevel === m.level ||
        (character.hideoutLevel > m.level && (m.level === 10 || character.hideoutLevel < (HIDEOUT_MILESTONES.find(n => n.level > m.level)?.level ?? 99)));
      statusClass = isCurrent ? 'current' : 'completed';
    }
    return `<div class="milestone-badge ${statusClass}"><span style="font-size: 18px;">${m.icon}</span><strong style="font-size: 11px; font-family: var(--font-family-display);">${m.name}</strong><span style="font-size: 9px; opacity: 0.7;">Nvl ${m.level}+</span></div>`;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Panorama da Fortaleza -->
      <div class="hideout-panorama-card">
        <div class="hideout-banner-frame">
          <img src="/assets/bitefight_hideout_banner.jpg" alt="${stage.title}" class="hideout-banner-img" />
          <div class="hideout-banner-overlay">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-2);">
              <div>
                <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 2px;">
                  <span style="font-size: 24px;">${stage.icon}</span>
                  <h2 style="font-size: 20px; color: var(--color-gold-coin); text-shadow: 0 2px 8px rgba(0,0,0,0.9);">${stage.title}</h2>
                  <span class="badge badge-gold">NÍVEL ${character.hideoutLevel}</span>
                </div>
                <div style="font-size: 12px; color: var(--color-silver-light); text-shadow: 0 1px 3px rgba(0,0,0,0.9);">${stage.subtitle}</div>
              </div>
              <button id="btn-upgrade-hideout" class="btn btn-primary" ${canAffordUpgrade ? '' : 'disabled'} style="font-size: 11px; padding: 6px 14px;">
                🔨 Ascensão Global (${upgradeCost.toLocaleString('pt-BR')} Gold)
              </button>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
            <p style="font-size: 12px; color: var(--color-silver-muted); line-height: 1.4; max-width: 680px;">
              ${stage.description}
            </p>
            <span class="badge" style="background: rgba(205,163,79,0.15); color: var(--color-gold-coin); font-size: 10px;">
              🛡️ ${stage.defenseBonusText}
            </span>
          </div>

          <!-- Marcos de Ascensão Arquitetural -->
          <div class="hideout-milestones-track">
            ${milestonesHtml}
          </div>
        </div>
      </div>

      <!-- Visão Geral do Cofre & Recursos -->
      <div class="glass-panel" style="border-top: 2px solid var(--color-gold-coin);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
          <h3 style="font-size: 16px; color: var(--color-gold-coin); margin: 0;">🪙 Catacumba do Tesouro & Cofre de Ouro</h3>
          <span class="badge badge-gold">CAPACIDADE: ${character.vaultGoldLimit.toLocaleString('pt-BR')} GOLD</span>
        </div>
        <p style="color: var(--color-text-muted); font-size: 12px; margin-bottom: var(--space-3); line-height: 1.4;">
          O ouro guardado no cofre permanece 100% blindado contra saques em duelos PvP e incursões rivais de distritos.
        </p>

        <div style="background: rgba(0,0,0,0.5); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border-gold); margin-bottom: var(--space-3); box-shadow: inset 0 2px 6px rgba(0,0,0,0.9);">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: var(--space-2); font-family: var(--font-family-mono);">
            <span style="color: var(--color-silver-muted);">OURO BLINDADO NO COFRE:</span>
            <span style="color: var(--color-gold-coin); font-weight: 700;">${character.vaultGold.toLocaleString('pt-BR')} / ${character.vaultGoldLimit.toLocaleString('pt-BR')} Gold</span>
          </div>
          <div class="progress-container" style="height: 14px;">
            <div class="progress-fill fill-xp" style="width: ${vaultPercent}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-text-muted); margin-top: var(--space-1);">
            <span>Ocupação do Cofre</span>
            <span>${vaultPercent}%</span>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <button id="btn-rest" class="btn btn-blood" style="flex: 1;">
            🩸 Descansar (Curar 100% HP)
          </button>
          <button id="btn-deposit-vault" class="btn btn-primary" style="flex: 1;">
            🪙 Depositar no Cofre
          </button>
        </div>
      </div>

      <!-- Tabela Clássica de Melhorias do Refúgio (Estilo BiteFight) -->
      <div style="margin-top: 4px;">
        <div style="font-family: var(--font-family-display); font-size: 13px; font-weight: 700; color: #f2f3f7; margin-bottom: 8px;">
          ⚔️ Melhorias do Refúgio (Defesa & Tesouros)
        </div>
        <table class="bf-stat-table">
          <tbody>
            <tr>
              <td style="width: 50px; text-align: center;"><span style="font-size: 24px;">📦</span></td>
              <td class="label"><strong>Baú de Tesouro</strong><br><span style="font-size: 10px; color: #8d8f9f;">Capacidade: 72.000 🪙</span></td>
              <td class="value" style="color: #69db7c;">Ativo (Nvl ${character.hideoutLevel})</td>
              <td style="text-align: right; font-family: var(--font-family-mono); font-size: 10px; color: #ff8787;">Soberania Nível ${character.hideoutLevel}</td>
            </tr>
            <tr>
              <td style="width: 50px; text-align: center;"><span style="font-size: 24px;">👑</span></td>
              <td class="label"><strong>Baú Real Ancestral</strong><br><span style="font-size: 10px; color: #8d8f9f;">Capacidade: 288.000 🪙</span></td>
              <td class="value" style="color: #ff8787;">${character.hideoutLevel >= 5 ? 'Ativo' : 'Não Ativo'}</td>
              <td style="text-align: right; font-size: 10px; color: #8d8f9f;">(Disponível nível 5+)</td>
            </tr>
            <tr>
              <td style="width: 50px; text-align: center;"><span style="font-size: 24px;">🗿</span></td>
              <td class="label"><strong>Gárgula Guardiã</strong><br><span style="font-size: 10px; color: #8d8f9f;">+15 Defesa contra invasores</span></td>
              <td class="value" style="color: #69db7c;">Ativo (Nvl ${character.hideoutRooms?.gargoyle_parapet ?? 1})</td>
              <td style="text-align: right; font-family: var(--font-family-mono); font-size: 10px; color: var(--color-gold-coin);">Ala Erguida</td>
            </tr>
            <tr>
              <td style="width: 50px; text-align: center;"><span style="font-size: 24px;">📖</span></td>
              <td class="label"><strong>Livro dos Condenados</strong><br><span style="font-size: 10px; color: #8d8f9f;">+20 Ocultismo & Sangue</span></td>
              <td class="value" style="color: #69db7c;">Ativo</td>
              <td style="text-align: right; font-family: var(--font-family-mono); font-size: 10px; color: #da77f2;">Grimório Aberto</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
