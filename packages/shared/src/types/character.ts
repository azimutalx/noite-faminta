export type Faction = 'VAMPIRE' | 'LYCAN';

export type Specialization = 'BRUTE_FORCE' | 'OCCULT_MAGIC' | 'HYBRID';

export interface CharacterStats {
  strength: number;    // Dano físico de garras/armas e penetração de armadura
  agility: number;     // Esquiva, taxa de acerto crítico e velocidade de ação
  vitality: number;    // HP máximo e resistência a dano
  occultism: number;   // Dano de ritos/taumaturgia, penetração mágica e regeneração de energia
}

export interface CharacterProfile {
  id: string;
  name: string;
  faction: Faction;
  specialization: Specialization;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
  tokens: number;      // Tokens da Noite (Tibia Coins)
  stamina: number;
  maxStamina: number;
  health: number;
  maxHealth: number;
  stats: CharacterStats;
  evolutionPoints: number; // Pontos para a árvore híbrida
  masqueradeAlert: number; // 0 a 100% (Inquisição)
  hideoutLevel: number;
  vaultGold: number;
  vaultGoldLimit: number;
  hideoutRooms?: Record<string, number>;
}

export type TagmarPhysicalCondition =
  | 'RESTED'     // Revigorado (>= 70% stamina)
  | 'TIRED'      // Cansado (30% - 69% stamina)
  | 'FATIGUED'   // Fadigado (1% - 29% stamina)
  | 'EXHAUSTED'  // Exausto / Esgotado (0 stamina)
  | 'TORPOR';    // Torpor / Morte aparente (0 HP)

export type TagmarResolutionGrade =
  | 'CRITICAL_FAILURE'  // Falha Crítica (Verde no Tagmar)
  | 'FAILURE'           // Falha Normal (Branco)
  | 'NORMAL_SUCCESS'    // Sucesso Normal (Amarelo)
  | 'GOOD_SUCCESS'      // Sucesso Bom (Laranja)
  | 'DECISIVE_SUCCESS'; // Sucesso Decisivo / Crítico (Vermelho)

