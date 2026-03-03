# Tasks: Caixas Separados — Quadra e ADM

**Input**: Design documents from `/specs/002-dual-cash-split/`
**Branch**: `002-dual-cash-split`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ui-components.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: No new project initialization needed — feature adds to existing React + Dexie + Zustand SPA.

> Project already initialized. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, DB migration, and service layer updates that ALL user stories depend on. No UI work begins until this phase is complete.

**⚠️ CRITICAL**: US1, US2, and US3 all read from `CashSummary.courtBalance` / `admBalance` and call updated store actions. Complete this phase before any other phase.

- [X] T001 Add `CashTarget = 'court' | 'adm'` type, `Transfer` interface, `cashTarget: CashTarget` field on `Transaction`, `courtBalance` + `admBalance` + `totalBalance` on `CashSummary`, and `courtCredit?: Money | null` on `Game` in `src/types/cash.ts` and `src/types/game.ts`
- [X] T002 Add `cashTarget: z.enum(['court', 'adm'])` field to the Zod transaction schema in `src/schemas/cash.ts`
- [X] T003 Bump Dexie to `version(2)`: keep `version(1).stores()` intact, add `version(2).stores({ ..., transactions: 'id, type, gameId, createdAt, cashTarget', transfers: 'id, createdAt' }).upgrade(tx => tx.table('transactions').toCollection().modify(t => { if (t.cashTarget === undefined) t.cashTarget = 'adm' }))` in `src/services/db.ts`
- [X] T004 Update `getCashSummary()` to compute `courtBalance` (sum of transactions WHERE `cashTarget='court'` minus transfers outflow) and `admBalance` (sum WHERE `cashTarget='adm'` plus transfers inflow); rename `currentBalance` → `totalBalance = courtBalance + admBalance`; update return type in `src/services/cashService.ts`
- [X] T005 Add `cashTarget: CashTarget` parameter to `createGameTransaction()`, `addManualEntry()`, and `addManualExit()` functions; pass it through to the Dexie `transactions.add()` call in `src/services/cashService.ts`
- [X] T006 [P] Add `createTransfer(amount: Money, description?: string): Promise<void>` to `src/services/cashService.ts` — validates `amount > 0` and `amount <= courtBalance`, writes to `db.transfers`, throws with user-facing message otherwise
- [X] T007 Update `addManualEntry(amount, description, justification, cashTarget: CashTarget)` and `addManualExit()` store actions to forward the new `cashTarget` argument to `cashService` in `src/store/cashStore.ts`
- [X] T008 Add `transferToAdm(amount: Money, description?: string): Promise<void>` action to `src/store/cashStore.ts` — calls `cashService.createTransfer()`, then `refreshSummary()`; on error shows Toast
- [X] T009 [P] Add `applyCourtCredit(gameId: string, amount: Money): Promise<void>` action to `src/store/cashStore.ts` — creates a `manual_out` transaction with `cashTarget='court'`, updates `game.courtCredit`, calls `refreshSummary()`; validates `amount <= courtBalance`
- [X] T010 [P] Update dual-cash impact calculation in `src/utils/calculations.ts` — add `calculateCashImpactByTarget(players: Player[]): { court: Money; adm: Money }` that sums amounts by `paymentMethod` (`'on_court'` → court, `'pix'` → adm)
- [X] T011 Update `src/services/seed.ts` — add `cashTarget` field to ALL seed transactions (`'court'` for on_court payments, `'adm'` for PIX and manual entries); add `courtCredit` to relevant seed games; bump `SEED_VERSION` to `'3'` to force re-seed in dev

**Checkpoint**: Foundation ready — all store actions updated, types compiled, Dexie v2 migration runs, seed data includes `cashTarget`. User story phases can now begin.

---

## Phase 3: User Story 1 — Dashboard exibe breakdown por caixa (Priority: P1) 🎯 MVP

**Goal**: Dashboard shows total balance prominently and, below it in smaller font, "Quadra: R$ X | ADM: R$ Y" — no navigation required.

**Independent Test**: With seed data (after T011), open the dashboard and verify total balance = courtBalance + admBalance, and both sub-labels are visible with correct values. Verify negative balances render in `brand-red`.

- [X] T012 [P] [US1] Create `CashBreakdown` component in `src/components/dashboard/CashBreakdown.tsx` — props: `courtBalance: Money`, `admBalance: Money`; renders `"Quadra R$ X · ADM R$ Y"` in `text-sm`; highlights each value in `brand-red` when negative
- [X] T013 [US1] Update `src/components/dashboard/CashDisplay.tsx` — read `courtBalance` and `admBalance` from `useCashStore(s => s.summary)`; render `<CashBreakdown>` below the total balance; update the total balance field reference from `currentBalance` → `totalBalance`
- [X] T014 [P] [US1] Update `src/components/cash/TransactionListItem.tsx` — when `transaction.type === 'transfer'` (new type to add to `TransactionType`), display badge "Quadra → ADM" with styles `bg-brand-blue/20 text-brand-blue`; render amount as neutral (no +/- prefix)

**Checkpoint**: US1 complete — dashboard displays dual cash breakdown. Independently releasable.

---

## Phase 4: User Story 2 — Finalização de jogo roteia pagamentos ao caixa correto (Priority: P2)

**Goal**: `finalizeGame()` automatically routes each player's payment to the correct cash drawer based on `paymentMethod`, with no manual intervention.

**Independent Test**: Finalize a game with 2 players paying `'on_court'` (R$ 10 each) and 1 paying `'pix'` (R$ 10). Verify `courtBalance` increases R$ 20 and `admBalance` increases R$ 10.

