# Manual do Ciclo de Trabalho de 8 Fases do Frontend Forge

Este documento estabelece o protocolo de execução obrigatório para qualquer funcionalidade ou tela desenvolvida pelo agente **Frontend Forge**.

---

## Fase 1 — Descoberta (Discovery)
**Objetivo:** Compreender profundamente a base de código e as restrições antes de escrever qualquer linha de código.
- [ ] Inspecione o `package.json` para identificar framework (React, Vue, Svelte, Vanilla), bundler (Vite, Next, Webpack) e dependências.
- [ ] Identifique o sistema de estilos: Tailwind, Vanilla CSS com Custom Properties, CSS Modules, Styled Components, etc.
- [ ] Descubra convenções existentes de componentes (`components/ui`, `common`, `atoms`).
- [ ] Verifique estratégias de roteamento e gerenciamento de estado (Zustand, Redux, Context, Store simples).
- [ ] Localize linters, tsconfig e suítes de testes (`vitest`, `jest`, `playwright`).
- **Entregável:** Diagnóstico do ecossistema e lista de convenções que devem ser respeitadas.

---

## Fase 2 — Definição do Objetivo (Goal Definition)
**Objetivo:** Transformar a solicitação do usuário em requisitos claros e critérios de aceitação verificáveis.
- [ ] Quem é o usuário e qual problema a interface resolve?
- [ ] Qual é a ação primária e as ações secundárias da tela?
- [ ] Quais são os dados necessários e quais contratos de API são esperados?
- [ ] Se houver ambiguidade em regras de negócio ou finanças/autenticação, **questione o usuário**. Para detalhes secundários, adote suposições sólidas e registre-as.
- **Entregável:** Escopo fechado com critérios de sucesso bem delimitados.

---

## Fase 3 — Planejamento de Arquitetura (Planning)
**Objetivo:** Mapear a decomposição de arquivos e o fluxo de dados.
- [ ] Lista de novos componentes e identificação de componentes existentes a reutilizar.
- [ ] Definição de rotas, layouts e estrutura de pastas.
- [ ] Modelagem de tipos TypeScript (`types/` ou interfaces locais).
- [ ] Separação explícita entre camada de apresentação (View/Component) e dados/serviços (Hooks/API).
- **Entregável:** Plano de implementação em etapas curtas e ordenadas logicamente.

---

## Fase 4 — Direção Visual & Design System (Visual Direction)
**Objetivo:** Estabelecer a personalidade visual e os tokens sem cair em clichês de IA.
- [ ] Definir ou estender paleta de cores semântica (superfície, texto primário, texto secundário, acento, borda, perigo, sucesso).
- [ ] Validar contraste WCAG 2.2 AA (mínimo 4.5:1 para texto padrão).
- [ ] Definir hierarquia tipográfica: Sans-serif para leitura contínua e Monospace para números/métricas.
- [ ] Estabelecer escala de espaçamento (múltiplos de 4px / 8px) e bordas finas estruturadas.
- [ ] Chamar `sugerir_diretrizes_ui_customizadas` no MCP `DiretorFrontendUI` para alinhar ao arquétipo do produto.
- **Entregável:** Conjunto de tokens e direção visual coerente com a marca do produto.

---

## Fase 5 — Implementação Incremental (Implementation)
**Objetivo:** Construir código robusto, funcional e bem tipado.
- [ ] Implementar primeiro os contratos de dados e tipos TypeScript.
- [ ] Implementar os componentes de base/UI (`Button`, `Card`, `Badge`, `Input`) com estados nativos (`:hover`, `:focus-visible`, `:disabled`).
- [ ] Compor a tela ou funcionalidade nos componentes de domínio (`features/`).
- [ ] Integrar serviços ou isolar integração com dados simulados tipados (`mockData`).
- [ ] Garantir que todo botão ou controle possua manipulador funcional (zero interações falsas).
- [ ] Implementar obrigatoriamente os estados de carregamento (Skeleton) e lista vazia (Empty State).
- **Entregável:** Código completo, formatado e modularizado.

---

## Fase 6 — Verificação Técnica Automatizada (Technical QA)
**Objetivo:** Garantir solidez de engenharia sem regressões.
- [ ] Executar checagem de tipos: `npm run typecheck` ou `tsc --noEmit` (deve retornar **0 erros**).
- [ ] Executar linters configurados no projeto.
- [ ] Executar suítes de testes unitários ou de integração: `npm test` ou `npx vitest run`.
- [ ] Rodar auditoria MCP `auditar_identidade_frontend` e `verificar_consistencia_tokens`.
- [ ] Rodar compilação de produção: `npm run build` para certificar que o bundle é gerado perfeitamente.
- **Entregável:** Relatório técnico com 100% de verificações verdes ou causas de falha corrigidas.

---

## Fase 7 — Inspeção Visual & Responsiva (Visual QA)
**Objetivo:** Validar a renderização real no navegador e o comportamento responsivo.
- [ ] Se o dev server puder ser iniciado ou estiver rodando, acionar o MCP `InspetorVisualBrowser`:
  - `inspecionar_pagina_local(url)` para capturar snapshot e validar console.
  - `auditar_responsividade_breakpoints(url)` para testar em 375px, 768px e 1440px.
- [ ] Verificar ausência de overflow horizontal (`scroll horizontal indesejado`).
- [ ] Checar legibilidade do texto e espaçamento em telas menores.
- [ ] Validar navegação exclusiva por teclado (<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>).
- **Entregável:** Captura visual e relatório de responsividade aprovados.

---

## Fase 8 — Entrega & Documentação (Delivery)
**Objetivo:** Apresentar a entrega com transparência e clareza para o usuário.
- [ ] Resumo executivo do que foi construído.
- [ ] Lista de arquivos criados e modificados com links markdown `file:///`.
- [ ] Registro das principais decisões arquiteturais e escolhas visuais adotadas.
- [ ] Evidências de testes e verificações técnicas executadas.
- [ ] Limitações atuais conhecidas e sugestões de próximos passos.
- **Entregável:** Relatório final profissional e pronto para evolução.
