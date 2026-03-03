# UI Component Contracts: 002-dual-cash-split

**Phase 1 output** for `speckit.plan`
**Date**: 2026-03-03

---

## Modified Components

### `CashDisplay` (src/components/dashboard/CashDisplay.tsx)

Exibe o saldo total em destaque e o breakdown por caixa em fonte menor.

**Props** (sem mudança de interface externa — lê do `useCashStore`):

```
summary.totalBalance  → exibido em destaque (tamanho atual)
summary.courtBalance  → NOVO, em fonte menor: "Quadra: R$ X"
summary.admBalance    → NOVO, em fonte menor: "ADM: R$ Y"
```

**Layout**:
```
┌─────────────────────────────────────┐
│  Saldo                              │
│  R$ 150,00          (destaque)      │
│  Quadra R$60  · ADM R$90  (sm)     │
└─────────────────────────────────────┘
```

**Regras visuais**:
- `totalBalance < 0` → cor `brand-red`
- `courtBalance < 0` → sub-linha com cor `brand-red`
- `admBalance < 0` → sub-linha com cor `brand-red`

---

### `CashAdjustForm` (src/components/cash/CashAdjustForm.tsx)

Adiciona seletor de caixa destino ao formulário existente.

**Novo campo no formulário**:

| Campo | Tipo | Default | Validação |
|-------|------|---------|-----------|
| `cashTarget` | `'court' \| 'adm'` | `'adm'` | obrigatório |

**UI**: toggle/radio compacto abaixo do campo de valor:
```
  Caixa: [● ADM]  [  Quadra  ]
```

---

## New Components

### `CashBreakdown` (src/components/dashboard/CashBreakdown.tsx)

Sub-componente de `CashDisplay`. Exibe os dois sub-saldos lado a lado.

**Props**:
```typescript
interface CashBreakdownProps {
  courtBalance: Money
  admBalance: Money
}
```

**Exemplo de output**:
```
Quadra R$ 60,00  ·  ADM R$ 90,00
```

---

### `CourtWithdrawModal` (src/components/cash/CourtWithdrawModal.tsx)

Modal para saque do caixa quadra. Duas modalidades via tab/radio.

**Props**:
```typescript
interface CourtWithdrawModalProps {
  courtBalance: Money
  pendingGames: Game[]   // para seleção de abatimento
  onClose: () => void
  onTransfer: (amount: Money, description?: string) => Promise<void>
  onApplyCredit: (gameId: string, amount: Money) => Promise<void>
}
```

**Layout interno**:
```
┌─────────────────────────────────────────┐
│  Saque do Caixa Quadra                  │
│  Disponível: R$ 60,00                   │
│                                         │
│  [● Transferir para ADM]                │
│  [  Abater em jogo pendente  ]          │
│                                         │
│  [tab=transfer]:                        │
│    Valor: [R$ ______]                   │
│    Observação: [_________]              │
│                                         │
│  [tab=credit]:                          │
│    Jogo: [dropdown jogos pendentes]     │
│    Valor: [R$ ______]                   │
│                                         │
│     [Cancelar]   [Confirmar saque]      │
└─────────────────────────────────────────┘
```

**Validações**:
- `amount > 0`
- `amount <= courtBalance`
- `amount <= courtCost do jogo selecionado` (modo abatimento)
- Botão confirmar desabilitado se validação falhar

---

### `TransferBadge` (extensão de TransactionListItem)

Indicação visual no histórico para transferências inter-caixa.

No `TransactionListItem`, quando `type = 'transfer'`:
- Badge: "Quadra → ADM"
- Cor: `brand-blue/20 text-brand-blue`
- Valor: exibido como neutro (sem sinal de + ou -)

---

## Page Changes

### `Dashboard` (src/pages/Dashboard.tsx)

- Botão "Saque Quadra" aparece quando `courtBalance > 0`
- Abre `CourtWithdrawModal`

### `CashAdjust` (src/pages/CashAdjust.tsx)

- Passa `cashTarget` do form para `addManualEntry()` / `addManualExit()`

---

## Store Actions (interface pública)

```typescript
// useCashStore — novos actions
transferToAdm(amount: Money, description?: string): Promise<void>
applyCourtCredit(gameId: string, amount: Money): Promise<void>
addManualEntry(amount, description, justification, cashTarget: CashTarget): Promise<void>
addManualExit(amount, description, justification, cashTarget: CashTarget): Promise<void>
```
