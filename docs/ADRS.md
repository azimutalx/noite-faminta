# 🏛️ Registro de Decisões Arquiteturais (ADRs) - Noite Faminta: Sangue & Prata

Este repositório documenta todas as decisões arquiteturais fundamentais tomadas ao longo da construção de *Noite Faminta: Sangue & Prata*.

---

### 📌 ADR-001: Arquitetura Monorepo Autoritativa & DevSecOps
- **Decisão:** Separação estrita em workspaces npm (`@noite-faminta/shared`, `@noite-faminta/server`, `@noite-faminta/client`). O cliente é Zero-Trust, e todas as regras de progressão e economia residem no servidor e na camada compartilhada de validação com Zod.

---

### 📌 ADR-002: Transações Atômicas PostgreSQL & Ledger de Auditoria
- **Decisão:** Uso de PostgreSQL com isolamento Read Committed / Serializable, `SELECT ... FOR UPDATE` (locks pessimistas) e tabela append-only `financial_audit_ledger` para auditoria financeira imutável de Gold e Tokens da Noite.

---

### 📌 ADR-003: Motor de Combate Tático com Matriz de Gambits
- **Decisão:** O combate por turnos é autoritativo e orquestrado por uma árvore de condições configuradas pelo jogador (estilo *Final Fantasy XII*), garantindo profundidade tática sem aleatoriedade cega desbalanceada.

---

### 📌 ADR-004: Masmorras, Carving e Forja Ancestral com Afixos Procedurais
- **Decisão:** 
  - `packages/shared`: Tipos `DungeonBoss`, `MonsterMaterial`, `ForgeRecipe`, `DungeonRaidResult`, `ForgeResult` e validação Zod.
  - `packages/server`: Catálogo de chefes (Malachi, Fenrir, Carmilla) com Gambits e Carving; motor de forja ancestral com CSPRNG seguro gerando prefixos e sufixos; rotas `/api/dungeons/raid` e `/api/crafting/forge` operando sob transações ACID (`FOR UPDATE`) com ledger de auditoria imutável.
  - `packages/client`: Painel Masmorras & Forja gótico-punk, integrado ao store reativo vanilla.

---

### 📌 ADR-005: Blindagem contra Race Conditions e Testes de Concorrência ACID
- **Decisão:**
  - Simulação determinística de rajadas concorrentes de até 10 requisições simultâneas em mesmo milissegundo no motor transacional.
  - Validação comprovada de bloqueio de Double Spending em ouro e bloqueio de Duplo Consumo de materiais únicos (UUID).
  - Encadeamento causal imutável verificado no Financial Audit Ledger (`balance_before[i] === balance_after[i-1]`).
  - Emprego estrito de CSPRNG seguro (`crypto.randomInt`) eliminando qualquer `Math.random` em ambiente de produção ou testes.

---

### 📌 ADR-006: Mercado Global & Livro de Ordens com Tokens da Noite
- **Decisão:**
  - `packages/shared`: Tipos `MarketOrder`, `MarketBuyResult`, `OrderType` e schemas Zod `BuyMarketOrderSchema` e `CancelMarketOrderSchema`.
  - `packages/server`: Módulo `orderBook.ts` com cálculo de taxas (5% queima de Gold Sink); rotas `/api/market/orders` com criação de ordens, compra atômica sob lock pessimista (`SELECT ... FOR UPDATE` no comprador, vendedor e ordem) e cancelamento seguro com restauração de custódia; persistência imutável em `financial_audit_ledger`.
  - `packages/server/tests/market.test.ts`: Testes unitários de settlement e simulação de concorrência com 2 compradores simultâneos disputando a mesma ordem.
  - `packages/client`: Seção de Mercado Global integrada ao `MetropolePanel` e cliente API reativo.

---

### 📌 ADR-007: Inquisição Dinâmica e Sistema Nêmesis Procedural
- **Decisão:**
  - `packages/shared`: Tipos `NemesisInquisitor`, `NemesisAmbushResult` e schemas Zod `ResolveAmbushSchema`.
  - `packages/server`: Módulo `nemesisGenerator.ts` gerando inquisidores com histórico de vitórias/derrotas, títulos evolutivos e espólio sagrado; rotas `/api/nemesis/ambush` e `/api/nemesis/status` sob transações atômicas com ledger imutável.
  - `packages/server/tests/nemesis.test.ts`: Testes unitários de acúmulo de Alerta da Máscara, geração procedural e resolução de emboscada.
  - `packages/client`: Seção temática da Inquisição integrada ao `MetropolePanel` com barra de alerta e emboscada interativa.

