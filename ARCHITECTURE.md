# 🌒 NOITE FAMINTA: SANGUE & PRATA
### Documento de Arquitetura Técnica & Game Design (GDD)
**Versão:** 1.0.0  
**Gênero:** MMORPG Idle & Estratégico Gótico para Navegador  
**Inspirações:** *BiteFight*, *MonstersGame*, *Tibia* (Economia de Tokens), *Monster Hunter* (Forja & Carving), *Vampiro: A Máscara* & *Lobisomem: O Apocalipse*.

---

## 1. Visão Geral & Filosofia de Design

*Noite Faminta: Sangue & Prata* é um RPG de navegador online, persistente e autoritativo. O jogador escolhe uma facção imortal (**Caimitas / Vampiros** ou **Garou / Lycans**) em um cenário gótico-punk moderno e trilha seu caminho entre a **Força Bruta** e a **Magia Oculta**.

Diferente dos jogos de navegador dos anos 2000, o jogo moderniza a experiência com:
1. **Interface reativa em 3 painéis** (Zero recarregamentos de página, estética glassmorphism gótica).
2. **Economia Player-Driven segura** (baseada no modelo de *Tibia Coins* com transações atômicas).
3. **Ciclo de caça e forja tático** (*Monster Hunter*), onde monstros têm partes anatômicas e itens têm afixos dinâmicos.
4. **Guerra de facções viva**, com disputa por bairros que geram dividendos reais do mercado e caçadores que aprendem os hábitos dos jogadores (Sistema Nêmesis).

---

## 2. Pilares de Gameplay & Mecânicas Inovadoras

### 2.1. O Ciclo de Caça & Forja Ancestral (Inspirado em Monster Hunter)
* **Desmembramento de Presas (Carving):**
  * Cada fera, criatura ou inquisidor possui uma tabela de anatomia específica.
  * Exemplo: Ao derrotar o *Lorde Inquisidor*, o servidor rola chances de extração para:
    * *Placa Peitoral Abençoada* (Armadura Base)
    * *Cinzas Consagradas* (Material Alquímico)
    * *Relíquia do Santo Sepulcro* (Material Raro para Encantamento)
* **Forja com Afixos Aleatórios:**
  * O jogador não compra armas prontas genéricas; ele forja no seu Refúgio usando materiais coletados.
  * Itens recebem prefixos e sufixos proceduralmente (ex: *Lâmina Carniceira da Lua Sangrenta*: Dano Base + Roubo de Vida + Crítico Adicional).
* **Bônus de Conjunto (Set Bonuses):**
  * Equipar 3 ou 5 peças da mesma criatura desbloqueia talentos passivos únicos.

### 2.2. A Guerra de Bairros & Dividendos de Mercado
A metrópole é dividida em distritos de influência:
* **Centro Financeiro:** O clã dominante recebe **5% de todas as taxas do Mercado Global** geradas na semana.
* **Docas & Zona Portuária:** Aumenta em 15% os drops de matérias-primas raras de contrabando.
* **Catedral & Subúrbio Histórico:** Aumenta a velocidade de regeneração de Vida e Gnose/Vitae.
* **Reserva Florestal dos Ermos:** Reduz a perda de energia em expedições e aumenta bônus para Lycans.
* A cada domingo à meia-noite, os pontos de infâmia acumulados nas guerras determinam os governantes de cada distrito para a semana seguinte.

### 2.3. Sistema de Combate Tático: Condições & Gambits
Em vez de combates resolvidos puramente por sorte cega:
* O jogador configura a matriz de IA do seu personagem no Refúgio:
  * `Regra 1:` SE [HP < 35%] ➜ EXECUTAR [Rito de Drenagem de Sangue / Cura Lupina].
  * `Regra 2:` SE [Inimigo tem Escudo] ➜ EXECUTAR [Golpe Esmagador de Guarda].
  * `Regra 3:` SE [Em Frenesi] ➜ PRIORIZAR [Ataque Feral Quádruplo].
* O servidor processa o combate turno a turno baseado na velocidade, agilidade e nas regras táticas, gerando um log de batalha cinematográfico e replayável.

