# Data Model: 002-dual-cash-split

**Phase 1 output** for `speckit.plan`
**Date**: 2026-03-03

---

## Entities

### `CashTarget` (new type)

```typescript
type CashTarget = 'court' | 'adm'
```

| Valor | Semântica |
|-------|-----------|
| `court` | Caixa quadra — dinheiro físico recolhido na quadra |
| `adm` | Caixa ADM — PIX, entradas manuais, transferências recebidas |

---

### `Transaction` (modificado)

Campo adicionado: `cashTarget: CashTarget`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | ✅ | UUID |
| `type` | `'game' \| 'manual_in' \| 'manual_out'` | ✅ | mantido |
| `amount` | `Money` | ✅ | em centavos |
| `description` | `string` | ✅ | |
| `justification` | `string \| null` | ✅ | obrigatório em manual_in/out |
| `gameId` | `string \| null` | ✅ | referência para type='game' |
| `cashTarget` | `CashTarget` | ✅ | **NOVO** — `'court'` ou `'adm'` |
| `createdAt` | `Date` | ✅ | |

**Regras de validação**:
- `cashTarget = 'court'` → `type` deve ser `'game'` ou `'manual_in'` ou `'manual_out'`
- Registros existentes migrados com `cashTarget = 'adm'`
- Pagamentos Na Quadra ao finalizar jogo → `cashTarget = 'court'`
- Pagamentos PIX ao finalizar jogo → `cashTarget = 'adm'`

**Schema Dexie** (v2):
```
transactions: 'id, type, gameId, createdAt, cashTarget'
```

---

### `Transfer` (nova entidade)

Representa movimentação interna do Caixa Quadra para o Caixa ADM. **Não altera saldo total.**

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | ✅ | UUID |
| `amount` | `Money` | ✅ | em centavos, > 0 |
| `description` | `string \| null` | — | texto livre opcional |
| `createdAt` | `Date` | ✅ | |

**Regras de validação**:
- `amount > 0`
- `amount <= courtBalance` (Caixa Quadra não pode ficar negativo após a transferência)
- Fluxo é sempre `court → adm` (única direção permitida pela spec)

**Schema Dexie** (v2):
```
transfers: 'id, createdAt'
```

---

### `Game` (modificado)

Campo adicionado: `courtCredit?: Money`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | ✅ | UUID |
| `date` | `Date` | ✅ | |
| `status` | `'pending' \| 'finished'` | ✅ | |
| `courtCost` | `Money` | ✅ | custo da quadra em centavos |
| `players` | `Player[]` | ✅ | |
| `cashImpact` | `Money \| null` | — | calculado ao finalizar |
| `courtCredit` | `Money \| null` | — | **NOVO** — abatimento aplicado do caixa quadra |
| `finishedAt` | `Date \| null` | — | |

---

### `CashSummary` (modificado)

| Campo | Tipo | Notas |
|-------|------|-------|
| `totalBalance` | `Money` | court + adm |
| `courtBalance` | `Money` | **NOVO** — saldo do caixa quadra |
| `admBalance` | `Money` | **NOVO** — saldo do caixa ADM |
| `totalIn` | `Money` | soma de todas as entradas |
| `totalOut` | `Money` | soma de todas as saídas |
| `transactionCount` | `number` | |
| `lastUpdatedAt` | `Date` | |

**Cálculo**:
```
courtBalance = Σ(transactions WHERE cashTarget='court' AND amount > 0)
             - Σ(transactions WHERE cashTarget='court' AND amount < 0)
             - Σ(transfers.amount)           // saques da quadra

admBalance   = Σ(transactions WHERE cashTarget='adm' AND amount > 0)
             - Σ(transactions WHERE cashTarget='adm' AND amount < 0)
             + Σ(transfers.amount)           // recebimentos de transferências

totalBalance = courtBalance + admBalance
```

---

## Diagrama de Estado — Caixa Quadra

```
[Jogo finalizado, pagamento Na Quadra]
         │  + amount
         ▼
   ┌─────────────┐
   │ courtBalance│◄──── manual_in (cashTarget='court')
   └──────┬──────┘
          │  saque
     ┌────┴─────────────────────────────┐
     │ Transferência para ADM           │ Abatimento no jogo
     │  - courtBalance                  │  - courtBalance
     │  + admBalance                    │  - courtCost efetivo do jogo
     └──────────────────────────────────┘
```

---

## Migração de Schema (Dexie)

```typescript
// db.ts — versão atual é 1, adicionar bloco version(2)
this.version(1).stores({ /* manter intacto */ })

this.version(2)
  .stores({
    games: 'id, date, status, finishedAt',
    players: 'id, gameId, name',
    transactions: 'id, type, gameId, createdAt, cashTarget',  // + cashTarget
    transfers: 'id, createdAt',                                // nova tabela
  })
  .upgrade(tx =>
    tx.table('transactions').toCollection().modify(t => {
      if (t.cashTarget === undefined) t.cashTarget = 'adm'
    })
  )
```

---

## Impacto em Código Existente

| Arquivo | Mudança |
|---------|---------|
| `src/types/cash.ts` | Adicionar `CashTarget`, campo `cashTarget` em `Transaction`, nova interface `Transfer`, expandir `CashSummary` |
| `src/schemas/cash.ts` | Adicionar `cashTarget` ao schema Zod de Transaction |
| `src/services/db.ts` | Bump para version(2) com migration |
| `src/services/cashService.ts` | `getCashSummary()` calcula por `cashTarget`; `createGameTransaction()` recebe `cashTarget`; novo `createTransfer()` |
| `src/store/cashStore.ts` | Novos actions: `transferToAdm()`, `applyCourtCredit()` |
| `src/store/gameStore.ts` | `finalizeGame()` roteia pagamentos por método; `applyCourtCredit()` |
| `src/components/dashboard/CashDisplay.tsx` | Exibir `courtBalance` e `admBalance` em fonte menor |
| `src/components/cash/CashAdjustForm.tsx` | Adicionar seletor `cashTarget` (radio Quadra/ADM, default ADM) |
| `src/pages/CashAdjust.tsx` | Passar `cashTarget` para actions |
| `src/services/seed.ts` | Seed atualizado com `cashTarget` em todas as transactions; `courtCredit` nos jogos de exemplo |
