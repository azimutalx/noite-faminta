# Manual de Acessibilidade (WCAG 2.2 AA) & Responsividade (Frontend Forge)

A acessibilidade e a responsividade não são etapas adicionadas no final do projeto, mas requisitos fundamentais estruturados desde o primeiro elemento HTML.

---

## ♿ 1. Acessibilidade Digital (WCAG 2.2 Nível AA)

### A. Relação de Contraste de Cores
- **Texto Normal (< 18pt ou < 14pt em negrito):** Contraste mínimo de **4.5:1** contra o fundo imediato.
- **Texto Grande (>= 18pt ou >= 14pt em negrito):** Contraste mínimo de **3.0:1**.
- **Componentes de Interface & Bordas Ativas:** Contraste mínimo de **3.0:1** para indicar campos com foco, seletores e limites de botões.

### B. Semântica HTML Rigorosa
- Use sempre elementos nativos: `<button>` para ações e `<a>` para navegação entre páginas/URLs. Nunca adicione `onClick` a uma `<div>` sem transformá-la em controle acessível (`role="button"`, `tabIndex={0}`, `onKeyDown`).
- Estrutura de cabeçalhos hierárquica: Apenas um único `<h1>` por página, seguido ordenadamente por `<h2>` e `<h3>`.
- Regiões semânticas de referência: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`.

### C. Navegação Exclusiva por Teclado
- **Ordem de Tabulação Lógica:** Siga a ordem visual do fluxo de leitura (esquerda para a direita, cima para baixo).
- **Indicador de Foco Visível (`:focus-visible`):**
  ```css
  :focus-visible {
    outline: 2px solid var(--color-accent, #3b82f6);
    outline-offset: 2px;
  }
  ```
- **Foco Retido em Diálogos (Focus Trap):** Quando um modal for aberto, o foco deve ser movido para o primeiro elemento interativo interno e impedido de escapar para a página de fundo até que seja fechado.
- **Tecla Esc:** Deve fechar imediatamente modais, menus suspensos e tooltips.

### D. Rótulos e Leitores de Tela
- Botões que exibem apenas ícones vetoriais DEVEM conter `aria-label`:
  ```html
  <button aria-label="Fechar painel de inventário" class="btn-icon">
    <svg aria-hidden="true">...</svg>
  </button>
  ```
- Imagens informativas devem conter `alt` descritivo. Imagens puramente decorativas devem conter `alt=""` e `aria-hidden="true"`.

---

## 📱 2. Diretrizes de Responsividade & Adaptação de Ecrãs

O layout deve responder com naturalidade aos seguintes três breakpoints principais:

| Breakpoint | Resolução | Comportamento Exigido |
| :--- | :--- | :--- |
| **Mobile** | **375px a 767px** | Coluna única, navegação colapsada (drawer/hambúrguer ou bottom bar), alvos de toque >= 44x44px, remoção de tabelas largas em favor de cards empilhados. |
| **Tablet** | **768px a 1439px** | Layout de 2 colunas, navegação híbrida, tabelas compactas com scroll horizontal delimitado. |
| **Desktop** | **1440px ou superior** | Layout completo de 3 painéis ou multi-coluna, respiros generosos e tabelas completas. |

### Regras Cruciais de Layout Móvel:
1. **Zero Overflow Horizontal:** Nenhum elemento deve exceder `100vw`. Evite larguras fixas em pixels (`width: 600px`). Prefira `max-width: 100%` e `width: min(600px, 100%)`.
2. **Alvos de Toque (Touch Targets):** Todo botão, link ou campo interativo em dispositivos móveis deve ter área de clique mínima de **44 x 44 pixels**, garantida via padding quando o elemento visual for menor.
3. **Tabelas Responsivas:** Em telas estreitas, transforme linhas de tabela em cartões individuais ou encapsule a tabela em um contêiner com `overflow-x: auto` e sombreamento indicativo de scroll.

---

## 🔍 3. Auditoria Visual com Playwright
O agente pode acionar o MCP `InspetorVisualBrowser` para validar esses comportamentos automaticamente:
```python
auditar_responsividade_breakpoints("http://localhost:5173")
```
O servidor Playwright testará headless a renderização em 375px, 768px e 1440px e reportará quaisquer quebras ou exceções de console.
