import { GameState, store } from '../state/store.js';
import { getPhysicalCondition, getConditionDetails } from '@noite-faminta/shared';

export function renderOverviewPanel(state: GameState): string {
  const { character } = state;
  const isVampire = character.faction === 'VAMPIRE';
  const avatarSrc = isVampire ? '/assets/vampire_avatar.jpg' : '/assets/werewolf_avatar.jpg';

  const condition = getPhysicalCondition(character.stamina, character.maxStamina, character.health);
  const condDetails = getConditionDetails(condition);

  const battleValue = (character.stats.strength * 12) +
    (character.stats.agility * 10) +
    (character.stats.occultism * 14) +
    (character.stats.vitality * 8);

  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Banner de Evento da Lua Cheia (Moon Blessing) -->
      <div class="bf-event-banner">
        <div style="flex: 1;">
          <div class="bf-event-title">
            <span>🌕</span>
            <span>Bênção da Noite Sombria (Moon Blessing)</span>
          </div>
          <p style="font-size: 11px; color: #a8aab8; margin-bottom: 8px;">
            A lua sangrenta brilha misteriosamente no zênite. Criaturas da escuridão recebem poderes ancestrais:
          </p>
          <ul class="bf-event-list">
            <li>-50% no custo de ouro para treino de atributos</li>
            <li>+50% de ouro em caçadas e saques na metrópole</li>
            <li>+250% de recompensas em missões de clã</li>
            <li>+50% de vitalidade máxima nas catacumbas</li>
          </ul>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 10px; color: #8d8f9f; text-transform: uppercase;">Evento Especial</div>
          <div class="bf-event-timer">Tempo restante: 2d 01:48:52</div>
          <span class="badge" style="background: rgba(139,10,10,0.4); border: 1px solid #8b1010; color: #ff8787; font-size: 10px; margin-top: 6px; display: inline-block;">
            Vampiros & Lupinos Ativos
          </span>
        </div>
      </div>

      <!-- Sub-Abas BiteFight -->
      <div class="bf-subtabs">
        <button class="bf-subtab-btn active" data-subtab="char">Personagem</button>
        <button class="bf-subtab-btn" data-subtab="attr">Atributos</button>
        <button class="bf-subtab-btn" data-subtab="stats">Estatísticas</button>
        <button class="bf-subtab-btn" data-subtab="mod">Modificações</button>
        <button class="bf-subtab-btn" data-subtab="talents">Talentos</button>
      </div>

      <!-- Grade de Perfil: Retrato + Tabela Listrada -->
      <div class="bf-profile-grid">
        <div class="bf-portrait-column">
          <div class="bf-portrait-box">
            <img src="${avatarSrc}" alt="${character.name}" id="bf-avatar-image" />
          </div>
          <button class="btn btn-secondary" id="btn-toggle-avatar" style="font-size: 10px; padding: 4px 8px;">
            ⇄ Alternar Retrato
          </button>
        </div>

        <div>
          <table class="bf-stat-table">
            <tbody>
              <tr>
                <td class="label">Reino / Província:</td>
                <td class="value">s1-br.noitefaminta.net</td>
              </tr>
              <tr>
                <td class="label">Linhagem / Raça:</td>
                <td class="value">${isVampire ? 'Caimita (Vampiro) 🩸' : 'Garou (Lupino) 🍃'}</td>
              </tr>
              <tr>
                <td class="label">ID do Jogador:</td>
                <td class="value">20415</td>
              </tr>
              <tr>
                <td class="label">Nome do Personagem:</td>
                <td class="value" style="color: #ffc9c9;">${character.name}</td>
              </tr>
              <tr>
                <td class="label">Nível de Poder:</td>
                <td class="value" style="color: var(--color-gold-coin);">${character.level}</td>
              </tr>
              <tr>
                <td class="label">Poder de Batalha:</td>
                <td class="value">${battleValue}</td>
              </tr>
              <tr>
                <td class="label">Posição no Ranking:</td>
                <td class="value">570º Lugar</td>
              </tr>
              <tr>
                <td class="label">Regeneração de Vida:</td>
                <td class="value">00:42:26 (45 HP / min)</td>
              </tr>
              <tr>
                <td class="label">Regeneração de Energia:</td>
                <td class="value" style="color: ${condDetails.color};">
                  05:27:39 (12 ST / h) [TAGMAR: ${condDetails.label.toUpperCase()}]
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inventário & Equipamentos em Acordeão Clássico -->
      <div>
        <div style="font-family: var(--font-family-display); font-size: 13px; font-weight: 700; color: #e2e4ef; margin-bottom: 8px;">
          Itens & Arsenal ( 3 / 35 )
        </div>

        <div class="bf-accordion">
          <div class="bf-accordion-header" data-accordion="gifts">
            <span class="bf-arrow">▸</span>
            <span>Dádivas & Relíquias ( 0 )</span>
          </div>
          <div class="bf-accordion-body" id="body-gifts" style="display: none;">
            <p style="font-size: 11px; color: #8d8f9f;">Nenhuma dádiva ou oferenda ativa no momento.</p>
          </div>
        </div>

        <div class="bf-accordion">
          <div class="bf-accordion-header" data-accordion="weapons">
            <span class="bf-arrow">▾</span>
            <span>Armas ( 1 )</span>
          </div>
          <div class="bf-accordion-body" id="body-weapons">
            <div class="bf-item-slot-vignette">
              <img src="/assets/arma_lamina_prata.svg" alt="Lâmina de Prata Ancestral" />
            </div>
            <div class="bf-item-specs">
              <div class="bf-item-title">Lâmina de Prata Ancestral</div>
              <div style="color: #8d8f9f; font-size: 10px;">(Seu inventário: 1 item)</div>
              <div>Preço de venda: <strong style="color: var(--color-gold-coin);">133 🪙</strong></div>
              <div style="color: #69db7c;">Força: +2 • Destreza: +1</div>
              <div style="color: #ff8787;">Requisito: nível 3</div>
            </div>
          </div>
        </div>

        <div class="bf-accordion">
          <div class="bf-accordion-header" data-accordion="armor">
            <span class="bf-arrow">▾</span>
            <span>Armaduras ( 1 )</span>
          </div>
          <div class="bf-accordion-body" id="body-armor">
            <div class="bf-item-slot-vignette">
              <img src="/assets/armadura_couraca_noite.svg" alt="Couraça da Noite Forjada" />
            </div>
            <div class="bf-item-specs">
              <div class="bf-item-title">Couraça da Noite Forjada</div>
              <div style="color: #8d8f9f; font-size: 10px;">(Seu inventário: 1 item)</div>
              <div>Preço de venda: <strong style="color: var(--color-gold-coin);">79 🪙</strong></div>
              <div style="color: #69db7c;">Força: +3 • Vitalidade: +2</div>
              <div style="color: #ff8787;">Requisito: nível 3</div>
            </div>
          </div>
        </div>

        <div class="bf-accordion">
          <div class="bf-accordion-header" data-accordion="jewellery">
            <span class="bf-arrow">▾</span>
            <span>Joias ( 1 )</span>
          </div>
          <div class="bf-accordion-body" id="body-jewellery">
            <div class="bf-item-slot-vignette">
              <img src="/assets/amuleto_selo_carmesim.svg" alt="Selo de Sangue de Karnstein" />
            </div>
            <div class="bf-item-specs">
              <div class="bf-item-title">Selo de Sangue de Karnstein</div>
              <div style="color: #8d8f9f; font-size: 10px;">(Seu inventário: 1 item)</div>
              <div>Preço de venda: <strong style="color: var(--color-gold-coin);">14 🪙</strong></div>
              <div style="color: #69db7c;">Ocultismo: +2 • Sangue: +10</div>
              <div style="color: #ff8787;">Requisito: nível 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachOverviewEvents(container: HTMLElement): void {
  // Acordeões colapsáveis
  container.querySelectorAll<HTMLElement>('.bf-accordion-header').forEach((hdr) => {
    hdr.addEventListener('click', () => {
      const target = hdr.dataset.accordion;
      if (!target) return;
      const body = container.querySelector<HTMLElement>(`#body-${target}`);
      const arrow = hdr.querySelector<HTMLElement>('.bf-arrow');
      if (body) {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'flex' : 'none';
        if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
      }
    });
  });

  // Alternar avatar entre Caimita e Lupino
  const toggleBtn = container.querySelector<HTMLButtonElement>('#btn-toggle-avatar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const char = store.getState().character;
      const nextFaction = char.faction === 'VAMPIRE' ? 'LYCAN' : 'VAMPIRE';
      store.updateCharacter({ faction: nextFaction });
      store.addLog(
        nextFaction === 'LYCAN'
          ? '🐺 Você despertou a fera interior: Linhagem Garou (Lupino) ativada!'
          : '🩸 O sangue nobre corre nas veias: Linhagem Caimita (Vampiro) ativada!',
        'info'
      );
    });
  }

  // Sub-abas
  container.querySelectorAll<HTMLButtonElement>('.bf-subtab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.subtab;
      if (sub === 'attr' || sub === 'talents') {
        store.setActiveTab('arvore');
      } else if (sub === 'mod') {
        store.setActiveTab('masmorras');
      }
    });
  });
}