### 2.4. A Inquisição Dinâmica: Sistema Nêmesis
* Caçar violentamente ou falhar em manter a discrição acumula **Alerta da Máscara / Véu**.
* Ao atingir 100%, o jogo cria um **Nêmesis Procedural** (ex: *Comandante Silva, Caçador de Prata*).
* O Nêmesis pode emboscar o jogador em caçadas normais e ganha títulos e atributos extras cada vez que vencer o jogador. Derrotá-lo liberta tesouros sagrados e zera o alerta.

### 2.5. Taverna dos Renegados (Aluguel de Mercenários Offline)
* Jogadores podem alugar seus personagens na Taverna enquanto estão offline.
* Outros jogadores contratam esses mercenários para formar grupos de 2 a 3 membros para explorar masmorras de alto nível.
* O dono do mercenário recebe uma comissão em Gold diretamente no baú do refúgio, sem riscos de morte permanente ou perda de equipamentos.

---

## 3. Modelo Econômico: "Tokens da Noite" (Tibia Coins)

```
                     ┌───────────────────────────────┐
                     │   DINHEIRO REAL (R$ / USD)    │
                     └───────────────┬───────────────┘
                                     │ Compra Oficial
                                     ▼
                     ┌───────────────────────────────┐
                     │   TOKENS DA NOITE (PREMIUM)   │
                     └───────────────┬───────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────┐                           ┌───────────────────────┐
│ USO NO PRÓPRIO JOGO   │                           │ MERCADO ENTRE PLAYERS │
│ • Tempo VIP (Caçadas) │                           │ • Venda por Gold livre│
│ • Cosméticos e Baús   │                           │ • Liquidez garantida  │
│ • Renome de Personagem│                           │   pela oferta/demanda │
└───────────────────────┘                           └───────────────────────┘
```

### Prevenção a Fraudes e Duplicações:
1. **Transações Atômicas (ACID):** Toda troca de itens ou tokens utiliza transações SQL com `SELECT ... FOR UPDATE` no PostgreSQL.
2. **Item UUID Único:** Todo equipamento forjado ou dropado recebe um UUID v4 no banco. Se dois itens idênticos com o mesmo UUID forem detectados em inventários diferentes, o sistema congela ambos imediatamente para auditoria.
3. **Taxa de Queima (Gold Sink):** O mercado consome uma taxa fixa de 5% de Gold por transação, retirando ouro de circulação para combater a inflação.

---

## 4. Arquitetura de Software

```
noite-faminta/
├── packages/
│   ├── shared/                # Lógica compartilhada entre Client e Server
│   │   ├── types/             # Definições de Personagens, Atributos, Itens, Ordens
│   │   ├── constants/         # Tabelas de XP, Custos de Refúgio, Fases da Lua
│   │   └── formulas/          # Fórmulas de combate, dano, esquiva e mitigação
│   │
│   ├── server/                # Backend Autoritativo (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── api/           # Rotas REST e WebSockets (Fastify)
│   │   │   ├── combat/        # Motor de combate determinístico baseado em Gambits
│   │   │   ├── hunting/       # Cálculo de caçadas humanas e masmorras
│   │   │   ├── market/        # Livro de ordens com locks transacionais
│   │   │   ├── nemesis/       # Gerador e gestor de caçadores da Inquisição
│   │   │   └── db/            # Conexão PostgreSQL & Migrations (Prisma / Kysely)
│   │
│   └── client/                # Frontend Reativo (Vite + TypeScript + CSS)
│       ├── src/
│       │   ├── components/    # 3 Painéis (Refúgio, Árvore Híbrida, Metrópole)
│       │   ├── state/         # Store reativo de personagem e inventário
│       │   ├── styles/        # Design system gótico-punk (tokens, glassmorphism)
│       │   └── socket/        # Cliente de eventos em tempo real
│
└── infra/                     # Infraestrutura como Código (IaC)
    ├── terraform/
    │   ├── modules/           # Módulos reutilizáveis (vpc, rds, redis, container_service, security)
    │   └── environments/      # Ambientes (dev, staging, prod)
    └── docker/                # Dockerfiles multi-stage e docker-compose.yml
```
### 4.1. Regras Invioláveis de Fronteira e Acoplamento (Contratos do Monorepo)
1. **`packages/shared` é 100% Puro e Isomórfico:**
   - Contém apenas tipos TypeScript, constantes estáticas e funções matemáticas puras (`formulas/`).
   - **PROIBIDO:** Importar qualquer módulo de `server`, `client`, drivers de banco (`pg`, `prisma`, `kysely`), `redis`, APIs de Node.js (`fs`, `crypto`, `process`) ou APIs de navegador (`window`, `document`).
   - **PROIBIDO:** Usar `Math.random()` em `shared/formulas/` para decisões críticas de loot/combate sem seed controlada pelo servidor.
