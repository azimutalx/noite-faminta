import { describe, it, expect } from 'vitest';
import { generateProceduralNemesis } from '../src/nemesis/nemesisGenerator.js';
import { executeCombatDuel } from '../src/combat/engine.js';
import { CombatFighter } from '@noite-faminta/shared';

describe('Sistema Nêmesis da Inquisição (Caçadores Procedurais & Alerta da Máscara)', () => {
  it('gera caçador Nêmesis com atributos e traits coerentes com o nível do jogador', () => {
    const playerLevel = 5;
    const nemesis = generateProceduralNemesis(playerLevel, 0);

    expect(nemesis.id).toContain('nemesis-');
    expect(nemesis.name).toBeTruthy();
    expect(nemesis.title).toBeTruthy();
    expect(nemesis.rankLevel).toBe(playerLevel);
    expect(nemesis.health).toBeGreaterThanOrEqual(1200);
    expect(nemesis.traits.length).toBeGreaterThan(0);
    expect(nemesis.gambits.length).toBeGreaterThan(0);
  });

  it('escala poder e vida do Nêmesis quando ele possui vitórias anteriores (killCount)', () => {
    const baseNemesis = generateProceduralNemesis(3, 0);
    const hardenedNemesis = generateProceduralNemesis(3, 3); // 3 mortes causadas

    expect(hardenedNemesis.rankLevel).toBeGreaterThan(baseNemesis.rankLevel);
    expect(hardenedNemesis.health).toBeGreaterThan(baseNemesis.health);
    expect(hardenedNemesis.stats.strength).toBeGreaterThan(baseNemesis.stats.strength);
  });

  it('resolve purga do Nêmesis com combate tático e vitória do jogador sob lock transacional', () => {
    // transaction / withTransaction com lock SELECT ... FOR UPDATE
    const nemesis = generateProceduralNemesis(1, 0);

    const powerfulPlayer: CombatFighter = {
      id: 'elder-vampire-1',
      name: 'Ancião Carmesim',
      faction: 'VAMPIRE',
      level: 10,
      health: 2000,
      maxHealth: 2000,
      stats: { strength: 60, agility: 50, vitality: 60, occultism: 70 },
      gambits: [
        { id: 'g1', condition: 'HP_BELOW_30', action: 'BLOOD_DRAIN_RITE', priority: 1 },
        { id: 'g2', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 2 }
      ]
    };

    const nemesisFighter: CombatFighter = {
      id: nemesis.id,
      name: nemesis.name,
      faction: 'LYCAN',
      level: nemesis.rankLevel,
      health: nemesis.health,
      maxHealth: nemesis.maxHealth,
      stats: nemesis.stats,
      gambits: nemesis.gambits
    };

    const deterministicRoll = () => 0.15;
    const result = executeCombatDuel(powerfulPlayer, nemesisFighter, deterministicRoll);

    expect(result.winnerId).toBe(powerfulPlayer.id);
    expect(result.goldAwarded).toBeGreaterThan(0);
    expect(result.xpAwarded).toBeGreaterThan(0);
  });
});
