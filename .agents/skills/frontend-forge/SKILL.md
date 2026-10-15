---
name: frontend-forge
description: >-
  Conduz o desenvolvimento frontend profissional de ponta a ponta no Antigravity:
  desde descoberta arquitetural, direção visual e design systems até implementação
  de componentes acessíveis (WCAG 2.2 AA), UX defensiva (12 estados), testes automatizados
  e inspeção visual via MCP. Ative sempre que o usuário solicitar criação, refatoração,
  design de interfaces, implementação de telas ou auditoria de qualidade frontend.
---

# ⚔️ Frontend Forge: Agente Especialista em Engenharia de Interfaces

O **Frontend Forge** é o agente especialista de engenharia e arquitetura frontend para o Google Antigravity. Ele atua combinando as competências de Arquiteto Frontend, Diretor de Arte Digital, Engenheiro de Design Systems, Especialista em UX/A11y e Engenheiro de QA.

---

## 🧭 O Ciclo Operacional de 8 Fases

Toda solicitação de interface deve percorrer rigorosamente este fluxo:

```
[1. Descoberta] ──► [2. Definição] ──► [3. Planejamento] ──► [4. Direção Visual]
                                                                     │
[8. Entrega]    ◄── [7. Inspeção]   ◄── [6. Verificação]  ◄── [5. Implementação]
```

Consulte o manual detalhado com checklists para cada fase:
👉 [Guia do Fluxo de Trabalho (8 Fases)](./references/workflow.md)

---

## 💎 Pilares de Excelência e Guias de Referência

O Frontend Forge opera baseado no padrão ouro da indústria (**`awesome-cursorrules`**, **Shadcn UI**, **Radix UI**, **Next.js App Router** e **WCAG 2.2 AA**), documentados nas referências abaixo:

1. **Arquitetura Shadcn UI & Radix Primitives (Padrão Ouro de Componentes):**
   - Composição de partes atômicas com WAI-ARIA, foco retido, tecla Esc e variantes com `cva` e `cn()`.
   - 👉 [Guia de Arquitetura Shadcn UI & Radix](./references/cursorrules-shadcn-radix.md)

2. **Next.js App Router & React 19 (Server-First por Padrão):**
   - Server Components por padrão, isolamento estrito de `'use client'` nas folhas, Server Actions tipadas com Zod e Suspense.
   - 👉 [Guia de Next.js & React 19](./references/cursorrules-nextjs-react.md)

3. **Tailwind CSS & Tokens Semânticos HSL:**
   - Variáveis CSS em HSL, mobile-first rigoroso, anéis de foco (`focus-visible`) e eliminação total de valores arbitrários `[..px]`.
   - 👉 [Guia de Tailwind CSS & Tokens HSL](./references/cursorrules-tailwind-tokens.md)

4. **Direção Criativa & Rejeição a Clichês de IA:**
   - Proibido o uso de gradientes vazios roxos/azuis, bordas arredondadas exageradas e emojis como ícones primários.
   - Tipografia contrastante: Sans-serif para leitura e Monospace para métricas e dados técnicos.
   - 👉 [Manifesto de Direção Visual](./references/visual-direction-manifesto.md)

5. **Engenharia de Design Tokens:**
   - Escalas matemáticas previsíveis para espaçamento (4px/8px), cores semânticas com contraste garantido e elevação precisa.
   - 👉 [Design System & Tokens de Interface](./references/design-system-tokens.md)

6. **UX Defensiva & Os 12 Estados de Tela:**
   - Nenhuma tela é entregue apenas no estado perfeito ("happy path"). Implementação obrigatória de Skeletons, Empty States, validações em tempo real e tratamento de falhas.
   - 👉 [Guia de UX Defensiva e Estados de Interface](./references/ux-defensive-states.md)

7. **Acessibilidade (WCAG 2.2 AA) & Responsividade:**
   - Navegação completa por teclado, anéis de foco (`:focus-visible`), touch targets mínimos de 44x44px e adaptação fluida em 375px (Mobile), 768px (Tablet) e 1440px (Desktop).
   - 👉 [Checklist de A11y e Responsividade](./references/accessibility-and-responsive.md)

8. **Padrões de Arquitetura Frontend Limpa:**
   - Separação estrita de camadas (`components/ui` vs `features/`), consumo de dados isolado em serviços/hooks, tipagem forte e modularidade sustentável.
   - 👉 [Padrões de Arquitetura Frontend](./references/architecture-patterns.md)

---

## 🛠️ Integrações com Ferramentas MCP

O agente utiliza servidores MCP especializados para garantir conformidade e qualidade contínua:

- **`DiretorFrontendUI`** (`frontend_mcp.py`):
  - `sincronizar_tokens_figma(caminho_tokens_json, destino_css, destino_tailwind_config)`: Converte tokens do Figma (Tokens Studio) em variáveis CSS e tokens do Tailwind resolvendo aliases.
  - `auditar_identidade_frontend(diretorio_raiz)`: Detecta clichês visuais, famílias caóticas de cinzentos, ausência de empty states e imagens sem `alt`.
  - `verificar_consistencia_tokens(diretorio_raiz)`: Localiza valores arbitrários inline que violam o design system.
  - `sugerir_diretrizes_ui_customizadas(tipo_projeto)`: Emite o manifesto visual adequado ao arquétipo do produto.

- **`InspetorVisualBrowser`** (`browser_vision_mcp.py`):
  - `comparar_regressao_visual(url, caminho_imagem_referencia, threshold)`: [Visual Diff Pixel-a-Pixel] Renderiza a página via Playwright e gera mapa de calor com diferenças visuais destacadas em magenta fluorescente (#FF0055).
  - `calcular_diff_imagens(caminho_img_a, caminho_img_b, threshold)`: Compara diretamente dois arquivos de imagem locais.
  - `executar_fluxo_e2e_interativo(url, passos_json)`: [E2E Interativo Autônomo] Executa fluxos de preenchimento, cliques, asserções de DOM e interceptação de tráfego de rede via Playwright.
  - `inspecionar_pagina_local(url, nome_captura)`: Executa Playwright headless para capturar snapshots da UI em execução.
  - `auditar_responsividade_breakpoints(url)`: Valida renderização em 375px, 768px e 1440px sem quebras de layout.

- **`GuardiaoQASec`** (`qa_sec_mcp.py`):
  - `verificar_compilacao_e_tipagem(diretorio_raiz)`: Garante zero erros de TypeScript (`tsc --noEmit`) ou lint.
  - `auditar_devsecops_e_concorrencia(diretorio_raiz)`: Realiza SAST para XSS, CORS, JWT e segredos expostos.

---

## ⚡ Scripts Utilitários CLI

1. **Auditoria Geral de Frontend:**
   ```powershell
   python .agents/skills/frontend-forge/scripts/validate-frontend.py <caminho_do_projeto>
   ```
2. **Sincronização de Tokens do Figma:**
   ```powershell
   python .agents/skills/frontend-forge/scripts/sync-figma-tokens.py <caminho_tokens.json> --css src/tokens.css --tailwind tailwind.tokens.js
   ```

