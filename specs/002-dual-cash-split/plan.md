# Implementation Plan: Caixas Separados — Quadra e ADM

**Branch**: `002-dual-cash-split` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-dual-cash-split/spec.md`

---

## Summary

Dividir o caixa único em dois sub-caixas independentes — **Caixa Quadra** (pagamentos físicos "Na Quadra") e **Caixa ADM** (PIX, entradas manuais, transferências) — preservando todos os dados existentes via migração não-destrutiva de schema (Dexie v2). O dashboard passa a exibir o saldo total em destaque e o breakdown Quadra/ADM em fonte menor. Ao finalizar um jogo, os valores são roteados automaticamente ao caixa correto pelo método de pagamento de cada jogador. O gestor pode "sacar" o caixa quadra transferindo para ADM ou abatendo no custo de um jogo pendente.

---

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18.2  
**Primary Dependencies**: Zustand (estado), Dexie v3 (IndexedDB), React Hook Form + Zod (formulários), Tailwind CSS v4, Heroicons  
**Storage**: IndexedDB via Dexie — migração de schema com `version(2)` + `.upgrade()`  
**Testing**: Vitest + React Testing Library  
**Target Platform**: PWA — iOS Safari + Android Chrome  
**Project Type**: SPA mobile-first PWA responsiva  
**Performance Goals**: Lighthouse ≥ 90; LCP < 2.5s  
**Constraints**: Offline-capable; dados existentes não podem ser apagados na migração; bundle JS < 170 kB gzipped  
**Scale/Scope**: Single-user; dezenas de transações por mês

---

## Constitution Check

| Princípio | Status | Notas |
|-----------|--------|-------|
| Mobile-First | ✅ PASS | `CourtWithdrawModal` e seletor de caixa projetados para toque |
| PWA | ✅ PASS | Sem impacto no manifest/service worker |
| Performance-First | ✅ PASS | Índice `cashTarget` em Dexie evita full scan; lazy loading mantido |
| Test-First | ⚠️ ATENÇÃO | Lógica de roteamento de pagamentos e cálculo de saldo dual são críticos → cobertura ≥ 80% obrigatória em `cashService.ts` e `calculations.ts` |
| Componentização & Type Safety | ✅ PASS | `CashTarget` tipado; novos componentes atômicos (`CashBreakdown`, `CourtWithdrawModal`) |
| Acessibilidade | ✅ PASS | Modal com focus trap; radio buttons com labels; ARIA live region no saldo |
| Segurança | ✅ PASS | Dados locais; sem nova superfície de ataque |

**Resultado**: APROVADO para implementação. Nenhuma violação.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-dual-cash-split/
├── plan.md              ← este arquivo
├── research.md          ✅ gerado
├── data-model.md        ✅ gerado
├── quickstart.md        ✅ gerado
├── contracts/
│   └── ui-components.md ✅ gerado
├── checklists/
│   └── requirements.md  ✅ gerado
└── tasks.md             → gerado por /speckit.tasks (próximo passo)
```

### Source Code — Arquivos afetados

```text
src/
├── types/
│   └── cash.ts                    ← CashTarget, Transfer, cashTarget em Transaction, CashSummary expandido
├── schemas/
│   └── cash.ts                    ← cashTarget no schema Zod
├── services/
│   ├── db.ts                      ← version(2) migration + tabela transfers
│   ├── cashService.ts             ← getCashSummary dual, createTransfer, applyCourtCredit, cashTarget em todas as writes
│   └── seed.ts                    ← seed atualizado com cashTarget e dados de exemplo para ambos os caixas
├── store/
│   ├── cashStore.ts               ← transferToAdm(), applyCourtCredit(), addManualEntry/Exit com cashTarget
│   └── gameStore.ts               ← finalizeGame() roteia por paymentMethod
├── utils/
│   └── calculations.ts            ← calculateCashImpactDual() separando court/adm
├── components/
│   ├── dashboard/
│   │   ├── CashDisplay.tsx        ← exibe courtBalance + admBalance (CashBreakdown)
│   │   └── CashBreakdown.tsx      ← NOVO componente
│   ├── cash/
│   │   ├── CashAdjustForm.tsx     ← seletor cashTarget (radio ADM/Quadra)
│   │   ├── CourtWithdrawModal.tsx ← NOVO componente
│   │   └── TransactionListItem.tsx← badge "Quadra → ADM" para transfers
│   └── layout/
│       └── Header.tsx             ← botão saque quadra (ou no Dashboard diretamente)
└── pages/
    ├── Dashboard.tsx              ← botão "Saque Quadra" quando courtBalance > 0
    └── CashAdjust.tsx             ← passa cashTarget para actions
```

---

## Constitution Check (pós-design)

Após design Phase 1 — sem alterações em relação à verificação inicial. Todos os gates permanecem PASS.

---

## Complexity Tracking

Nenhuma violação identificada — sem preenchimento necessário.

---

## Execution Order

### Fase A — Foundation (bloqueante)

Deve ser completa antes de qualquer UI:

1. `src/types/cash.ts` — `CashTarget`, `Transfer`, atualizar `Transaction` e `CashSummary`
2. `src/services/db.ts` — version(2) migration
3. `src/services/cashService.ts` — cálculo dual de summary, createTransfer, cashTarget nas writes
4. `src/store/cashStore.ts` — novos actions
5. `src/utils/calculations.ts` — cálculo de impacto separado por caixa

### Fase B — Game finalization routing (US2, depende de A)

6. `src/store/gameStore.ts` — `finalizeGame()` roteia por `paymentMethod`
7. `src/services/seed.ts` — dados de seed com `cashTarget` correto

### Fase C — UI (US1, US3, paralelo após A+B)

8. `CashBreakdown.tsx` — novo componente (paralelo)
9. `CashDisplay.tsx` — integra CashBreakdown (paralelo)
10. `CourtWithdrawModal.tsx` — novo componente
11. `CashAdjustForm.tsx` — adiciona seletor cashTarget
12. `TransactionListItem.tsx` — badge de transferência
13. `Dashboard.tsx` — botão saque quadra + modal
14. `CashAdjust.tsx` — passa cashTarget