---

### 📌 ADR-008: Visão de Personagem, Paperdoll RPG e Imersão Visual Dinâmica
- **Decisão:**
  - `packages/client/public/assets`: Inclusão de imagens temáticas em alta definição de retrato do personagem (`vampire_avatar.jpg`) e panorama noturno da metrópole (`metropolis_night.jpg`).
  - `RefugioPanel.ts`: Adição do componente de herói do personagem com moldura gótica, retrato carmesim e grid paperdoll de 5 slots de equipamento com micro-interações táteis e iluminação suave ao passar o cursor.
  - `MetropolePanel.ts`: Banner cinematográfico com sobreposição em gradiente escuro e título ambientado sobre a chuva e névoa da cidade. Mapeamento de distritos mantendo menos de 300 linhas por arquivo.

---

### 📌 ADR-009: Guerra de Bairros (District Wars) e Dividendos Semanais da Metrópole
- **Decisão:**
  - `packages/shared`: Tipos `DistrictId`, `DistrictState`, `DistrictContestResult`, `DistrictDividendResult` e schemas Zod.
  - `packages/server`: Módulo `districtEngine.ts` com apuração de infâmia e dominância territorial para 4 distritos; integração com livro de ordens alimentando o cofre de dividendos com 5% de taxa; rotas sob lock pessimista e registro em `financial_audit_ledger`.
  - `packages/server/tests/districts.test.ts`: 6 testes unitários e de integração cobrindo disputas territoriais, dividendos e bônus de facção dominante.

---

### 📌 ADR-010: Taverna dos Renegados (Aluguel de Mercenários Offline)
- **Decisão:**
  - `packages/shared`: Tipos `MercenaryContract` e schemas Zod.
  - `packages/server`: Módulo `mercenaryGuild.ts` com liquidação de aluguel: comissão de 90% para o proprietário offline e taxa de 10% da Taverna (Gold Sink da economia); rotas sob transações ACID e registro imutável no ledger.
  - `packages/server/tests/mercenaries.test.ts`: 4 testes cobrindo listagem, split financeiro de comissão e prevenção de contratações concorrentes duplicadas.

---

### 📌 ADR-011: Identidade Visual Dark Fantasy (Game HUD, Paperdoll de Raridades e Altar de Linhagem)
- **Decisão:**
  - Interface de usuário elevada com Game HUD Blindado, display tátil de Gold e Tokens da Noite, altar de gemas místicas, bestiário com cartazes de recompensas e barras bicolores de influência territorial.

---

### 📌 ADR-012: Sistema de Progressão Visual e Mecânica do Refúgio
- **Decisão:**
  - Máquina de 5 estágios arquiteturais puros em `@noite-faminta/shared`: WASTELAND (Nível 1), CABIN (Níveis 2-3), CRYPT (Níveis 4-6), MANSION (Níveis 7-9) e CASTLE (Nível 10+).
  - Galeria de assets vetoriais SVG góticos de alta fidelidade em `/assets/`. Rota autoritativa `POST /hideout/upgrade` com transação ACID e lock pessimista.

---

### 📌 ADR-013: Câmaras do Santuário Gótico, Oráculo de Obras & Infraestrutura Modular de Produção
- **Decisão:**
  - Grelha de 6 Câmaras Góticas temáticas com alvenaria evolutiva e 6 ilustrações vetoriais SVG exclusivas.
  - Oráculo de Arquitetura (inspeção de obras em modal), controle de ambiência e tochas carmesins.
  - Decomposição modular do frontend em submódulos (`RefugioChambers.ts`, `RefugioChamberModal.ts`, `RefugioPanorama.ts`, etc.) abaixo do limite de 300 linhas.
  - Infraestrutura Terraform Modular de Produção (`modules/vpc`, `modules/security`, `modules/database`, `environments/prod`) com auditoria DevSecOps 100% aprovada.
