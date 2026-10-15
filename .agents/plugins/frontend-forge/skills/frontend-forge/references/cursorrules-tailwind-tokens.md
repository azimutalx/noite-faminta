# Guia de Tailwind CSS & Design Tokens Semânticos (Awesome-Cursorrules)

Este guia define as práticas essenciais para construir layouts fluidos, performáticos e consistentes com **Tailwind CSS**, eliminando valores inline arbitrários e adotando tokens semânticos baseados em HSL.

---

## 🎨 1. Arquitetura de Cores Baseada em Variáveis HSL

Nunca defina cores fixas diretamente nos componentes. Configure o Tailwind para consumir variáveis CSS em formato HSL:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 20% 98%;
    --foreground: 224 71.4% 4.1%;

    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;

    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;

    --primary: 220.9 39.3% 11%;
    --primary-foreground: 210 20% 98%;

    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;

    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;

    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;

    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 224 71.4% 4.1%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;

    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;

    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;

    --primary: 210 20% 98%;
    --primary-foreground: 220.9 39.3% 11%;

    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;

    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;

    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;

    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 216 12.2% 83.9%;
  }
}
```

---

## 📱 2. Filosofia Mobile-First Rigorosa

No Tailwind, classes sem prefixo se aplicam a telas móveis (a partir de 0px). Os prefixos definem o comportamento em telas maiores:
- `w-full md:w-1/2 lg:w-1/3`: 1 coluna em mobile, 2 em tablet e 3 em desktop.
- `flex-col md:flex-row`: empilhado verticalmente em telas móveis e lado a lado em desktop.
- `text-lg md:text-2xl`: tamanho de fonte proporcional ao espaço disponível.

---

## 🚫 3. Proibição de Escapes Arbitrários (`[..px]`)

- ❌ `p-[14px]` -> Use `p-3.5` ou `p-4` (escala padrão).
- ❌ `w-[325px]` -> Use `w-80` ou `max-w-xs`.
- ❌ `bg-[#1a1a1a]` -> Use `bg-card` ou `bg-zinc-900`.
- ❌ `text-[13px]` -> Use `text-xs` ou `text-sm`.

O desvio da escala padrão fragmenta o design e é reprovado automaticamente pelo validador do **Frontend Forge**.
