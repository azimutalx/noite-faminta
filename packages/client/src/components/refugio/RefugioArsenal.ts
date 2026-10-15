import { CharacterProfile } from '@noite-faminta/shared';

export function renderRefugioArsenal(character: CharacterProfile): string {
  const isVampire = character.faction === 'VAMPIRE';

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Visão do Personagem (Avatar & Paperdoll RPG Autêntico) -->
      <div class="character-hero-card">
        <div class="avatar-frame">
          <img class="avatar-img" src="/assets/vampire_avatar.jpg" alt="Retrato de ${character.name}" />
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; min-width: 220px; flex: 1;">
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1); flex-wrap: wrap;">
            <h2 style="font-size: 22px; color: var(--color-silver-light); text-shadow: 0 0 12px rgba(139, 10, 10, 0.4);">${character.name}</h2>
            <span class="badge ${isVampire ? 'badge-vampire' : 'badge-lycan'}">${character.faction}</span>
            <span class="badge" style="background: rgba(205, 163, 79, 0.15); color: var(--color-gold-coin); border: 1px solid var(--color-border-gold);">Lorde Soberano</span>
          </div>
          <div style="font-size: 13px; color: var(--color-gold-coin); margin-bottom: var(--space-2); font-family: var(--font-family-display);">
            Karnstein • Nível ${character.level} • ${character.specialization}
          </div>
          <p style="font-size: 12px; color: var(--color-text-muted); line-height: 1.5; max-width: 520px;">
            Sua presença oculta assombra a metrópole sob o véu da noite. Comande seus lacaios nas criptas, forje relíquias e governe os distritos.
          </p>
        </div>

        <!-- Slots de Equipamentos (Paperdoll de RPG com Imagens Realistas) -->
        <div class="paperdoll-grid">
          <div class="equipment-slot slot-rarity-legendary" title="Arma Lendária (+38 Dano Físico, +8% Crítico)">
            <img src="/assets/arma_lamina_prata.svg" alt="Lâmina de Prata" class="slot-item-thumb" />
            <span class="slot-name">Arma</span>
            <span class="slot-equipped-name" style="color: #ff8787;">Lâmina de Prata</span>
            <span class="badge" style="font-size: 8px; padding: 1px 4px; background: rgba(255, 107, 107, 0.2); color: #ff8787;">LENDÁRIO</span>
          </div>
          <div class="equipment-slot slot-rarity-epic" title="Armadura Épica (+45 Mitigação de Dano)">
            <img src="/assets/armadura_couraca_noite.svg" alt="Couraça da Noite" class="slot-item-thumb" />
            <span class="slot-name">Armadura</span>
            <span class="slot-equipped-name" style="color: #da77f2;">Couraça da Noite</span>
            <span class="badge" style="font-size: 8px; padding: 1px 4px; background: rgba(218, 119, 242, 0.2); color: #da77f2;">ÉPICO</span>
          </div>
          <div class="equipment-slot slot-rarity-rare" title="Elmo Raro (+20 Vitalidade)">
            <img src="/assets/elmo_diadema_sombrio.svg" alt="Diadema Sombrio" class="slot-item-thumb" />
            <span class="slot-name">Elmo</span>
            <span class="slot-equipped-name" style="color: var(--color-gold-coin);">Diadema Sombrio</span>
            <span class="badge" style="font-size: 8px; padding: 1px 4px; background: rgba(252, 196, 25, 0.2); color: var(--color-gold-coin);">RARO</span>
          </div>
          <div class="equipment-slot slot-rarity-magic" title="Botas Mágicas (+15 Agilidade)">
            <img src="/assets/botas_passos_cinza.svg" alt="Passos de Cinza" class="slot-item-thumb" />
            <span class="slot-name">Botas</span>
            <span class="slot-equipped-name" style="color: #74c0fc;">Passos de Cinza</span>
            <span class="badge" style="font-size: 8px; padding: 1px 4px; background: rgba(116, 192, 252, 0.2); color: #74c0fc;">MÁGICO</span>
          </div>
          <div class="equipment-slot slot-rarity-legendary" title="Amuleto Lendário (+30 Ocultismo, +5% Drenagem)">
            <img src="/assets/amuleto_selo_carmesim.svg" alt="Selo Carmesim" class="slot-item-thumb" />
            <span class="slot-name">Amuleto</span>
            <span class="slot-equipped-name" style="color: #ff8787;">Selo Carmesim</span>
            <span class="badge" style="font-size: 8px; padding: 1px 4px; background: rgba(255, 107, 107, 0.2); color: #ff8787;">LENDÁRIO</span>
          </div>
        </div>
      </div>

      <!-- Relíquias Ativas Vinculadas -->
      <div class="glass-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
          <h3 style="font-size: 16px; color: var(--color-silver-light); margin: 0;">⚔️ Relíquias & Arsenal em Posse</h3>
          <span style="font-size: 12px; color: var(--color-text-muted);">4 Itens Ativos Vinculados</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: var(--space-3);">
          <div class="arsenal-item-card" style="border-left: 3px solid #ff8787;">
            <img src="/assets/arma_lamina_prata.svg" alt="Lâmina Carniceira" class="arsenal-item-img" />
            <div>
              <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">ARMA PRINCIPAL</div>
              <div style="font-weight: 700; color: #ff8787; font-size: 13px;">Lâmina Carniceira +2</div>
              <div style="font-size: 11px; color: var(--color-silver-muted); margin-top: 2px;">+32 Ataque • +8% Roubo de Sangue</div>
            </div>
          </div>
          <div class="arsenal-item-card" style="border-left: 3px solid #da77f2;">
            <img src="/assets/armadura_couraca_noite.svg" alt="Cota de Sombras" class="arsenal-item-img" />
            <div>
              <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">ARMADURA PEITORAL</div>
              <div style="font-weight: 700; color: #da77f2; font-size: 13px;">Cota de Sombras Ancestrais</div>
              <div style="font-size: 11px; color: var(--color-silver-muted); margin-top: 2px;">+45 Redução Dano • +120 HP Máx</div>
            </div>
          </div>
          <div class="arsenal-item-card" style="border-left: 3px solid var(--color-gold-coin);">
            <img src="/assets/amuleto_selo_carmesim.svg" alt="Relíquia Carmesim" class="arsenal-item-img" />
            <div>
              <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">AMULETO SAGRADO</div>
              <div style="font-weight: 700; color: var(--color-gold-coin); font-size: 13px;">Relíquia da Noite Vermelha</div>
              <div style="font-size: 11px; color: var(--color-silver-muted); margin-top: 2px;">+28 Poder Oculto • +10% Dano Mágico</div>
            </div>
          </div>
          <div class="arsenal-item-card" style="border-left: 3px solid #74c0fc;">
            <img src="/assets/botas_passos_cinza.svg" alt="Passos Silenciosos" class="arsenal-item-img" />
            <div>
              <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">BOTAS TÁTICAS</div>
              <div style="font-weight: 700; color: #74c0fc; font-size: 13px;">Passos Silenciosos</div>
              <div style="font-size: 11px; color: var(--color-silver-muted); margin-top: 2px;">+18 Agilidade • +6% Esquiva</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
