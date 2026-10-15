import {
  calculateStatTrainingCost,
  calculateCombatStats
} from '@noite-faminta/shared';
import { GameState, store } from '../state/store.js';
import { trainStat } from '../state/api.js';

type StatKey = 'strength' | 'agility' | 'vitality' | 'occultism';

interface StatMeta {
  key: StatKey;
  label: string;
  icon: string;
  description: string;
  gemClass: string;
  statColor: string;
}

const STAT_METAS: StatMeta[] = [
  {
    key: 'strength',
    label: 'Força Primordial',
    icon: '⚔️',
    description: 'Poder de dilaceração física, dano de garras e penetração de armadura.',
    gemClass: 'gem-ruby',
    statColor: 'var(--gem-ruby)'
  },
  {
    key: 'agility',
    label: 'Agilidade Noturna',
    icon: '⚡',
    description: 'Reflexos sobrenaturais, chance de acerto crítico e velocidade de evasão.',
    gemClass: 'gem-sapphire',
    statColor: 'var(--gem-sapphire)'
  },
  {
    key: 'vitality',
    label: 'Vitalidade Sanguínea',
    icon: '🩸',
    description: 'Reserva biológica de HP e resistência a ferimentos e hemorragia.',
    gemClass: 'gem-emerald',
    statColor: 'var(--gem-emerald)'
  },
  {
    key: 'occultism',
    label: 'Magia Oculta / Gnose',
    icon: '🔮',
    description: 'Domínio de ritos de sangue, drenagem vitae e projeção taumatúrgica.',
    gemClass: 'gem-amethyst',
    statColor: 'var(--gem-amethyst)'
  }
];

export function renderArvoreHibridaPanel(state: GameState): string {
  const { character } = state;
  const combatStats = calculateCombatStats(character.stats);

  const statCards = STAT_METAS.map((meta) => {
    const currentVal = character.stats[meta.key];
    const { goldCost } = calculateStatTrainingCost(currentVal, 1);
    const canAfford = character.gold >= goldCost;

    return `
      <div class="stat-gem-card ${meta.gemClass}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <div class="stat-orb-icon">${meta.icon}</div>
              <div>
                <h3 style="font-size: 15px; color: var(--color-silver-light);">${meta.label}</h3>
                <span style="font-size: 10px; color: ${meta.statColor}; text-transform: uppercase; font-weight: 700;">Gema da Linhagem</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: 900; color: ${meta.statColor}; font-family: var(--font-family-mono); text-shadow: 0 0 10px rgba(0,0,0,0.8);">${currentVal}</div>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-4); line-height: 1.4;">
            ${meta.description}
          </p>
        </div>

        <div style="border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); margin: -4px -4px 0 -4px; padding: var(--space-2) var(--space-3); border-radius: var(--radius-xs);">
          <div style="font-size: 12px; color: var(--color-gold-coin); font-family: var(--font-family-mono);">
            🪙 <strong>${goldCost}</strong> Gold
          </div>
          <button
            class="btn btn-blood btn-train"
            data-stat="${meta.key}"
            ${canAfford ? '' : 'disabled'}
            style="padding: var(--space-2) var(--space-4); font-size: 11px;"
          >
            Infundir (+1)
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Medalhão de Poder de Combate Derivado -->
      <div class="glass-panel accent-border">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-1);">
          <h2 style="font-size: 18px; color: var(--color-silver-light);">🛡️ Medalhão de Combate & Poderes Derivados</h2>
          <span class="badge" style="background: rgba(205,163,79,0.15); color: var(--color-gold-coin);">ISOMÓRFICO</span>
        </div>
        <p style="color: var(--color-text-muted); font-size: 12px; margin-bottom: var(--space-4);">
          Atributos puros calculados matematicamente pelo motor de combate compartilhado em tempo real.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-3);">
          <div style="background: linear-gradient(180deg, #180b0b 0%, #0a0404 100%); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid rgba(224,49,49,0.3); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
            <div style="font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; font-weight: 700;">⚔️ ATAQUE FÍSICO</div>
            <div style="font-size: 22px; font-weight: 900; color: #ff8787; font-family: var(--font-family-mono);">${combatStats.physicalAttack}</div>
            <div style="font-size: 10px; color: #ff8787;">Dano de Garras & Armas</div>
          </div>
          <div style="background: linear-gradient(180deg, #150d1a 0%, #08040a 100%); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid rgba(218,119,242,0.3); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
            <div style="font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; font-weight: 700;">🔮 PODER OCULTO</div>
            <div style="font-size: 22px; font-weight: 900; color: #da77f2; font-family: var(--font-family-mono);">${combatStats.occultAttack}</div>
            <div style="font-size: 10px; color: #da77f2;">Dano Taumatúrgico</div>
          </div>
          <div style="background: linear-gradient(180deg, #19140a 0%, #0a0803 100%); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid rgba(205,163,79,0.3); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
            <div style="font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; font-weight: 700;">🎯 TAXA DE CRÍTICO</div>
            <div style="font-size: 22px; font-weight: 900; color: var(--color-gold-coin); font-family: var(--font-family-mono);">${Math.round(combatStats.criticalChance * 100)}%</div>
            <div style="font-size: 10px; color: var(--color-gold-coin);">Multiplicador x1.75</div>
          </div>
          <div style="background: linear-gradient(180deg, #09170e 0%, #030a05 100%); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid rgba(81,207,102,0.3); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
            <div style="font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; font-weight: 700;">💨 CHANCE DE ESQUIVA</div>
            <div style="font-size: 22px; font-weight: 900; color: #69db7c; font-family: var(--font-family-mono);">${Math.round(combatStats.evasionChance * 100)}%</div>
            <div style="font-size: 10px; color: #69db7c;">Evasão de Dano</div>
          </div>
          <div style="background: linear-gradient(180deg, #10141a 0%, #05080c 100%); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid rgba(116,192,252,0.3); box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
            <div style="font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; font-weight: 700;">🛡️ MITIGAÇÃO DE DANO</div>
            <div style="font-size: 22px; font-weight: 900; color: #74c0fc; font-family: var(--font-family-mono);">${Math.round(combatStats.damageReductionPercent * 100)}%</div>
            <div style="font-size: 10px; color: #74c0fc;">Armadura Resistente</div>
          </div>
        </div>
      </div>

      <!-- Altar das 4 Gemas de Linhagem -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
        ${statCards}
      </div>
    </div>
  `;
}

export function attachArvoreHibridaEvents(container: HTMLElement): void {
  const trainButtons = container.querySelectorAll<HTMLButtonElement>('.btn-train');
  trainButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const stat = btn.getAttribute('data-stat') as StatKey | null;
      if (!stat) return;

      const state = store.getState();
      const currentVal = state.character.stats[stat];
      const { goldCost } = calculateStatTrainingCost(currentVal, 1);

      if (state.character.gold < goldCost) {
        store.addLog('Gold insuficiente para aprimorar este atributo.', 'danger');
        return;
      }

      // Chamada autoritativa via API backend com transação ACID e ledger
      const res = await trainStat(stat, 1);
      if (res.data) {
        store.updateCharacter(res.data.character);
        store.addLog(res.data.message, 'success');
      } else {
        store.addLog(`Erro ao aprimorar atributo: ${res.message ?? res.error}`, 'danger');
      }
    });
  });
}