- [X] T015 [US2] Update `finalizeGame()` in `src/store/gameStore.ts` — for each player, determine `cashTarget`: `player.paymentMethod === 'on_court'` → `'court'`, `'pix'` → `'adm'`; call `createGameTransaction(gameId, playerAmount, description, cashTarget)` per player using the calculation from `calculateCashImpactByTarget()`; replace the existing single-transaction call

**Checkpoint**: US2 complete — game finalization feeds both cash drawers correctly.

---

## Phase 5: User Story 3 — Saque do caixa quadra (Priority: P3)

**Goal**: Manager can withdraw court cash in two modes — transfer to ADM or apply as credit to a pending game — with validation preventing overdraft and history showing the transfer.

**Independent Test**: With `courtBalance = R$ 60`, perform a R$ 60 transfer to ADM. Verify `courtBalance = 0`, `admBalance += R$ 60`, `totalBalance` unchanged, and a transfer record appears in history with "Quadra → ADM" badge.

- [X] T016 [P] [US3] Create `CourtWithdrawModal` in `src/components/cash/CourtWithdrawModal.tsx` — props: `courtBalance`, `negativeGames` (finished games where `cashImpact < 0`), `onClose`, `onTransfer`, `onApplyCredit`; two modes (Transferir para ADM / Abater em jogo); "Abater em jogo" tab is hidden when `negativeGames` is empty; in credit mode validates `amount <= Math.abs(game.cashImpact)`; select lists deficit games showing absolute deficit value; uses Heroicons only
- [X] T017 [US3] Update `src/pages/Dashboard.tsx` — add "Saque Quadra" button (renders only when `courtBalance > 0`); wire button to open `CourtWithdrawModal`; pass `transferToAdm` and `applyCourtCredit` from `useCashStore`; pass `negativeGames` (finished games with `cashImpact < 0`) from `useGameStore`
- [X] T018 [P] [US3] Add `cashTarget` radio selector to `src/components/cash/CashAdjustForm.tsx` — compact toggle below the amount field, options "ADM" (default, pre-selected) and "Quadra"; expose `cashTarget` in form output; update RHF schema to include `cashTarget: z.enum(['court', 'adm']).default('adm')`
- [X] T019 [US3] Update `src/pages/CashAdjust.tsx` — read `cashTarget` from form values; pass it to `useCashStore`'s `addManualEntry(amount, description, justification, cashTarget)` and `addManualExit()` calls

**Checkpoint**: US3 complete — court withdrawal flow fully functional with both transfer and credit modes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case hardening, type consistency, and `TransactionType` enum completeness.

- [X] T020 Add `'transfer'` to `TransactionType` union in `src/types/cash.ts` (used for TransactionListItem badge in T014); ensure Dexie schema and Zod enum are updated to include `'transfer'` as a valid type in `src/schemas/cash.ts`
- [X] T021 Audit all Tailwind class strings in new/changed components (`CashBreakdown`, `CashAdjustForm`, `CourtWithdrawModal`, `TransactionListItem`) — ensure only palette tokens from `theme.config.mjs` are used (`brand-blue`, `brand-green`, `brand-yellow`, `brand-red`, `brand-bg`) with no hardcoded hex values

---

## Dependencies

```
Phase 2 (Foundation)
  └── Phase 3 (US1 Dashboard UI)     ← reads courtBalance/admBalance from store
  └── Phase 4 (US2 Game Routing)     ← calls updated createGameTransaction with cashTarget
  └── Phase 5 (US3 Withdrawal)       ← calls transferToAdm / applyCourtCredit from store
      └── Phase 6 (Polish)
```

US3 (Phase 5) recommends Phase 4 complete first so real game data is present during manual testing, but it is independently testable with seed data.

---

## Parallel Execution Examples

### Foundation (Phase 2) — after T001-T005 complete

```
T006 (createTransfer)        ← parallel
T009 (applyCourtCredit)      ← parallel
T010 (calculateCashImpact)   ← parallel
```

### US1 (Phase 3) — after Phase 2 complete

```
T012 (CashBreakdown component)   ← parallel
T014 (TransactionListItem badge) ← parallel
```
Then: T013 (CashDisplay integration)

### US3 (Phase 5) — after Phase 2 + Phase 4 complete

```
T016 (CourtWithdrawModal)   ← parallel
T018 (CashAdjustForm radio) ← parallel
```
Then: T017 (Dashboard button), T019 (CashAdjust page)

---

## Implementation Strategy

**MVP Scope**: Phase 2 + Phase 3 (US1) — user can see the dual cash breakdown on the dashboard with seed/real data. Delivers the highest-priority visible value (SC-001) in the fewest tasks.

**Incremental delivery**:
1. **Phase 2 alone**: App still works (migration is non-destructive; all balances show in admBalance)
2. **Phase 2 + 3**: Dashboard breakdown visible ← MVP ✅
3. **+ Phase 4**: New games populate both drawers correctly
4. **+ Phase 5**: Full withdrawal feature complete
5. **+ Phase 6**: Polish and edge cases sealed

**Start here**: T001 → T002 → T003 → T004 → T005 (sequential), then T006 + T009 + T010 in parallel, then T007 → T008 → T011.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 21 |
| Phase 2 (Foundation) | 11 tasks |
| Phase 3 (US1 — Dashboard) | 3 tasks |
| Phase 4 (US2 — Game Routing) | 1 task |
| Phase 5 (US3 — Withdrawal) | 4 tasks |
| Phase 6 (Polish) | 2 tasks |
| Parallelizable tasks | 8 tasks marked [P] |
| User stories covered | 3 (US1 P1, US2 P2, US3 P3) |
| MVP scope | Phase 2 + Phase 3 (14 tasks) |
