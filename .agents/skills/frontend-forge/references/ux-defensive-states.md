# Guia de UX Defensiva & Os 12 Estados de Interface (Frontend Forge)

Uma interface de alta maturidade não é testada apenas no seu fluxo perfeito ("happy path"), mas na forma elegante, previsível e segura como lida com o ciclo completo de estados de interação e dados.

---

## 📋 A Matriz dos 12 Estados de Tela

Todo componente de complexidade média ou tela dinâmica deve prever os seguintes estados:

| # | Estado | Objetivo | Comportamento Exigido |
| :--- | :--- | :--- | :--- |
| **1** | **Inicial (Idle / Unfetched)** | Apresentação antes de qualquer interação do usuário | Layout limpo, sem piscar elementos ou exibir valores `undefined` |
| **2** | **Carregamento (Loading / Skeleton)** | Manter o usuário ciente de que dados estão sendo buscados | Skeletons dimensionados exatamente no formato do conteúdo final, com animação de pulso suave |
| **3** | **Lista Vazia (Empty State)** | Explicar ausência de registros e orientar o próximo passo | Mensagem descritiva, ilustração/ícone vetorial sutil e botão de ação primária (CTA) |
| **4** | **Sucesso (Success Feedback)** | Confirmar que uma ação foi realizada com êxito | Feedback imediato (toast, badge com checkmark ou animação discreta de confirmação) |
| **5** | **Erro Operacional (Error / Retry)** | Comunicar falha técnica ou de negócio com transparência | Mensagem clara em linguagem humana + botão para **Tentar Novamente** |
| **6** | **Falha de Conexão (Network Failure)** | Lidar com perda de internet ou timeout de servidor | Indicador de desconexão persistente no topo sem destruir a tela atual |
| **7** | **Validação de Formulário** | Orientar preenchimento correto de dados | Validação inline com mensagens de ajuda abaixo do campo, cores semânticas e acessibilidade com `aria-invalid` |
| **8** | **Ação Desabilitada (Disabled)** | Impedir submissões inválidas ou duplicadas | Botão com opacidade reduzida, cursor `not-allowed`, sem perda de contraste de leitura e tooltip explicativo quando pertinente |
| **9** | **Confirmação Crítica (Confirmation)** | Prevenir perda acidental de dados ou gastos de recursos | Diálogo modal com foco retido, ação primária clara (ex: "Confirmar Compra") e botão seguro de cancelamento |
| **10** | **Navegação por Teclado (Focus Ring)** | Garantir uso autônomo por teclado | Anel de foco nítido (`outline: 2px solid var(--accent); outline-offset: 2px;`) ao pressionar <kbd>Tab</kbd> |
| **11** | **Popovers & Dicas (Tooltips)** | Explicar termos técnicos ou métricas complexas | Renderização com posicionamento seguro contra bordas da janela e suporte a `aria-describedby` |
| **12** | **Degradação Graciosa (Partial Data)** | Funcionar mesmo quando um dos serviços secundários falhar | Renderiza os dados disponíveis e avisa discretamente sobre o módulo que está indisponível |

---

## 🛡️ Código de Referência: Padrão Defensivo de Listagem

```tsx
// Exemplo em React / TypeScript demonstrando UX Defensiva
export function MercenaryList({ mercenaries, isLoading, error, onRetry, onHire }: Props) {
  // 1. Estado de Carregamento
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="skeleton-card animate-pulse" aria-hidden="true" />
        ))}
      </div>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return (
      <div className="error-panel" role="alert">
        <p className="text-red-400 mb-3">Falha ao carregar contratos da taverna: {error.message}</p>
        <button onClick={onRetry} className="btn btn-secondary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  // 3. Estado de Lista Vazia
  if (!mercenaries || mercenaries.length === 0) {
    return (
      <div className="empty-state-panel text-center py-8">
        <div className="empty-state-icon mb-3">⚔️</div>
        <h3 className="text-base font-semibold text-zinc-200">Nenhum mercenário disponível</h3>
        <p className="text-sm text-zinc-400 mt-1 mb-4">Todos os guerreiros foram contratados para caçadas no momento.</p>
        <button onClick={onRetry} className="btn btn-primary">
          Atualizar Taverna
        </button>
      </div>
    );
  }

  // 4. Estado Completo com Dados
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mercenaries.map((merc) => (
        <MercenaryCard key={merc.id} mercenary={merc} onHire={onHire} />
      ))}
    </div>
  );
}
```

---

## 🚨 Auditoria MCP Vinculada
A ferramenta `auditar_identidade_frontend` no MCP `DiretorFrontendUI` detecta automaticamente componentes que realizam `.map()` em listas sem prever condições de `length === 0` ou `isLoading`.
