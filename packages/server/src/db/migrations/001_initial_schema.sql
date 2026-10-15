-- Migração Inicial 001: Esquema Relacional Autoritativo (PostgreSQL)
-- Conformidade: ARCHITECTURE.md Seção 5 e DevSecOps ACID

BEGIN;

-- 1. Contas de Usuários (Autenticação e Saldo Global de Tokens)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tokens_balance INT DEFAULT 0 CHECK (tokens_balance >= 0),
    is_vip BOOLEAN DEFAULT FALSE,
    vip_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Personagens Persistentes
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(32) UNIQUE NOT NULL,
    faction VARCHAR(16) NOT NULL CHECK (faction IN ('VAMPIRE', 'LYCAN')),
    specialization VARCHAR(16) NOT NULL DEFAULT 'HYBRID' CHECK (specialization IN ('BRUTE_FORCE', 'OCCULT_MAGIC', 'HYBRID')),
    level INT DEFAULT 1 CHECK (level >= 1),
    experience BIGINT DEFAULT 0 CHECK (experience >= 0),
    gold BIGINT DEFAULT 100 CHECK (gold >= 0),
    stamina INT DEFAULT 100 CHECK (stamina >= 0),
    max_stamina INT DEFAULT 100,
    health INT DEFAULT 500 CHECK (health >= 0),
    max_health INT DEFAULT 500,
    
    -- Atributos Principais (Árvore Híbrida)
    strength INT DEFAULT 10 CHECK (strength >= 1),
    agility INT DEFAULT 10 CHECK (agility >= 1),
    vitality INT DEFAULT 10 CHECK (vitality >= 1),
    occultism INT DEFAULT 10 CHECK (occultism >= 1),
    evolution_points INT DEFAULT 0 CHECK (evolution_points >= 0),
    
    -- Inquisição Dinâmica (Sistema Nêmesis)
    masquerade_alert INT DEFAULT 0 CHECK (masquerade_alert BETWEEN 0 AND 100),
    
    -- Refúgio
    hideout_level INT DEFAULT 1 CHECK (hideout_level >= 1),
    vault_gold_limit BIGINT DEFAULT 5000 CHECK (vault_gold_limit >= 0),
    vault_gold BIGINT DEFAULT 0 CHECK (vault_gold >= 0),
    
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Itens e Equipamentos Únicos
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    template_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    rarity VARCHAR(16) NOT NULL CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'ANCESTRAL')),
    slot VARCHAR(16) NOT NULL CHECK (slot IN ('WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'AMULET', 'MATERIAL')),
    attributes JSONB DEFAULT '{}'::JSONB,
    is_equipped BOOLEAN DEFAULT FALSE,
    is_tradable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Mercado Global (Livro de Ordens P2P)
CREATE TABLE IF NOT EXISTS market_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    order_type VARCHAR(16) NOT NULL CHECK (order_type IN ('ITEM_SALE', 'TOKEN_BUY', 'TOKEN_SELL')),
    price_gold BIGINT CHECK (price_gold IS NULL OR price_gold > 0),
    price_tokens INT CHECK (price_tokens IS NULL OR price_tokens > 0),
    token_amount INT CHECK (token_amount IS NULL OR token_amount > 0),
    status VARCHAR(16) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ledger Imutável de Auditoria Financeira (DevSecOps)
CREATE TABLE IF NOT EXISTS financial_audit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    operation_type VARCHAR(32) NOT NULL,
    currency_type VARCHAR(16) NOT NULL CHECK (currency_type IN ('GOLD', 'TOKEN', 'ITEM')),
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    related_entity_id UUID,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices Estratégicos de Performance e Segurança
CREATE INDEX IF NOT EXISTS idx_characters_account ON characters(account_id);
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_market_orders_status ON market_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_character ON financial_audit_ledger(character_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_account ON financial_audit_ledger(account_id, created_at DESC);

COMMIT;
