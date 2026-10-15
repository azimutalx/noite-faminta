import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';

interface AccountState {
  id: string;
  gold: number;
}

interface InventoryState {
  materials: Set<string>;
}

interface LedgerEntry {
  characterId: string;
  operation: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: number;
}

// Simulador de Motor Transacional com Lock Pessimista (SELECT ... FOR UPDATE)
class TransactionEngineSimulator {
  private accounts = new Map<string, AccountState>();
  private inventory = new Map<string, InventoryState>();
  private ledger: LedgerEntry[] = [];
  private activeLocks = new Map<string, Promise<void>>();

  public createCharacter(id: string, initialGold: number, materials: string[]): void {
    this.accounts.set(id, { id, gold: initialGold });
    this.inventory.set(id, { materials: new Set(materials) });
  }

  // Executa transação com lock pessimista serializado por recurso
  public async executeWithLock<T>(resourceId: string, transaction: () => Promise<T>): Promise<T> {
    while (this.activeLocks.has(resourceId)) {
      await this.activeLocks.get(resourceId);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.activeLocks.set(resourceId, lockPromise);

    try {
      // Simula jitter de latência de I/O de rede/banco
      await new Promise((r) => setTimeout(r, crypto.randomInt(2, 10)));
      return await transaction();
    } finally {
      this.activeLocks.delete(resourceId);
      releaseLock();
    }
  }

  public async spendGoldForForge(characterId: string, cost: number): Promise<{ success: boolean; error?: string }> {
    return this.executeWithLock(characterId, async () => {
      const char = this.accounts.get(characterId);
      if (!char) return { success: false, error: 'CHARACTER_NOT_FOUND' };

      // Verificação sob lock (Zero-Trust ACID)
      if (char.gold < cost) {
        return { success: false, error: 'INSUFFICIENT_FUNDS' };
      }

      const balanceBefore = char.gold;
      char.gold -= cost;
      const balanceAfter = char.gold;

      this.ledger.push({
        characterId,
        operation: 'FORGE_FEE',
        amount: cost,
        balanceBefore,
        balanceAfter,
        timestamp: Date.now()
      });

      return { success: true };
    });
  }

  public async consumeMaterialForForge(
    characterId: string,
    materialId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.executeWithLock(`mat-${materialId}`, async () => {
      const inv = this.inventory.get(characterId);
      if (!inv || !inv.materials.has(materialId)) {
        return { success: false, error: 'MATERIAL_NOT_FOUND' };
      }

      inv.materials.delete(materialId);
      return { success: true };
    });
  }

  public getCharacterGold(id: string): number {
    return this.accounts.get(id)?.gold ?? 0;
  }

  public getLedger(): LedgerEntry[] {
    return this.ledger;
  }
}

describe('Simulação de Ataques de Concorrência & Race Condition (ACID Lock Testing)', () => {
  it('impede Double Spending de Gold em 10 disparos concorrentes simultâneos', async () => {
    const engine = new TransactionEngineSimulator();
    const charId = 'vampire-concurrency-target-1';
    
    // Personagem possui 200 de Ouro; custo de cada forja é 150
    engine.createCharacter(charId, 200, []);

    // 10 requisições simultâneas disparadas exatamente no mesmo milissegundo
    const concurrentRequests = Array.from({ length: 10 }).map(() =>
      engine.spendGoldForForge(charId, 150)
    );

    const results = await Promise.all(concurrentRequests);

    const successfulAttempts = results.filter((r) => r.success);
    const rejectedAttempts = results.filter((r) => !r.success);

    // Exatamente UMA operação pode ser bem-sucedida
    expect(successfulAttempts.length).toBe(1);
    expect(rejectedAttempts.length).toBe(9);
    expect(rejectedAttempts.every((r) => r.error === 'INSUFFICIENT_FUNDS')).toBe(true);

    // Saldo final deve ser exatamente 50 (200 - 150), e nunca negativo
    expect(engine.getCharacterGold(charId)).toBe(50);
  });

  it('impede Duplo Consumo de Material Anatômico Único (UUID) sob concorrência', async () => {
    const engine = new TransactionEngineSimulator();
    const charId = 'lycan-material-target-2';
    const uniqueMaterialId = 'heart-inquisitor-uuid-999';

    // Personagem possui apenas 1 unidade deste material único
    engine.createCharacter(charId, 1000, [uniqueMaterialId]);

    // 5 transações paralelas tentando consumir o mesmo material no mesmo instante
    const concurrentCrafts = Array.from({ length: 5 }).map(() =>
      engine.consumeMaterialForForge(charId, uniqueMaterialId)
    );

    const results = await Promise.all(concurrentCrafts);

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Apenas 1 forja consegue consumir a peça; as outras 4 devem ser recusadas
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(4);
    expect(failures.every((r) => r.error === 'MATERIAL_NOT_FOUND')).toBe(true);
  });

  it('assegura integridade e encadeamento causal no Financial Audit Ledger', async () => {
    const engine = new TransactionEngineSimulator();
    const charId = 'audit-test-char-3';

    // Saldo inicial de 500 de Ouro
    engine.createCharacter(charId, 500, []);

    // 5 operações com valores diferentes disparadas concorrentemente
    const costs = [100, 100, 100, 100, 100];
    await Promise.all(costs.map((c) => engine.spendGoldForForge(charId, c)));

    const ledger = engine.getLedger();

    // Todas as 5 operações de 100 puderam ser atendidas (500 -> 0)
    expect(ledger.length).toBe(5);

    // Valida encadeamento causal sem quebras: balance_after da transação n é o balance_before da transação n+1
    for (let i = 1; i < ledger.length; i++) {
      const prev = ledger[i - 1]!;
      const curr = ledger[i]!;
      expect(curr.balanceBefore).toBe(prev.balanceAfter);
    }

    expect(engine.getCharacterGold(charId)).toBe(0);
  });
});
