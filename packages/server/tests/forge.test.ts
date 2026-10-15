import { describe, it, expect } from 'vitest';
import { DUNGEON_BOSSES, getDungeonBoss } from '../src/dungeons/bosses.js';
import {
  FORGE_RECIPES,
  extractCarvingLoot,
  executeAncestralForge
} from '../src/crafting/forgeEngine.js';

describe('Sistema de Masmorras & Forja Ancestral', () => {
  it('retorna os chefes de masmorra cadastrados com dados consistentes', () => {
    const malachi = getDungeonBoss('INQUISITOR_MALACHI');
    expect(malachi).toBeDefined();
    expect(malachi?.name).toContain('Malachi');
    expect(malachi?.carvingTable.length).toBeGreaterThanOrEqual(2);
    expect(malachi?.gambits.length).toBeGreaterThan(0);

    const fenrir = getDungeonBoss('ANCIENT_FENRIR');
    expect(fenrir).toBeDefined();
    expect(fenrir?.level).toBe(8);

    const carmilla = getDungeonBoss('CRIMSON_CARMILLA');
    expect(carmilla).toBeDefined();
    expect(carmilla?.level).toBe(12);
  });

  it('extrai partes anatômicas (Carving) com base no roll probabilístico do servidor', () => {
    const malachi = DUNGEON_BOSSES.INQUISITOR_MALACHI;
    
    // Roll determinístico de 0.05 (garante obtenção de todos os materiais com dropRate >= 5%)
    const luckyRoll = () => 0.05;
    const luckyDrops = extractCarvingLoot(malachi, luckyRoll);
    expect(luckyDrops.length).toBe(malachi.carvingTable.length);
    expect(luckyDrops[0]?.partName).toBe('Coração de Inquisidor de Prata');

    // Roll determinístico de 0.99 (garante que nenhum material com dropRate <= 99% caia)
    const unluckyRoll = () => 0.99;
    const unluckyDrops = extractCarvingLoot(malachi, unluckyRoll);
    expect(unluckyDrops.length).toBe(0);
  });

  it('forja equipamento com afixos procedurais (prefixo e sufixo) e atributos base', () => {
    const weaponRecipe = FORGE_RECIPES.FORGE_WEAPON_BLADE;
    const deterministicRoll = () => 0.5;

    const forgedBlade = executeAncestralForge(weaponRecipe, deterministicRoll);

    expect(forgedBlade.id).toMatch(/^[0-9a-f-]{36}$/); // UUID válido
    expect(forgedBlade.slot).toBe('WEAPON');
    expect(forgedBlade.rarity).toBe('RARE');
    expect(forgedBlade.baseStats.attack).toBeGreaterThan(0);
    expect(forgedBlade.affixes.length).toBe(2);

    const [prefix, suffix] = forgedBlade.affixes;
    expect(prefix?.type).toBe('PREFIX');
    expect(suffix?.type).toBe('SUFFIX');
    expect(forgedBlade.name).toContain(weaponRecipe.name);
  });

  it('forja armadura pesada com atributo base de defesa e afixos válidos', () => {
    const armorRecipe = FORGE_RECIPES.FORGE_ARMOR_PLATE;
    const forgedArmor = executeAncestralForge(armorRecipe, () => 0.7);

    expect(forgedArmor.slot).toBe('ARMOR');
    expect(forgedArmor.baseStats.defense).toBeGreaterThan(0);
    expect(forgedArmor.affixes.length).toBe(2);
  });
});
