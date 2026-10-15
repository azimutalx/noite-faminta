import {
  CombatFighter,
  CombatTurnEvent,
  CombatBattleResult,
  GambitAction,
  GambitCondition,
  calculateCombatStats,
  calculateDamageDealt,
  evaluateGambitCondition
} from '@noite-faminta/shared';

export type RandomRollFn = () => number;

export function selectGambitAction(
  fighter: CombatFighter,
  enemy: CombatFighter
): { action: GambitAction; condition?: GambitCondition } {
  const sortedGambits = [...fighter.gambits].sort((a, b) => a.priority - b.priority);

  for (const gambit of sortedGambits) {
    const isTriggered = evaluateGambitCondition(
      gambit.condition,
      fighter.health,
      fighter.maxHealth,
      enemy.faction,
      Boolean(fighter.isInFrenzy),
      Boolean(enemy.isEvading)
    );

    if (isTriggered) {
      return { action: gambit.action, condition: gambit.condition };
    }
  }

  return { action: 'BASIC_ATTACK' };
}

function executeActionTurn(
  actor: CombatFighter,
  target: CombatFighter,
  round: number,
  rollFn: RandomRollFn
): CombatTurnEvent {
  const { action, condition } = selectGambitAction(actor, target);
  const actorStats = calculateCombatStats(actor.stats);
  const targetStats = calculateCombatStats(target.stats);

  const rollCrit = rollFn();
  const isCritical = rollCrit <= actorStats.criticalChance;
  const rollEvade = rollFn();
  const isEvaded = Boolean(target.isEvading) || (rollEvade <= targetStats.evasionChance && action !== 'SHIELD_BREAKER_STRIKE');

  // Reseta evasão temporária do alvo
  target.isEvading = false;

  let damageDealt = 0;
  let healingDone = 0;
  let narrative = '';

  if (isEvaded) {
    narrative = `${actor.name} tentou [${action}], mas ${target.name} esquivou-se graciosamente pelas sombras!`;
  } else {
    switch (action) {
      case 'BLOOD_DRAIN_RITE': {
        damageDealt = calculateDamageDealt(actorStats.occultAttack, targetStats.damageReductionPercent, isCritical, 1.8);
        healingDone = Math.floor(damageDealt * 0.5);
        narrative = `${actor.name} canalizou Rito de Drenagem de Sangue causando ${damageDealt} de dano e absorvendo ${healingDone} de vida!`;
        break;
      }
      case 'LUPINE_HEAL': {
        healingDone = Math.floor(actor.stats.vitality * 4.5);
        narrative = `${actor.name} uivou para a lua ancestral e regenerou ${healingDone} de vitalidade!`;
        break;
      }
      case 'SHIELD_BREAKER_STRIKE': {
        const reducedDefensePercent = targetStats.damageReductionPercent * 0.5;
        damageDealt = calculateDamageDealt(actorStats.physicalAttack * 1.25, reducedDefensePercent, isCritical, 1.5);
        narrative = `${actor.name} desferiu Golpe Esmagador ignorando a guarda inimiga e causando ${damageDealt} de dano!`;
        break;
      }
      case 'SHADOW_EVASION': {
        actor.isEvading = true;
        narrative = `${actor.name} dissolveu-se na névoa, preparando esquiva evasiva para o próximo golpe!`;
        break;
      }
      case 'FERAL_RAMPAGE': {
        damageDealt = calculateDamageDealt(actorStats.physicalAttack * 1.6, targetStats.damageReductionPercent, isCritical, 2.0);
        const recoil = Math.max(1, Math.floor(damageDealt * 0.10));
        actor.health = Math.max(0, actor.health - recoil);
        narrative = `${actor.name} entrou em Frenesi Selvagem causando ${damageDealt} de dano massivo (Sofreu ${recoil} de recuo)!`;
        break;
      }
      case 'BASIC_ATTACK':
      default: {
        damageDealt = calculateDamageDealt(actorStats.physicalAttack, targetStats.damageReductionPercent, isCritical, 1.6);
        const critText = isCritical ? ' [GOLPE CRÍTICO!]' : '';
        narrative = `${actor.name} atacou com ferocidade${critText}, infligindo ${damageDealt} de dano físico.`;
        break;
      }
    }
  }

  // Aplica dano e cura
  target.health = Math.max(0, target.health - damageDealt);
  actor.health = Math.min(actor.maxHealth, actor.health + healingDone);

  return {
    round,
    actorId: actor.id,
    actorName: actor.name,
    targetId: target.id,
    targetName: target.name,
    actionTaken: action,
    triggeredCondition: condition,
    damageDealt,
    healingDone,
    isCritical,
    isEvaded,
    actorHpAfter: actor.health,
    targetHpAfter: target.health,
    narrative
  };
}

export function executeCombatDuel(
  fighterA: CombatFighter,
  fighterB: CombatFighter,
  rollFn: RandomRollFn
): CombatBattleResult {
  const turns: CombatTurnEvent[] = [];
  let round = 1;
  const MAX_ROUNDS = 25;

  while (fighterA.health > 0 && fighterB.health > 0 && round <= MAX_ROUNDS) {
    // Ordem de iniciativa baseada em Agilidade
    const first = fighterA.stats.agility >= fighterB.stats.agility ? fighterA : fighterB;
    const second = first === fighterA ? fighterB : fighterA;

    // Primeiro ataque
    const turn1 = executeActionTurn(first, second, round, rollFn);
    turns.push(turn1);

    // Segundo ataque se o alvo ainda estiver de pé
    if (second.health > 0) {
      const turn2 = executeActionTurn(second, first, round, rollFn);
      turns.push(turn2);
    }

    round++;
  }

  const isAWinner = fighterA.health > fighterB.health;
  const winner = isAWinner ? fighterA : fighterB;
  const loser = isAWinner ? fighterB : fighterA;

  const xpAwarded = Math.floor(100 * Math.pow(loser.level, 1.2));
  const goldAwarded = Math.floor(60 * Math.pow(loser.level, 1.15));

  return {
    winnerId: winner.id,
    loserId: loser.id,
    totalRounds: Math.min(round - 1, MAX_ROUNDS),
    turns,
    finalHp: {
      [fighterA.id]: fighterA.health,
      [fighterB.id]: fighterB.health
    },
    xpAwarded,
    goldAwarded
  };
}
