# Padrões de Arquitetura Frontend & Engenharia de Software (Frontend Forge)

Uma base de código frontend de classe mundial prioriza previsibilidade, baixo acoplamento e facilidade de manutenção por qualquer desenvolvedor da equipe.

---

## 🗂️ 1. Organização Estrutural de Referência

A estrutura abaixo serve como modelo conceitual modular. Adapte-a sempre à convenção pré-existente do projeto real sem impor diretórios desnecessários:

```text
src/
├── app/                  # Provedores globais, rotas e inicialização da aplicação
├── layouts/              # Cascas estruturais de tela (Sidebar, TopNav, Container)
├── components/
│   ├── ui/               # Componentes atômicos puros e reutilizáveis (Button, Input, Badge, Modal)
│   └── shared/           # Componentes compartilhados com lógica leve (Header, Footer, UserMenu)
├── features/             # Módulos organizados por domínio de negócio
│   ├── combat/           # Cada feature agrupa seus componentes específicos, hooks e tipos
│   │   ├── components/   # Ex: BattleArena.tsx, GambitSelector.tsx
│   │   ├── hooks/        # Ex: useCombatEngine.ts
│   │   ├── api/          # Ex: combatService.ts
│   │   └── types.ts      # Contratos de tipos exclusivos do domínio
│   └── marketplace/
├── hooks/                # Hooks utilitários globais (useMediaQuery, useDebounce, useKeyboard)
├── services/             # Clientes de API, instâncias HTTP e web sockets
├── styles/               # Tokens de CSS, reset, tema e fontes
└── types/                # Definições de tipos compartilhadas entre múltiplos domínios
```

---

## 🧱 2. Separação Estrita de Camadas

```
┌───────────────────────────────────────────────┐
│           APRESENTAÇÃO (UI / View)            │  Renderiza HTML semântico, estilos e
│    (ex: componentes em features/ ou ui/)      │  recebe dados via props/hooks.
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│        LÓGICA DE NEGÓCIO & ESTADO             │  Gerencia regras locais, validações,
│     (ex: custom hooks, stores, reducers)      │  estados de loading/error e caching.
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│          ACESSO A DADOS (Services / API)      │  Comunica com endpoints REST/GraphQL,
│      (ex: axios, fetch, supabase, websockets) │  trata erros HTTP e serializa tipos.
└───────────────────────────────────────────────┘
```

### Regras Inegociáveis:
1. **Nenhum `fetch` direto no corpo do componente visual:** Toda chamada de API deve ser encapsulada em uma função de serviço ou hook.
2. **Tipagem Forte e Completa:** O uso de `any` é terminantemente proibido. Se um contrato de API for incerto, utilize `unknown` combinado com validação por esquema (ex: `zod`) ou interfaces TypeScript rigorosas.
3. **Composição em Vez de Props Monolíticas:** Evite componentes com 40 propriedades booleanas (`isBig`, `hasShadow`, `showBadge`, `isRed`). Prefira composição com sub-componentes (`Card.Header`, `Card.Body`, `Card.Actions`).

---

## ⚡ 3. Otimização de Desempenho Inteligente

- **Renderizações Desnecessárias:** Não use `useMemo` ou `useCallback` de forma indiscriminada. Otimize a estrutura do estado local para que componentes que não dependem do dado não re-renderizem.
- **Divisão de Código (Code-Splitting / Lazy Loading):** Rotas pesadas e modais complexos devem ser carregados dinamicamente via `React.lazy()` / importações dinâmicas do ESModule.
- **Listas Densas (> 100 itens):** Em tabelas ou feeds extensos, adote paginação assíncrona ou virtualização de listas para manter 60 FPS contínuos no navegador.
