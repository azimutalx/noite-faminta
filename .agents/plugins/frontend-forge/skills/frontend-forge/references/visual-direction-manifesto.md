# Manifesto de Direção Criativa & Identidade Visual (Frontend Forge)

Este guia define os padrões visuais rigorosos para produzir interfaces modernas, sofisticadas e com acabamento humano, eliminando completamente os padrões óbvios de código gerado por IA.

---

## 🚫 1. Anti-Padrões & Clichês de IA (Estritamente Proibidos)

1. **O "Gradiente Roxo/Azul de IA":**
   - Fundos ou textos com `bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500` sem nenhuma conexão com a marca.
   - *Substituição:* Use superfícies sólidas com profundidade, bordas sutis com acentos deliberados em pontos focais específicos de interação.

2. **Sombras Excessivas ("Float-Hell"):**
   - Cartões flutuando sobre fundos cinzas claros com sombras gigantes e difusas (`shadow-2xl` generalizado).
   - *Substituição:* Elevação estruturada através de camadas de contraste (L0 background, L1 surface, L2 card, L3 popover) e bordas finas de 1px com alta precisão.

3. **Bordas Arredondadas Infantojuvenis (`rounded-3xl`):**
   - Painéis de dados técnicos, tabelas financeiras ou jogos com cantos excessivamente circulares que desperdiçam espaço útil e quebram a seriedade do produto.
   - *Substituição:* Escala consistente de raios de curvatura: `2px` (micro), `4px` (controles/badges), `6px` a `8px` (cartões/diálogos).

4. **Emojis como Ícones de Produto:**
   - Emojis (como 🔥, ⚡, 🚀, 🛡️) usados indiscriminadamente como ícones de navegação em produtos que deveriam transmitir autoridade técnica.
   - *Substituição:* Ícones vetoriais inline (SVG com viewBox 24x24) ou icon-fonts otimizadas (Lucide, Heroicons, Phosphor).

5. **Telas Densas com Distribuição Preguiçosa:**
   - Todo o conteúdo jogado dentro de cards idênticos dispostos em grid 3x3 sem hierarquia visual clara de qual dado é mais relevante.
   - *Substituição:* Layouts com áreas herói, contraste de escala tipográfica e organização visual por importância cognitiva.

---

## 🎨 2. Paleta de Cores & Superfícies Estruturadas

### Modelo de Superfície Escura Profunda (Dark Theme de Alta Fidelidade)
- **L0 (Background Base):** `#090a0f` a `#0d1117` — Profundo, sóbrio, evita o preto puro `#000000` em telas OLED quando se busca suavidade de leitura.
- **L1 (Painéis & Contêineres):** `#141721` a `#161b22` — Superfície ligeiramente elevada com opacidade e contraste sutil.
- **L2 (Elementos Interativos & Cards):** `#1c2130` a `#21262d` — Destaque tátil com borda perceptível.
- **Bordas de Precisão:** `rgba(255, 255, 255, 0.08)` a `rgba(255, 255, 255, 0.12)` ou `#30363d` — Define contornos sem agressividade.

### Cores Semânticas de Ação
- **Acento Primário (Call to Action):** Tom com alto contraste e saturação controlada (ex: Dourado Âmbar `#d4af37`, Azul Cobalto `#2563eb` ou Carmesim `#b91c1c`).
- **Sucesso (Safe / Completed):** Verde Esmeralda `#10b981` ou `#059669`.
- **Aviso (Warning / Pending):** Âmbar / Laranja `#f59e0b` ou `#d97706`.
- **Perigo / Destrutivo (Critical / Error):** Vermelho Escarlate `#ef4444` ou `#dc2626`.
- **Informativo / Neutro:** Ciano Frio `#06b6d4` ou Cinza Neutro `#94a3b8`.

---

## ✍️ 3. Tipografia & Hierarquia de Dados

Uma interface profissional comunica valor através da diferenciação intencional entre leitura e métricas:

| Função | Família Sugerida | Peso | Aplicação |
| :--- | :--- | :--- | :--- |
| **Títulos e Destaques** | Sans Display / Serif Clássica (Inter, Outfit, Cinzel) | 600 - 700 | Títulos de tela, nomes de seções, banners |
| **Corpo e Rótulos** | Sans Moderna (Inter, Roboto, SF Pro, Outfit) | 400 - 500 | Instruções, parágrafos, labels de formulário |
| **Métricas e Dados** | Monospace Técnica (JetBrains Mono, Fira Code, Roboto Mono) | 500 - 600 | Valores de moedas, timestamps, UUIDs, atributos |

---

## 🌊 4. Movimento & Micro-Interações Táteis

- **Feedback de Interação Imediato:** Transições curtas (150ms a 200ms) com curva `ease-out` em `:hover` e `:active`.
- **Transformação Tátil:** Leve elevação vertical (`transform: translateY(-1px)`) ou sutil brilho de borda em foco.
- **Respeito à Acessibilidade:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