2. **`packages/client` é Zero-Trust (Apenas Apresentação e Intenção):**
   - Só pode importar código de `packages/shared` e bibliotecas de UI/Socket.
   - **PROIBIDO:** Importar qualquer arquivo de `packages/server`.
   - **PROIBIDO:** Calcular resultado real de combate, drops de Carving, taxas de mercado ou saldo de Gold/Tokens no cliente. O cliente apenas envia a intenção via API/WebSocket e renderiza o estado devolvido pelo servidor.
3. **`packages/server` é Autoritativo e Transacional:**
   - Módulos de domínio (`combat/`, `hunting/`, `market/`, `nemesis/`) não devem acessar objetos `FastifyRequest` ou `FastifyReply` diretamente; a camada `api/` valida o payload com **Zod** e chama os serviços de domínio passando DTOs tipados.
   - Qualquer alteração nas colunas `gold`, `tokens_balance` ou posse em `items` **DEVE** ocorrer dentro de uma transação SQL com lock (`FOR UPDATE`) e inserir simultaneamente um registo correspondente em `financial_audit_ledger`.
4. **Limites de Coesão de Código:**
   - Nenhum arquivo `.ts` ou `.tsx` deve ultrapassar **300 linhas**.
   - Nenhuma função ou método deve ultrapassar **60 linhas**.
   - Uso de `any` ou `@ts-ignore` é estritamente proibido.
---

## 5. Esquema Essencial do Banco de Dados (PostgreSQL)

```sql
-- Contas de Jogadores
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tokens_balance INT DEFAULT 0 CHECK (tokens_balance >= 0),
    is_vip BOOLEAN DEFAULT FALSE,
    vip_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personagens
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(32) UNIQUE NOT NULL,
    faction VARCHAR(16) NOT NULL CHECK (faction IN ('VAMPIRE', 'LYCAN')),
    level INT DEFAULT 1,
    experience BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 100 CHECK (gold >= 0),
    stamina INT DEFAULT 100,
    max_stamina INT DEFAULT 100,
    health INT DEFAULT 500,
    max_health INT DEFAULT 500,
    
    -- Atributos Principais
    strength INT DEFAULT 10,
    agility INT DEFAULT 10,
    vitality INT DEFAULT 10,
    occultism INT DEFAULT 10,
    
    -- Estado de Inquisição
    masquerade_alert INT DEFAULT 0 CHECK (masquerade_alert BETWEEN 0 AND 100),
    
    -- Refúgio
    hideout_level INT DEFAULT 1,
    vault_gold_limit BIGINT DEFAULT 1000,
    
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventário e Itens Únicos
CREATE TABLE items (
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

-- Mercado Global (Livro de Ordens)
CREATE TABLE market_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES characters(id),
    item_id UUID REFERENCES items(id),
    order_type VARCHAR(16) NOT NULL CHECK (order_type IN ('ITEM_SALE', 'TOKEN_BUY', 'TOKEN_SELL')),
    price_gold BIGINT,
    price_tokens INT,
    status VARCHAR(16) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Auditoria Financeira Imutável (Ledger de Transações - DevSecOps)
CREATE TABLE financial_audit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    character_id UUID REFERENCES characters(id),
    operation_type VARCHAR(32) NOT NULL, -- 'MARKET_BUY', 'MARKET_SELL', 'HUNT_DROP', 'PVP_LOOT', 'ADMIN_ADJUST'
    currency_type VARCHAR(16) NOT NULL CHECK (currency_type IN ('GOLD', 'TOKEN', 'ITEM')),
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    related_entity_id UUID, -- ID da ordem de mercado, item ou personagem rival
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_audit_character ON financial_audit_ledger(character_id, created_at DESC);
```

---

## 6. Estratégia & Fundações de DevSecOps

