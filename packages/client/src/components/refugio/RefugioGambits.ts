import { CharacterProfile } from '@noite-faminta/shared';

export function renderRefugioGambits(character: CharacterProfile): string {
  const isVampire = character.faction === 'VAMPIRE';
  const healSkillName = isVampire ? 'Rito de Drenagem de Sangue' : 'Cura Lupina Ancestral';

  return `
    <div class="glass-panel accent-border">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); flex-wrap: wrap; gap: var(--space-2);">
        <div>
          <h2 style="font-size: 18px; color: #ff8787; margin: 0;">⚡ Matriz Tática de Gambits & IA Rúnica</h2>
          <div style="font-size: 12px; color: var(--color-silver-muted); margin-top: 2px;">
            Programação tática autoritativa executada turno a turno nos duelos e masmorras.
          </div>
        </div>
        <span class="badge" style="background: rgba(139,10,10,0.25); color: #ff8787; border: 1px solid rgba(220,20,20,0.4);">
          IA AUTORITATIVA
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3); margin-bottom: var(--space-4);">
        <div style="background: rgba(8,8,12,0.85); border: 1px solid rgba(139,10,10,0.35); padding: var(--space-2) var(--space-3); border-radius: var(--radius-xs); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span class="badge" style="background: rgba(139,10,10,0.3); color: #ff8787; font-size: 10px;">I</span>
            <span style="font-size: 12px; color: var(--color-silver-light);">SE <strong style="color: #ff8787;">HP &lt; 30%</strong></span>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #69db7c;">➜ ${healSkillName}</span>
        </div>
        <div style="background: rgba(8,8,12,0.85); border: 1px solid rgba(205,163,79,0.35); padding: var(--space-2) var(--space-3); border-radius: var(--radius-xs); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span class="badge" style="background: rgba(205,163,79,0.3); color: var(--color-gold-coin); font-size: 10px;">II</span>
            <span style="font-size: 12px; color: var(--color-silver-light);">SE <strong style="color: var(--color-gold-coin);">Inimigo Esquivando</strong></span>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #ffd43b;">➜ Golpe Esmagador</span>
        </div>
        <div style="background: rgba(8,8,12,0.85); border: 1px solid rgba(212,214,226,0.15); padding: var(--space-2) var(--space-3); border-radius: var(--radius-xs); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span class="badge" style="background: rgba(255,255,255,0.08); color: var(--color-silver-light); font-size: 10px;">III</span>
            <span style="font-size: 12px; color: var(--color-silver-light);"><strong style="color: var(--color-silver-light);">SEMPRE (PADRÃO)</strong></span>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #ff8787;">➜ Ataque Primário</span>
        </div>
      </div>

      <button id="btn-save-gambits" class="btn btn-secondary" style="width: 100%;">
        ⚡ Sincronizar Gambits no Servidor
      </button>
    </div>
  `;
}
