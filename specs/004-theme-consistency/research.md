# Research: Padronização de Layout e Consistência de Tema

**Feature**: 004-theme-consistency  
**Date**: 2026-03-03

---

## R-001: Auditoria completa de uso de cores nos componentes

**Question**: Além do `text-red-600` em `TransactionListItem`, existem outros usos de cores fora da paleta do tema para indicadores semânticos?

**Method**: Busca global por padrões `text-red-`, `text-green-`, `text-yellow-`, `text-blue-`, `bg-red-`, `bg-green-`, `bg-yellow-`, `bg-blue-` em `src/**/*.tsx`.

**Findings** (resultado da busca com 1 match):

| Arquivo | Linha | Classe off-brand | Contexto | Ação |
|---------|-------|-----------------|----------|------|
| `src/components/cash/TransactionListItem.tsx` | 74 | `text-red-600` | Cor do valor negativo na lista de movimentações | **CORRIGIR** → `text-brand-red` |

**Todos os demais componentes** usam corretamente os tokens do tema:

| Componente | Cor semântica usada | Token correto? |
|-----------|--------------------|-|
| `CashDisplay.tsx` | Saldo negativo → `text-brand-red`; positivo → `text-brand-green` | ✅ |
| `CashBreakdown.tsx` | Negativo → `text-brand-red`; neutro → `text-gray-400` | ✅ |
| `GameCard.tsx` | Impacto negativo → `text-brand-red`; positivo → `text-brand-green` | ✅ |
| `GameHistory.tsx` | Impacto negativo → `text-brand-red`; positivo → `text-brand-green` | ✅ |
| `Badge.tsx` | `danger` → `text-brand-red`; `success` → `text-brand-green`; `warning` → `text-brand-yellow`; `info` → `text-brand-blue` | ✅ |
| `PlayerRow.tsx` | `pix` ativo → `bg-brand-blue`; `on_court` ativo → `bg-brand-yellow` | ✅ |
| `BottomNav.tsx` | Ativo → `text-brand-blue`; inativo → `text-gray-500` | ✅ |
| `Header.tsx` | `bg-brand-blue` | ✅ |

**Decision**: Corrigir exclusivamente `TransactionListItem.tsx` linha 74.

**Rationale**: A auditoria confirma que é o único desvio. Os cinzas (`text-gray-*`, `bg-gray-*`) são semanticamente neutros (texto auxiliar, bordas, estados hover) — aceitáveis por convenção do design system.

**Alternatives considered**:
- Extrair todas as cores para um mapa centralizado em `TransactionListItem`: desnecessário para uma correção de uma linha.
- Criar utilitário `getAmountColor(amount)` compartilhado: útil apenas se a mesma lógica for repetida em múltiplos lugares — não é o caso atual.

---

## R-002: Impacto em acessibilidade (contraste WCAG)

**Question**: Trocar `text-red-600` (`#dc2626`) por `text-brand-red` (`#ff6a5a`) piora o contraste em algum contexto?

**Decision**: A troca é neutra em termos de regressão de acessibilidade.

**Rationale**:
- `#ff6a5a` (brand-red) já é usado extensivamente no app: badges `danger`, alertas de saldo negativo, `CashDisplay` — todos foram aceitos como parte da paleta aprovada.
- A feature não altera a paleta; apenas garante sua aplicação uniforme.
- Avaliar contraste `#ff6a5a` no fundo branco: ratio ~3.0:1 — abaixo de WCAG AA (4.5:1) para texto normal. **Porém essa limitação é pré-existente e igual em ambos os tokens** — `text-red-600` (#dc2626) sobre branco tem ratio ~5.9:1, o que significa que a troca **reduz** o contraste dessa classe específica.

**NOTA**: A limitação de contraste do `brand-red` com fundo branco é uma dívida técnica de acessibilidade que já existe em todas as outras ocorrências do token no app (badges, alertas). Está fora do escopo desta feature resolvê-la — seria uma mudança de paleta, não de consistência.

**Alternatives considered**:
- Usar `text-red-600` como padrão (manter inconsistência): descartado — piora a coerência visual sem ganho real de acessibilidade para o conjunto do app.
- Trocar `brand-red` por uma cor com maior contraste: fora de escopo — mudança de paleta.

---

## R-003: Consistência de estados hover/interativos entre listas clicáveis

**Question**: Existe inconsistência nos estados hover entre `TransactionListItem` (lista de movimentações) e a lista de jogos em `GameHistory`?

**Decision**: Ambos usam `hover:bg-gray-50` — consistentes. Nenhuma correção necessária.

**Findings**:
- `TransactionListItem.tsx`: `hover:bg-gray-50` (quando `isClickable`)
- `GameHistory.tsx` (li element): `hover:bg-gray-50`

**Rationale**: Comportamento de hover é idêntico — FR-006 atendido sem modificação.
