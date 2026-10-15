# Guia de Arquitetura Next.js App Router & React 19 (Awesome-Cursorrules)

Este manual condensa os padrões de engenharia sênior para desenvolvimento em **Next.js (App Router)** e **React 19**, eliminando anti-padrões e garantindo máxima performance, segurança e clareza.

---

## 🏛️ 1. Princípio Server-First (RSC por Padrão)

No Next.js App Router, todo componente dentro da pasta `app/` é um **React Server Component (RSC)** por padrão:
- **Execute busca de dados diretamente no servidor:**
  ```tsx
  // app/dashboard/page.tsx - Server Component limpo
  import { Suspense } from "react"
  import { getMercenaryContracts } from "@/services/mercenaryService"
  import { MercenaryGrid } from "@/features/mercenaries/components/MercenaryGrid"
  import { MercenaryGridSkeleton } from "@/features/mercenaries/components/MercenaryGridSkeleton"

  export default async function DashboardPage() {
    const contractsPromise = getMercenaryContracts()

    return (
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Taverna dos Renegados</h1>
        <Suspense fallback={<MercenaryGridSkeleton />}>
          <MercenaryList contractsPromise={contractsPromise} />
        </Suspense>
      </main>
    )
  }
  ```

---

## 🎯 2. A Fronteira do `'use client'`

Coloque a diretiva `'use client'` apenas nas folhas da árvore de componentes, onde a interatividade do navegador é estritamente requerida:
- Manipuladores de eventos (`onClick`, `onChange`, `onSubmit`).
- Hooks de estado (`useState`, `useReducer`, `useOptimistic`).
- Hooks de ciclo de vida e efeitos do browser (`useEffect`, `useLayoutEffect`).
- Bibliotecas que exigem o objeto `window` ou `document`.

**Anti-Padrão Fatal:** Nunca coloque `'use client'` no topo de uma página inteira (`page.tsx`) ou layout raiz (`layout.tsx`). Isole o botão, o formulário ou o modal interativo em um subcomponente cliente dedicado.

---

## ⚡ 3. Mutações com Server Actions & Validação Zod

Mutações de dados devem ser tratadas através de **Server Actions** com validação forte em tempo de execução via **Zod**:

```tsx
// app/actions/hireMercenary.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const HireSchema = z.object({
  mercenaryId: z.string().uuid(),
  durationHours: z.number().int().min(1).max(24),
})

export type FormState = {
  success?: boolean
  error?: string
}

export async function hireMercenaryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = HireSchema.safeParse({
    mercenaryId: formData.get('mercenaryId'),
    durationHours: Number(formData.get('durationHours')),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos para contratação do mercenário.' }
  }

  try {
    // Chamada à camada de persistência com transação
    await executeHireTransaction(parsed.data)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Falha ao processar contrato de mercenário.' }
  }
}
```

---

## 🔒 4. Tipagem TypeScript Sem Concessões

1. **Zero `any`:** Substitua qualquer incerteza por genéricos (`<T>`), tipos utilitários (`Partial`, `Pick`, `Omit`, `Record`) ou `unknown` com guardas de tipo.
2. **Uniões Discriminadas para Estados de API:**
   ```ts
   type AsyncState<T> =
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: T }
     | { status: 'error'; message: string }
   ```
   Isso impede que o desenvolvedor acerte acidentalmente `data` quando a requisição falhar ou estiver em `loading`.

---

## 📁 5. Convenções de Nomenclatura do Projeto
- **Pastas:** `kebab-case` (ex: `features/combat-arena`, `components/ui`).
- **Arquivos de Componente:** `PascalCase.tsx` (ex: `CombatCard.tsx`) ou rotas nativas (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- **Hooks e Utilitários:** `camelCase.ts` com prefixo `use` para hooks (ex: `useCombatLog.ts`, `formatCurrency.ts`).
