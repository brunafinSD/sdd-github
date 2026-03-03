# Research: 002-dual-cash-split

**Phase 0 output** for `speckit.plan`
**Date**: 2026-03-03

---

## Decision 1 — Estrutura do Store: único `useCashStore` expandido

**Decision**: Manter um único `useCashStore`. Expandir `CashSummary` para incluir `courtBalance`, `admBalance` e `totalBalance` (soma). Não criar store separado por caixa.

**Rationale**: A operação de transferência (quadra → ADM) muta ambos os saldos atomicamente. Com dois stores seria necessário sincronização manual entre eles — frágil e desnecessário. Um único `set()` atualiza ambos no mesmo render cycle. O estado atual de `loading/error` já serve os dois sub-caixas.

**Alternatives considered**: Dois stores Zustand separados (`useCashCourtStore` + `useCashAdmStore`) — rejeitado pela complexidade de sincronização na transferência e pelo overhead de duas chamadas `loadSummary` independentes.

---

## Decision 2 — Schema IndexedDB: única tabela `transactions` + nova tabela `transfers`

**Decision**: 
- Adicionar campo `cashTarget: 'court' | 'adm'` em `Transaction` (tabela `transactions` existente), indexado.  
- Criar tabela nova `transfers` para movimentações inter-caixa. Transferências **não entram** na tabela `transactions` pois não afetam o saldo total.

**Rationale**: Manter transfers na tabela transactions exigiria que toda função de cálculo de saldo ignorasse registros `type === 'transfer'` — criando bug latente e tornando a lógica de soma não-óbvia. Tabela separada `transfers` mantém semântica limpa: transactions = entradas/saídas reais; transfers = redistribuição interna.

**Alternatives considered**: 
- Dois pares de registros na tabela transactions compartilhando `transferId` — rejeitado: polui a tabela e exige filtros em toda query de saldo.
- Duas tabelas de transactions (`transactions_court` + `transactions_adm`) — rejeitado: duplica todo o código de query.

---

## Decision 3 — Migração de dados existentes: `Dexie.version(2)` + `.upgrade()`

**Decision**: Usar `Dexie.version(2).stores({...}).upgrade(tx => ...)` para migrar a schema de forma **não-destrutiva**, preservando dados reais dos usuários. Backfill: `cashTarget = 'adm'` em todos os registros existentes sem o campo. **Não** bumpar `SEED_VERSION` para esta mudança.

**Rationale**: `SEED_VERSION` apaga todos os dados do IndexedDB — aceitável durante desenvolvimento com dados mock, mas inaceitável uma vez que usuários reais tenham transações registradas no PWA instalado. O mecanismo correto de evolução de schema no IndexedDB é `db.version()`. O campo `cashTarget` sendo adicionado não é indexável via `filter()` em escala — deve constar na string de schema para uso com `.where('cashTarget').equals(...).toArray()` (query via índice Dexie, sem full scan).

**Default para migração**: `'adm'` — as transações existentes representam o caixa geral (PIX, entradas manuais), que mapeia semanticamente para o caixa ADM. O caixa quadra é um conceito novo e não pode ser inferido retroativamente.

**Alternatives considered**: 
- Bump `SEED_VERSION` para '3' — rejeitado: apagaria dados reais de usuários do PWA instalado.
- `filter()` sem índice — rejeitado: full scan em JS em cada recálculo de saldo.

---

## Decision 4 — `cashTarget` em ajustes manuais (Entrada/Saída)

**Decision**: O formulário de ajuste manual (`CashAdjustForm`) passa a exigir seleção do caixa destino via radio/toggle. **Default**: `'adm'`. Validação no Zod schema: campo obrigatório.

**Rationale**: Preserva o comportamento atual (ajustes iam para o caixa único, que mapeava para ADM) enquanto dá controle explícito ao gestor quando necessário.

---

## Decision 5 — `AbatimentoQuadra`: campo `courtCredit` no jogo

**Decision**: Adicionar campo opcional `courtCredit?: Money` na entidade `Game`. Quando preenchido, o `cashImpact` do jogo é calculado como `totalPaid - courtCost + courtCredit` para o caixa ADM; e `courtCredit` é debitado do caixa quadra separadamente como transação do tipo `manual_out` com `cashTarget: 'court'`.

**Rationale**: Modelo simples e consistente. O débito do caixa quadra usa o mesmo mecanismo de transactions existente, e o `courtCredit` fica gravado no jogo para exibição e auditoria.

---

## Interfaces Propostas

```typescript
// Tipos adicionais/modificados

type CashTarget = 'court' | 'adm'

// Transaction: adicionar campo cashTarget
interface Transaction {
  // ... campos existentes ...
  cashTarget: CashTarget   // NOVO — obrigatório (backfill: 'adm')
}

// Transfer: nova entidade
interface Transfer {
  id: string
  amount: Money
  description: string | null
  createdAt: Date
  // sempre court → adm (único fluxo permitido pela spec)
}

// CashSummary: expandido
interface CashSummary {
  totalBalance: Money      // court + adm
  courtBalance: Money      // NOVO
  admBalance: Money        // NOVO
  totalIn: Money
  totalOut: Money
  transactionCount: number
  lastUpdatedAt: Date
}
```

---

## Sem NEEDS CLARIFICATION em aberto

Todos os pontos técnicos foram resolvidos. Pronto para Phase 1.