Para um jogo com economia persistente, mercado aberto e transações com valor real, a segurança não pode ser um adendo posterior — ela precisa ser **fundacional (Security by Design & Shift-Left)**.

```
       ┌────────────────────────────────────────────────────────┐
       │                   DEVSECOPS PIPELINE                   │
       └───────────────────────────┬────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    DEV / CODE    │     │   BUILD / TEST   │     │   DEPLOY / RUN   │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│• Validação Zod   │     │• CI Automático   │     │• Containers Root-│
│• Pre-commit hooks│     │• SAST (Semgrep)  │     │  less (Alpine)   │
│• Gitleaks        │     │• SCA (npm audit) │     │• Rate Limiting   │
│• TypeScript Strict     │• Testes ACID DB  │     │• Ledger Auditável│
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### 6.1. Segurança no Código (Shift-Left & Secure by Design)
* **Validação de Entrada Inviolável:** Toda requisição REST ou mensagem WebSocket é estritamente validada via esquemas tipados com **Zod**. Payloads com campos inesperados são rejeitados imediatamente.
* **Cliente Zero-Trust:** O cliente web é considerado 100% comprometido por padrão. Nenhum cálculo de dano, ganho de Gold, tempo de caça ou integridade de item é decidido no navegador.
* **Pre-commit Hooks (Husky + Lint-Staged):**
  * Bloqueio automático de commits que contenham segredos ou credenciais expostas via **Gitleaks**.
  * Formatação e verificação de tipagem rígida com ESLint + TypeScript `strict: true`.

### 6.2. Autenticação, Autorização & Proteção de API
* **Autenticação Stateless Segura:** Tokens JWT de vida curta (15 minutos) com Refresh Tokens rotativos persistidos e revogáveis.
* **Proteção contra Força Bruta & DDoS:**
  * Rate-limiting por IP e por conta com algoritmo *Token Bucket* (Fastify Rate Limit + Redis).
  * Proteção contra Cross-Site Scripting (XSS), Headers de segurança estritos via **Helmet** (Content Security Policy restritivo).
  * Cookies `HttpOnly`, `Secure` e `SameSite=Strict`.

### 6.3. Pipeline de Integração e Entrega Contínua (CI/CD Seguro)
Em cada Pull Request / Push, o pipeline executa portais de segurança automatizados:
1. **Linting & Typecheck:** Verificação de tipos estritos do TypeScript.
2. **SAST (Static Application Security Testing):** Análise estática de vulnerabilidades no código com **Semgrep**.
3. **SCA (Software Composition Analysis):** Escaneamento de vulnerabilidades em dependências (`npm audit` / Snyk) com bloqueio de builds para vulnerabilidades de severidade Alta ou Crítica.
4. **Secret Scanning:** Verificação contínua contra vazamento de chaves de API, senhas ou certificados.
5. **Testes Automatizados de Transação (ACID Testing):** Testes de carga simulando compras concorrentes simultâneas no mercado para assegurar que nenhuma duplicação de itens aconteça.

### 6.4. Infraestrutura como Código (IaC com Terraform) & Containers Blindados
* **Terraform Modular & Versionado (`infra/terraform/`):**
  * Toda a infraestrutura em nuvem (VPC, Subnets privadas, Banco PostgreSQL gerenciado, Redis de cache/rate-limit, Clusters de Containers, WAF e Firewalls) é provisionada e rastreada via **Terraform**.
  * Ambientes segregados (`dev`, `staging`, `prod`) com estados remotos criptografados e bloqueio de estado (*state locking*).
  * **IaC Security Scanning:** O pipeline de CI executa **tfsec** e **Checkov** em todo código Terraform antes de qualquer `terraform apply`, garantindo conformidade com padrões CIS e bloqueando recursos com portas abertas desnecessárias, falta de criptografia em repouso ou políticas IAM permissivas demais.
* **Containers Não-Root (Rootless):** Dockerfiles multi-stage compilando o código em ambiente isolado e rodando em imagem final minimalista (*Alpine Linux*) com usuário desprivilegiado (`USER node`).
* **Gerenciamento Seguro de Segredos:** Nenhuma credencial em texto claro no repositório. Uso de variáveis de ambiente gerenciadas via `.env.example` e serviços de Vault / Secret Manager (provisionados via Terraform) em produção.
* **Isolamento de Rede:** O banco de dados PostgreSQL e o Redis residem em sub-redes privadas sem IP público, comunicando-se exclusivamente com a API do servidor através de Security Groups estritos.


### 6.5. Auditoria Financeira & Prevenção de Fraudes
* **Ledger Imutável (Append-Only):** A tabela `financial_audit_ledger` grava de forma definitiva toda movimentação de Gold, Tokens ou Itens de valor.
* **Rotina de Reconciliação:** Cronjob do servidor que audita a soma de todos os tokens e gold em circulação contra o histórico do ledger para detectar anomalias ou manipulações em tempo real.
* **Detecção de Bots & Autoclickers:** O servidor analisa a distribuição de intervalos entre ações de caça; comportamentos não-humanos com periodicidade perfeita são sinalizados para captcha ou restrição temporária.

### 6.6. Observabilidade & Resposta a Incidentes
* **Logs Estruturados:** Logs em formato JSON via **Pino**, com `correlationId` único por requisição e mascaramento automático de PII (senhas, e-mails).
* **Métricas de Saúde:** Endpoints `/health` e `/metrics` (formato Prometheus) com monitoramento de latência de banco de dados e fila de ordens de mercado.

---

## 7. Roadmap de Execução

* **Fase 1 (Fundação DevSecOps & MVP Jogável):**
  - Setup do Monorepo com TypeScript Strict, ESLint Security, Husky e Gitleaks.
  - Docker multi-stage configurado para execução local segura.
  - Interface gótica em 3 painéis com seleção de facção (Vampiro vs Lycan).
  - Validação de regras e Loop de Caçada Humana com cálculos no backend.
  - Árvore híbrida e distribuição de atributos autoritativa.
* **Fase 2 (Sistemas de Combate, Forja & Testes de Carga):**
  - Motor de combate em turnos com Gambits/Táticas.
  - Masmorra com chefes, extração de partes (Carving) e Forja com afixos.
  - Testes unitários e de integração com simulação de ataques de corrida (race conditions).
* **Fase 3 (Economia Segura, PostgreSQL & Mercado Global):**
  - Implementação do banco PostgreSQL com transações atômicas e Ledger de Auditoria.
  - Mercado Global de itens e Tokens da Noite (Tibia Coins) com pessimistic locking.
  - Arena PvP, Sistema Nêmesis da Inquisição e pipeline CI/CD completo com SAST/SCA.




---

## 8. Registro de Decisões Arquiteturais (ADRs)

Todas as decisões técnicas de fundação e evolução foram consolidadas de forma rastreável:

| ADR | Título da Decisão | Status | Documentação Completa |
|---|---|---|---|
| **ADR-001** | Arquitetura Monorepo Autoritativa & DevSecOps | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-001) |
| **ADR-002** | Transações Atômicas PostgreSQL & Ledger de Auditoria | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-002) |
| **ADR-003** | Motor de Combate Tático com Matriz de Gambits | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-003) |
| **ADR-004** | Masmorras, Carving e Forja Ancestral com Afixos | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-004) |
| **ADR-005** | Blindagem contra Race Conditions & ACID Concurrency | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-005) |
| **ADR-006** | Mercado Global & Livro de Ordens P2P (Tibia Coins) | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-006) |
| **ADR-007** | Inquisição Dinâmica e Sistema Nêmesis Procedural | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-007) |
| **ADR-008** | Visão de Personagem, Paperdoll RPG e Imersão Visual | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-008) |
| **ADR-009** | Guerra de Bairros & Dividendos Semanais da Metrópole | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-009) |
| **ADR-010** | Taverna dos Renegados (Mercenários Offline 90/10) | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-010) |
| **ADR-011** | Identidade Visual Dark Fantasy (Game HUD & Paperdoll) | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-011) |
| **ADR-012** | Progressão Visual e Mecânica do Refúgio (5 Estágios) | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-012) |
| **ADR-013** | Câmaras do Santuário, Oráculo de Obras & Infraestrutura Prod | Aprovado | [Ver Detalhes](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md#adr-013) |

> Para consultar as decisões técnicas completas com código e histórico, acesse o compêndio em [docs/ADRS.md](file:///c:/Users/hados/.gemini/antigravity-ide/scratch/noite-faminta/docs/ADRS.md).
