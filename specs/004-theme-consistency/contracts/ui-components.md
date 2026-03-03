# UI Contracts: Padronização de Layout e Consistência de Tema

**Feature**: 004-theme-consistency  
**Date**: 2026-03-03

---

## Componente modificado

### `<TransactionListItem />` — `src/components/cash/TransactionListItem.tsx`

**Mudança**: Corrigir token de cor para valores negativos — de `text-red-600` (vermelho Tailwind built-in) para `text-brand-red` (token oficial do tema).

**Props**: sem alteração — interface pública inalterada.

**Comportamento de cor do valor**:

| Tipo de transação | `amount` | Cor atual (errada) | Cor correta |
|------------------|----------|--------------------|-------------|
| `manual_out` | negativo | `text-red-600` (#dc2626) | `text-brand-red` (#ff6a5a) |
| `game` | negativo | `text-red-600` (#dc2626) | `text-brand-red` (#ff6a5a) |
| `manual_in` | positivo | `text-brand-green` ✅ | `text-brand-green` (inalterado) |
| `game` | positivo | `text-brand-green` ✅ | `text-brand-green` (inalterado) |
| `transfer` | qualquer | `text-brand-gray-dark` ✅ | `text-brand-gray-dark` (inalterado) |

**Diff da linha afetada** (linha 74):

```tsx
// ANTES
className={`text-sm font-bold shrink-0 ${
  isTransfer
    ? 'text-brand-gray-dark'
    : isPositive ? 'text-brand-green' : 'text-red-600'   // ← off-brand
}`}

// DEPOIS
className={`text-sm font-bold shrink-0 ${
  isTransfer
    ? 'text-brand-gray-dark'
    : isPositive ? 'text-brand-green' : 'text-brand-red'  // ← token correto
}`}
```

**Resultado visual esperado**: o valor negativo na lista de movimentações deve ser visualmente idêntico ao coral do badge "Saída" (`variant="danger"`) exibido na mesma linha.

---

## Componentes auditados — sem modificação

Os seguintes componentes foram revisados e já estão em conformidade com a paleta do tema:

| Componente | Tokens semânticos usados | Status |
|-----------|--------------------------|--------|
| `Badge.tsx` | `brand-red`, `brand-green`, `brand-yellow`, `brand-blue` | ✅ Conforme |
| `CashDisplay.tsx` | `brand-red`, `brand-green`, `brand-gray-dark` | ✅ Conforme |
| `CashBreakdown.tsx` | `brand-red`, `gray-400` | ✅ Conforme |
| `GameCard.tsx` | `brand-red`, `brand-green` | ✅ Conforme |
| `GameHistory.tsx` | `brand-red`, `brand-green` | ✅ Conforme |
| `PlayerRow.tsx` | `brand-blue`, `brand-yellow` | ✅ Conforme |
| `BottomNav.tsx` | `brand-blue`, `gray-500` | ✅ Conforme |
| `Header.tsx` | `brand-blue` | ✅ Conforme |
