# Engenharia de Design Tokens (Frontend Forge)

Design tokens são os blocos fundamentais indivisíveis da interface. Eles garantem consistência matemática, facilitam a troca de temas e impedem a proliferação de valores mágicos e arbitrários no código.

---

## 📐 1. Escala de Espaçamento Modular (Base 4px / 8px)

Nunca declare espaçamentos arbitrários como `13px`, `19px` ou `27px`. Utilize a escala padronizada:

```css
:root {
  --space-0: 0px;
  --space-1: 4px;    /* Micro-espaçamento (ícones inline, tags compactas) */
  --space-2: 8px;    /* Espaçamento interno de controles (botões, inputs) */
  --space-3: 12px;   /* Gaps em listas densas e modais compactos */
  --space-4: 16px;   /* Padding padrão de cartões e contêineres */
  --space-5: 20px;   /* Respiro entre cabeçalhos e blocos de conteúdo */
  --space-6: 24px;   /* Gaps entre colunas de grid principal */
  --space-8: 32px;   /* Separação de seções principais */
  --space-12: 48px;  /* Respiro vertical de páginas */
  --space-16: 64px;  /* Margens amplas em telas de desktop */
}
```

---

## 🔲 2. Escala de Raios de Curvatura (Border Radius)

```css
:root {
  --radius-none: 0px;
  --radius-xs: 2px;    /* Badges ultra-compactos e barras de progresso */
  --radius-sm: 4px;    /* Botões, inputs, tags e seletores */
  --radius-md: 6px;    /* Cards padrão, caixas de diálogo compactas */
  --radius-lg: 8px;    /* Painéis principais e modais */
  --radius-xl: 12px;   /* Banners destacados */
  --radius-full: 9999px; /* Avatares circulares e pills */
}
```

---

## 🔤 3. Escala Tipográfica Funcional

```css
:root {
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
  --font-family-display: 'Cinzel', 'Outfit', var(--font-family-sans);

  --font-size-xs: 11px;   /* Metadados, tags secundárias, notas de rodapé */
  --font-size-sm: 13px;   /* Rótulos de formulário, dados secundários */
  --font-size-base: 14px; /* Texto de leitura padrão */
  --font-size-md: 16px;   /* Títulos de cartões, subtítulos */
  --font-size-lg: 18px;   /* Cabeçalhos de seção */
  --font-size-xl: 22px;   /* Títulos de painel */
  --font-size-2xl: 28px;  /* Títulos de página / Herói */

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
}
```

---

## 🛡️ 4. Elevação, Sombras e Bordas Estruturadas

```css
:root {
  --border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --border-strong: 1px solid rgba(255, 255, 255, 0.16);
  --border-accent: 1px solid rgba(212, 175, 55, 0.35);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
}
```

---

## 🎯 5. Regras de Aplicação no Código

1. **Nunca use valores inline mágicos:** Use classes utilitárias ou `var(--space-*)` no CSS.
2. **Componentes devem consumir tokens, não criá-los:** Componentes reutilizáveis recebem propriedades da escala de tokens.
3. **Validação:** A ferramenta MCP `verificar_consistencia_tokens` rastreia automaticamente desvios dessa escala em todo o repositório.
