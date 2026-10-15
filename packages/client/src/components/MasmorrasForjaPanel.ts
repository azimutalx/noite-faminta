import { GameState, store } from '../state/store.js';
import { raidDungeonBoss, forgeEquipment } from '../state/api.js';
import { DungeonBossId, ForgeRecipeId, ItemSlot } from '@noite-faminta/shared';

export function renderMasmorrasForjaPanel(state: GameState): string {
  const { character, materials } = state;

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- Seção 1: Masmorras de Chefes & Carving -->
      <section class="glass-panel accent-border">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
          <div>
            <h2 style="font-size: 20px; color: var(--color-silver-light); margin-bottom: 2px;">
              🗡️ Criptas & Bestiário Ancestral (Carving Anatômico)
            </h2>
            <p style="font-size: 12px; color: var(--color-text-muted);">
              Enfrente abominações lendárias em duelos táticos e extraia órgãos sobrenaturais via Carving pós-combate.
            </p>
          </div>
          <span class="badge" style="background: rgba(220, 20, 20, 0.2); color: #ff8787; border: 1px solid rgba(220,20,20,0.4);">PVE TÁTICO</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
          <!-- Chefe 1: Lorde Inquisidor Malachi -->
          <div class="boss-bounty-card" style="border-top-color: var(--color-gold-coin);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                <strong style="color: var(--color-gold-coin); font-size: 15px; font-family: var(--font-family-display);">Lorde Malachi</strong>
                <span class="badge badge-gold">AMEAÇA NÍVEL 5</span>
              </div>
              <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-3); line-height: 1.4;">
                O Flagelo Sagrado. Empunha lâminas purificadoras e relíquias de prata sagrada.
              </p>
              <div style="font-size: 11px; background: rgba(0, 0, 0, 0.4); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3); font-family: var(--font-family-mono);">
                <div>🩸 <strong>Carving:</strong> Coração de Inquisidor (45%), Placa Sagrada (75%)</div>
                <div style="color: var(--color-gold-coin); margin-top: 2px;">⚡ 20 Stamina • 🏆 +250 Gold, +500 XP</div>
              </div>
            </div>
            <button class="btn btn-primary btn-raid" data-boss="INQUISITOR_MALACHI" style="width: 100%;">
              ⚔️ Invadir Cripta Inquisitorial
            </button>
          </div>

          <!-- Chefe 2: Alfa Ancestral Fenrir -->
          <div class="boss-bounty-card" style="border-top-color: #ff6b6b;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                <strong style="color: #ff6b6b; font-size: 15px; font-family: var(--font-family-display);">Alfa Fenrir</strong>
                <span class="badge" style="background: rgba(224, 49, 49, 0.2); color: #ff8787;">AMEAÇA NÍVEL 8</span>
              </div>
              <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-3); line-height: 1.4;">
                A Fera da Lua de Sangue. Lycan primordial com regeneração e ataques dilacerantes.
              </p>
              <div style="font-size: 11px; background: rgba(0, 0, 0, 0.4); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3); font-family: var(--font-family-mono);">
                <div>🩸 <strong>Carving:</strong> Presa de Titã (40%), Tendão Ancestral (70%)</div>
                <div style="color: var(--color-gold-coin); margin-top: 2px;">⚡ 25 Stamina • 🏆 +420 Gold, +850 XP</div>
              </div>
            </div>
            <button class="btn btn-blood btn-raid" data-boss="ANCIENT_FENRIR" style="width: 100%;">
              🐾 Caçar Fera Primordial
            </button>
          </div>

          <!-- Chefe 3: Vampira Carmesim Carmilla -->
          <div class="boss-bounty-card" style="border-top-color: #da77f2;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                <strong style="color: #da77f2; font-size: 15px; font-family: var(--font-family-display);">Soberana Carmilla</strong>
                <span class="badge" style="background: rgba(218, 119, 242, 0.2); color: #da77f2;">AMEAÇA NÍVEL 12</span>
              </div>
              <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: var(--space-3); line-height: 1.4;">
                A Matriarca da Cripta Esquecida. Mestra em feitiçaria e ritos de dreno de sangue.
              </p>
              <div style="font-size: 11px; background: rgba(0, 0, 0, 0.4); padding: var(--space-2); border-radius: var(--radius-xs); border: 1px solid var(--color-border-subtle); margin-bottom: var(--space-3); font-family: var(--font-family-mono);">
                <div>🩸 <strong>Carving:</strong> Sangue Carmesim (30%), Véu Ancestral (60%)</div>
                <div style="color: var(--color-gold-coin); margin-top: 2px;">⚡ 30 Stamina • 🏆 +650 Gold, +1300 XP</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-raid" data-boss="CRIMSON_CARMILLA" style="width: 100%; border-color: #da77f2; color: #da77f2;">
              🩸 Desafiar Soberana Carmesim
            </button>
          </div>
        </div>
      </section>

      <!-- Seção 2: Forja Ancestral de Sangue & Prata -->
      <section class="glass-panel" style="border-top: 2px solid var(--color-gold-coin);">
        <div class="forge-banner-card">
          <img src="/assets/ferramenta_forja_bigorna.svg" alt="Bigorna Vulcânica" class="forge-banner-img" />
          <div>
            <h2 style="font-size: 19px; color: var(--color-gold-coin); margin-bottom: 2px;">
              🔥 Bigorna Vulcânica & Forja Rúnica
            </h2>
            <p style="font-size: 12px; color: var(--color-silver-light);">
              Invoque as brasas ancestrais com partes anatômicas para forjar peças com afixos procedurais.
            </p>
          </div>
        </div>

        <!-- Inventário de Materiais Anatômicos Coletados -->
        <div style="margin-bottom: var(--space-4); background: rgba(8, 8, 12, 0.85); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid var(--color-border-subtle); box-shadow: inset 0 2px 6px rgba(0,0,0,0.9);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <strong style="font-size: 12px; color: var(--color-silver-light);">🧪 Frascos & Materiais de Carving em Posse:</strong>
            <span style="font-size: 11px; color: var(--color-gold-coin); font-family: var(--font-family-mono); font-weight: 700;">${materials.length} partes</span>
          </div>
          ${
            materials.length === 0
              ? '<div class="empty-state" style="font-size: 11px; padding: var(--space-2); color: var(--color-text-muted);">Nenhum material anatômico coletado. Derrote chefes na masmorra acima para extrair partes via Carving!</div>'
              : `<div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">${materials.map((m) => `<span class="badge" style="background: rgba(180, 182, 195, 0.12); border: 1px solid rgba(212,214,226,0.2); color: var(--color-silver-light); font-size: 11px;">🥩 ${m.name}</span>`).join('')}</div>`
          }
        </div>

        <!-- Receitas de Forja com Imagens Realistas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          <div class="card" style="border-top: 2px solid #74c0fc;">
            <div class="forge-recipe-header">
              <img src="/assets/arma_lamina_prata.svg" alt="Lâmina" class="forge-recipe-img" />
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-silver-light); font-size: 14px;">Lâmina de Sangue & Prata</strong>
                  <span class="badge" style="background: rgba(116, 192, 252, 0.15); color: #74c0fc;">ARMA</span>
                </div>
                <div style="font-size: 11px; color: var(--color-text-muted);">Forja com 2 afixos procedurais</div>
              </div>
            </div>
            <div style="font-size: 11px; margin-bottom: var(--space-3); color: var(--color-silver-muted); font-family: var(--font-family-mono);">
              <div>Requisito: 1x Coração ou Presa</div>
              <div style="color: var(--color-gold-coin);">Custo: <strong>150 Gold</strong> (Possui: ${character.gold} Gold)</div>
            </div>
            <button class="btn btn-primary btn-forge" data-recipe="FORGE_WEAPON_BLADE" data-slot="WEAPON" style="width: 100%;">
              🔨 Forjar Lâmina Ancestral
            </button>
          </div>

          <div class="card" style="border-top: 2px solid #69db7c;">
            <div class="forge-recipe-header">
              <img src="/assets/armadura_couraca_noite.svg" alt="Couraça" class="forge-recipe-img" />
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-silver-light); font-size: 14px;">Couraça de Titã da Noite</strong>
                  <span class="badge" style="background: rgba(105, 219, 124, 0.15); color: #69db7c;">ARMADURA</span>
                </div>
                <div style="font-size: 11px; color: var(--color-text-muted);">Defesa base + 2 afixos procedurais</div>
              </div>
            </div>
            <div style="font-size: 11px; margin-bottom: var(--space-3); color: var(--color-silver-muted); font-family: var(--font-family-mono);">
              <div>Requisito: 1x Tendão ou Placa</div>
              <div style="color: var(--color-gold-coin);">Custo: <strong>200 Gold</strong> (Possui: ${character.gold} Gold)</div>
            </div>
            <button class="btn btn-secondary btn-forge" data-recipe="FORGE_ARMOR_PLATE" data-slot="ARMOR" style="width: 100%;">
              🔨 Forjar Couraça Pesada
            </button>
          </div>

          <div class="card" style="border-top: 2px solid #da77f2;">
            <div class="forge-recipe-header">
              <img src="/assets/amuleto_selo_carmesim.svg" alt="Relíquia" class="forge-recipe-img" />
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-silver-light); font-size: 14px;">Relíquia da Lua Carmesim</strong>
                  <span class="badge" style="background: rgba(218, 119, 242, 0.15); color: #da77f2;">AMULETO</span>
                </div>
                <div style="font-size: 11px; color: var(--color-text-muted);">Poder oculto elevado e taumaturgia</div>
              </div>
            </div>
            <div style="font-size: 11px; margin-bottom: var(--space-3); color: var(--color-silver-muted); font-family: var(--font-family-mono);">
              <div>Requisito: 1x Sangue Carmesim</div>
              <div style="color: var(--color-gold-coin);">Custo: <strong>350 Gold</strong> (Possui: ${character.gold} Gold)</div>
            </div>
            <button class="btn btn-secondary btn-forge" data-recipe="FORGE_AMULET_RELIC" data-slot="AMULET" style="width: 100%;">
              🔨 Forjar Relíquia Ancestral
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function attachMasmorrasForjaEvents(container: HTMLElement): void {
  const raidButtons = container.querySelectorAll<HTMLButtonElement>('.btn-raid');
  raidButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const bossId = btn.getAttribute('data-boss') as DungeonBossId | null;
      if (!bossId) return;

      btn.disabled = true;
      btn.textContent = '⚔️ Combatendo...';
      store.addLog(`Incursionando nas criptas profundas contra o chefe...`, 'info');

      const res = await raidDungeonBoss(bossId);
      btn.disabled = false;
      btn.textContent = '⚔️ Invadir Cripta';

      if (res.error || !res.data) {
        store.addLog(`Falha na incursão: ${res.message ?? res.error}`, 'danger');
        return;
      }

      const raid = res.data;
      if (raid.playerWon) {
        store.addLog(
          `🏆 VITÓRIA! ${raid.bossName} foi derrotado em ${raid.battleResult.totalRounds} turnos! Recompensa: +${raid.goldAwarded} Ouro, +${raid.xpAwarded} XP.`,
          'success'
        );

        if (raid.carvedMaterials.length > 0) {
          const partsList = raid.carvedMaterials.map((m) => m.partName).join(', ');
          store.addLog(`🩸 CARVING EXTRAÍDO: ${partsList}!`, 'gold');
          const newMats = raid.carvedMaterials.map((m) => ({
            id: m.id,
            template_id: m.id,
            name: m.partName
          }));
          store.addMaterials(newMats);
        }

        const current = store.getState().character;
        store.updateCharacter({
          gold: current.gold + raid.goldAwarded,
          experience: current.experience + raid.xpAwarded,
          stamina: Math.max(0, current.stamina - raid.staminaConsumed)
        });
      } else {
        store.addLog(`💀 DERROTA: Você sucumbiu perante o poder de ${raid.bossName}.`, 'danger');
        const current = store.getState().character;
        store.updateCharacter({
          stamina: Math.max(0, current.stamina - raid.staminaConsumed)
        });
      }
    });
  });

  const forgeButtons = container.querySelectorAll<HTMLButtonElement>('.btn-forge');
  forgeButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const recipeId = btn.getAttribute('data-recipe') as ForgeRecipeId | null;
      const targetSlot = btn.getAttribute('data-slot') as ItemSlot | null;
      if (!recipeId || !targetSlot) return;

      const state = store.getState();
      if (state.materials.length === 0) {
        store.addLog('Você não possui partes anatômicas de Carving para forjar!', 'danger');
        return;
      }

      const materialToUse = state.materials[0]!;
      btn.disabled = true;
      btn.textContent = '🔥 Forjando nas Brasas...';

      const res = await forgeEquipment(recipeId, targetSlot, [materialToUse.id]);
      btn.disabled = false;
      btn.textContent = '🔨 Forjar';

      if (res.error || !res.data) {
        store.addLog(`Erro na forja ancestral: ${res.message ?? res.error}`, 'danger');
        return;
      }

      const { forgedItem, goldSpent } = res.data;
      const affixesText = forgedItem.affixes.map((a) => a.name).join(' & ');
      store.addLog(
        `✨ FORJA CONCLUÍDA! Criado: [${forgedItem.name}] (Raridade: ${forgedItem.rarity}, Afixos: ${affixesText}). Custo pago: ${goldSpent} Ouro.`,
        'gold'
      );

      const remainingMats = state.materials.filter((m) => m.id !== materialToUse.id);
      store.setMaterials(remainingMats);
      store.updateCharacter({
        gold: Math.max(0, state.character.gold - goldSpent)
      });
    });
  });
}
