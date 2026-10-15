import { describe, it, expect } from 'vitest';
import { CombatFighter } from '@noite-faminta/shared';
import { executeCombatDuel, selectGambitAction } from '../src/combat/engine.js';

describe('Motor de Combate Tático (Gambit Engine)', () => {
  const vampire: CombatFighter = {
    id: 'vamp-1',
    name: 'Vampiro Assassino',
    faction: 'VAMPIRE',
    level: 3,
    health: 400,
    maxHealth: 400,
    stats: { strength: 18, agility: 22, vitality: 14, occultism: 20 },
    gambits: [
      { id: 'g1', condition: 'HP_BELOW_30', action: 'BLOOD_DRAIN_RITE', priority: 1 },
      { id: 'g2', condition: 'ENEMY_IS_LYCAN', action: 'SHIELD_BREAKER_STRIKE', priority: 2 },
      { id: 'g3', condition: 'ALWAYS', action: 'BASIC_ATTACK', priority: 3 }
    ]
  };

  const lycan: CombatFighter = {
    id: 'lycan-1',
    name: 'Guerreiro Garou',
    faction: 'LYCAN',
    level: 3,
    health: 450,
    maxHealth: 450,
    stats: { strength: 24, agility: 14, vitality: 22, occultism: 8 },
    gambits: [
      { id: 'g4', condition: 'HP_BELOW_30', action: 'LUPINE_HEAL', priority: 1 },
      { id: 'g5', condition: 'ALWAYS', action: 'FERAL_RAMPAGE', priority: 2 }
    ]
  };

  it('seleciona ação prioritária de Gambit baseada na condição do oponente', () => {
    const selected = selectGambitAction(vampire, lycan);
    // Como lycan é LYCAN e vampiro está acima de 30% HP, deve acionar ENEMY_IS_LYCAN -> SHIELD_BREAKER_STRIKE
    expect(selected.action).toBe('SHIELD_BREAKER_STRIKE');
    expect(selected.condition).toBe('ENEMY_IS_LYCAN');
  });

  it('aciona cura de emergência quando HP está crítico (< 30%)', () => {
    const woundedLycan = { ...lycan, health: 100 }; // 100/450 < 30%
    const selected = selectGambitAction(woundedLycan, vampire);
    expect(selected.action).toBe('LUPINE_HEAL');
    expect(selected.condition).toBe('HP_BELOW_30');
  });

  it('executa duelo completo e declara vencedor com logs detalhados', () => {
    // Seed/roll determinístico: 0.10 garante acerto normal sem evasão excessiva
    const mockRoll = () => 0.10;
    const result = executeCombatDuel(
      { ...vampire },
      { ...lycan },
      mockRoll
    );

    expect(result.totalRounds).toBeGreaterThan(0);
    expect(result.turns.length).toBeGreaterThan(0);
    expect(result.winnerId).toBeTruthy();
    expect(result.finalHp[result.loserId]).toBe(0);
    expect(result.xpAwarded).toBeGreaterThan(0);
    expect(result.goldAwarded).toBeGreaterThan(0);
  });
});
