import { describe, it, expect } from 'vitest';
import {
  listAvailableMercenaries,
  getMercenaryById,
  calculateRentalSettlement,
  registerPlayerMercenary,
  markMercenaryHired
} from '../src/mercenaries/mercenaryGuild.js';

describe('Taverna dos Renegados & Aluguel de Mercenários Offline', () => {
  it('deve listar mercenários iniciais disponíveis na Taverna', () => {
    const list = listAvailableMercenaries();
    expect(list.length).toBeGreaterThanOrEqual(3);

    const first = list[0];
    expect(first).toBeDefined();
    expect(first?.rentalPriceGold).toBeGreaterThan(0);
    expect(first?.combatPower).toBeGreaterThan(0);
    expect(first?.isAvailable).toBe(true);
  });

  it('deve calcular a liquidação com 90% para o dono e 10% de taxa da Taverna (Gold Sink)', () => {
    const settlement = calculateRentalSettlement(200);
    expect(settlement.totalPriceGold).toBe(200);
    expect(settlement.guildFeeGold).toBe(20);
    expect(settlement.ownerCommissionGold).toBe(180);
    expect(settlement.ownerCommissionGold + settlement.guildFeeGold).toBe(200);
  });

  it('deve cadastrar um novo mercenário de jogador offline e torná-lo alugável', () => {
    const newContract = registerPlayerMercenary(
      'player-uuid-1234',
      'Vampiro_Lendario',
      'Kaelen [Mercenário Oculto]',
      'VAMPIRE',
      15,
      'OCCULT_MAGIC',
      160,
      300
    );

    expect(newContract.id).toBeDefined();
    expect(newContract.ownerId).toBe('player-uuid-1234');
    expect(newContract.rentalPriceGold).toBe(300);

    const found = getMercenaryById(newContract.id);
    expect(found).toBeDefined();
    expect(found?.mercenaryName).toBe('Kaelen [Mercenário Oculto]');
    expect(found?.isAvailable).toBe(true);
  });

  it('deve marcar mercenário como contratado e retirá-lo da lista de disponíveis', () => {
    const listBefore = listAvailableMercenaries();
    const target = listBefore[0];
    expect(target).toBeDefined();

    const hired = markMercenaryHired(target!.id);
    expect(hired).toBe(true);

    const check = getMercenaryById(target!.id);
    expect(check?.isAvailable).toBe(false);

    // Tentativa de recontratar mercenário ocupado deve falhar
    const hiredAgain = markMercenaryHired(target!.id);
    expect(hiredAgain).toBe(false);
  });
});
