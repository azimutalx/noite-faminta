import { z } from 'zod';

// Validação de Cadastro e Login (DevSecOps - Sem senhas fracas)
export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e sublinhados são permitidos'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
});

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Validação de Criação de Personagem
export const CreateCharacterSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome do personagem deve ter pelo menos 3 caracteres')
    .max(24, 'Nome do personagem deve ter no máximo 24 caracteres')
    .regex(/^[a-zA-Z0-9_ ]+$/, 'Caracteres especiais inválidos'),
  faction: z.enum(['VAMPIRE', 'LYCAN']),
  specialization: z.enum(['BRUTE_FORCE', 'OCCULT_MAGIC', 'HYBRID'])
});

// Validação de Caçada Humana (Manhunt)
export const StartHuntSchema = z.object({
  targetType: z.enum(['STREET_MORTAL', 'NOCTURNAL_PATROL', 'INQUISITION_OUTPOST', 'ANCIENT_CRYPT']),
  staminaCost: z.number().int().positive().max(50)
});

// Validação de Treino de Atributos no Refúgio
export const TrainStatSchema = z.object({
  stat: z.enum(['strength', 'agility', 'vitality', 'occultism']),
  points: z.number().int().positive().max(10)
});

// Validação de Ordem no Mercado Global (Anti-Fraude)
export const CreateMarketOrderSchema = z.object({
  orderType: z.enum(['ITEM_SALE', 'TOKEN_BUY', 'TOKEN_SELL']),
  itemId: z.string().uuid().optional(),
  priceGold: z.number().int().positive().optional(),
  priceTokens: z.number().int().positive().optional(),
  tokenAmount: z.number().int().positive().max(10000).optional()
});

// Validação de Táticas e Gambits de Combate
export const GambitRuleSchema = z.object({
  condition: z.enum([
    'HP_BELOW_30',
    'ENEMY_IS_LYCAN',
    'ENEMY_IS_VAMPIRE',
    'ENEMY_EVADING',
    'IN_FRENZY',
    'ALWAYS'
  ]),
  action: z.enum([
    'BLOOD_DRAIN_RITE',
    'LUPINE_HEAL',
    'SHIELD_BREAKER_STRIKE',
    'SHADOW_EVASION',
    'FERAL_RAMPAGE',
    'BASIC_ATTACK'
  ]),
  priority: z.number().int().min(1).max(5)
});

// Validação de Incursão em Masmorra de Chefes
export const DungeonRaidSchema = z.object({
  bossId: z.enum(['INQUISITOR_MALACHI', 'ANCIENT_FENRIR', 'CRIMSON_CARMILLA']),
  staminaCost: z.number().int().positive().max(50).default(20)
});

// Validação de Forja Ancestral de Equipamentos
export const ForgeItemSchema = z.object({
  recipeId: z.enum(['FORGE_WEAPON_BLADE', 'FORGE_ARMOR_PLATE', 'FORGE_AMULET_RELIC']),
  targetSlot: z.enum(['WEAPON', 'ARMOR', 'AMULET']),
  materialItemIds: z.array(z.string().uuid()).min(1).max(5)
});

// Validação de Execução e Cancelamento no Mercado Global
export const BuyMarketOrderSchema = z.object({
  orderId: z.string().uuid()
});

export const CancelMarketOrderSchema = z.object({
  orderId: z.string().uuid()
});

// Validação de Disputa de Distritos na Guerra de Bairros
export const ContestDistrictSchema = z.object({
  districtId: z.enum(['FINANCIAL_CENTER', 'PORT_DOCKS', 'HISTORIC_CATHEDRAL', 'WILD_RESERVE']),
  goldInvestment: z.number().int().nonnegative().max(10000).default(0),
  staminaCost: z.number().int().positive().max(50).default(15)
});

// Validação de Reivindicação de Dividendos de Mercado
export const ClaimDividendsSchema = z.object({
  districtId: z.enum(['FINANCIAL_CENTER'])
});

// Validação de Aluguel de Mercenários na Taverna dos Renegados
export const RentMercenarySchema = z.object({
  mercenaryId: z.string().uuid()
});

export const RegisterMercenarySchema = z.object({
  rentalPriceGold: z.number().int().min(50).max(5000).default(150)
});

