# 🌒 Noite Faminta: Sangue & Prata

> **MMORPG Idle & Estratégico Gótico para Navegador com Economia Player-Driven Persistente, Combate Autoritativo por Gambits e Infraestrutura DevSecOps.**

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%205.3-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black.svg)](https://fastify.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20ACID-336791.svg)](https://www.postgresql.org/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform%20AWS-7B42BC.svg)](https://www.terraform.io/)
[![DevSecOps](https://img.shields.io/badge/DevSecOps-Zero--Trust-success.svg)](#segurança--devsecops)

---

## 🏛️ Visão Geral

*Noite Faminta: Sangue & Prata* é um RPG imersivo dark fantasy para navegadores ambientado em uma metrópole gótica dividida entre duas facções ancestrais:
- **Caimitas (Vampiros):** Mestres da manipulação sanguínea, ritos ocultos e aristocracia predadora.
- **Garou (Lycans):** Guerreiros de fúria primal, regeneração corporal e conexão com os espíritos dos ermos.

### Principais Pilares Mecânicos:
- **Refúgio Gótico & Obras Interativas:** Câmaras em alvenaria evolutiva (Trono, Cofre, Forja Ancestral, Círculo Ritual, Ameias e Mausoléu) com controle de tochas e Oráculo de Arquitetura.
- **Economia Player-Driven ("Tokens da Noite"):** Modelo inspirado em *Tibia Coins* com liquidação atômica e livro de ordens de mercado.
- **Matriz Tática de Combate (Gambits):** Lógica condicional de batalha em turnos determinística processada no servidor.
- **Ciclo de Caça, Carving & Forja Ancestral:** Masmorras de chefes com desmembramento anatômico e forja com afixos procedurais.
- **Guerra de Bairros (District Wars):** Disputa territorial por distritos que geram dividendos semanais reais da taxa de mercado.
- **Taverna dos Renegados:** Aluguel de mercenários offline com comissão de 90% direto no cofre do jogador.
- **Sistema Nêmesis da Inquisição:** Caçadores procedurais dinâmicos que caçam jogadores conforme o Alerta da Máscara se eleva.

---

## 🛡️ Segurança & DevSecOps (Shift-Left)

- **Cliente Zero-Trust:** O frontend é puramente declarativo; 100% das regras vitais, combates, drops e finanças são autoritativos no backend.
- **Persistência ACID com Pessimistic Locking:** Toda transação financeira ou disputa de inventário utiliza `SELECT ... FOR UPDATE` no PostgreSQL, eliminando *double spending* e *race conditions*.
- **Financial Audit Ledger Imutável:** Histórico contábil append-only com encadeamento causal (`balance_before` ➜ `balance_after`).
- **Validação com Esquemas Zod:** Payloads de entrada estritamente tipados e validados nas bordas da API.
- **Containers Blindados:** Dockerfile multi-stage executando sob usuário desprivilegiado (`node`).
- **Infraestrutura como Código:** Módulos Terraform segregados (`vpc`, `security`, `database`) para ambientes `dev` e `prod` com criptografia em repouso e isolamento de subnets.

---

## 📂 Estrutura do Monorepo

```text
noite-faminta/
├── packages/
│   ├── shared/          # Modelos, tipos e fórmulas puras (Zero side-effects)
│   ├── server/          # API REST Fastify, motor de combate, transações ACID e DB
│   └── client/          # Frontend reativo modular (Vite, HUD tático e painéis góticos)
├── infra/
│   ├── docker/          # Dockerfiles multi-stage de produção
│   └── terraform/       # Módulos e ambientes (dev / prod)
└── docker-compose.yml   # PostgreSQL 16 e Redis para desenvolvimento local
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** e **Docker Compose**

### 2. Inicialização dos Serviços Locais (PostgreSQL & Redis)
Suba os contêineres de banco de dados e cache em segundo plano:
```bash
docker-compose up -d
```

### 3. Instalação de Dependências
Na raiz do monorepo, execute:
```bash
npm install
```

### 4. Execução das Migrações do Banco de Dados
Crie as tabelas e índices necessários no PostgreSQL:
```bash
npm run migrate --workspace=@noite-faminta/server
```

### 5. Execução em Modo de Desenvolvimento
Inicie o cliente e o servidor simultaneamente:
```bash
# Iniciar o cliente Vite (Porta 5173)
npm run dev --workspace=@noite-faminta/client

# Em outro terminal, iniciar o servidor Fastify (Porta 3000)
npm run dev --workspace=@noite-faminta/server
```

Acesse o jogo no navegador: `http://localhost:5173`

---

## 🧪 Bateria de Testes Automatizados

O projeto conta com **100% de cobertura nos fluxos críticos de negócio** (43 testes unitários e de integração transacional):

```bash
# Executar todos os testes via Vitest
npm test

# Executar checagem estrita de tipos TypeScript
npm run typecheck
```

### Suítes de Teste Incluídas:
1. `concurrency.test.ts` — Simulação de rajadas concorrentes de até 10 requisições disputando saldo/inventário.
2. `market.test.ts` — Liquidação de ordens, taxas de Gold Sink e prevenção de dupla compra.
3. `combat.test.ts` — Motor de turnos, execução de Gambits e integridade de dano/mitigação.
4. `forge.test.ts` — Carving anatômico, geração procedural de afixos com CSPRNG.
5. `hideout.test.ts` — Evolução de câmaras, cálculo de custos e bônus progressivos.
6. `districts.test.ts` — Disputas territoriais, acúmulo de infâmia e dividendos semanais.
7. `mercenaries.test.ts` — Aluguel offline, split de 90/10 e bloqueio de contratação concorrente.
8. `nemesis.test.ts` — Geração e purga de inquisidores procedurais.
9. `formulas.test.ts` — Validação matemática isomórfica em `@noite-faminta/shared`.

---

## ☁️ Infraestrutura em Nuvem (Terraform)

Para planejar ou provisionar a infraestrutura em nuvem:

```bash
cd infra/terraform/environments/prod
terraform init
terraform plan
```

Os módulos garantem:
- **RDS PostgreSQL 15.4** com `storage_encrypted = true`, `multi_az = true` e retenção de 30 dias de backup.
- **Subnets Isoladas** sem rota pública para a Internet para a camada de persistência.
- **AWS Secrets Manager** para injeção de senhas criptográficas em tempo de execução.

---

## 📜 Licença

Propriedade do Projeto *Noite Faminta: Sangue & Prata*. Todos os direitos reservados.
