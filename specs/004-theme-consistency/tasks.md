# Tasks: Padronização de Layout e Consistência de Tema

**Input**: Design documents from `/specs/004-theme-consistency/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-components.md ✅, quickstart.md ✅

**Tests**: Não solicitados — dívida técnica pré-existente (infraestrutura Vitest não configurada).

**Escopo**: 1 arquivo a modificar (bug confirmado por auditoria). 2 histórias de usuário. Zero novas dependências.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: Qual história de usuário pertence (US1, US2)
- Caminhos exatos de arquivo incluídos nas descrições

---

## Phase 1: User Story 1 - Cores semânticas na lista de movimentações (Priority: P1) 🎯 MVP

**Goal**: Substituir `text-red-600` (vermelho Tailwind built-in, `#dc2626`) por `text-brand-red` (token oficial do tema, `#ff6a5a`) na expressão ternária de cor do valor negativo em `TransactionListItem`.

**Independent Test**: Navegar ao Histórico de Movimentações, localizar qualquer movimentação negativa (saída ou jogo com débito) e confirmar visualmente que a cor do valor é idêntica ao coral do badge "Saída" (`variant="danger"`) exibido na mesma linha — indistinguíveis entre si.

### Implementation for User Story 1

- [X] T001 [US1] Substituir `text-red-600` por `text-brand-red` na linha de cor do valor negativo em `src/components/cash/TransactionListItem.tsx`

**Checkpoint**: Abrir Histórico de Movimentações no browser — valor negativo deve exibir coral `#ff6a5a` igual ao badge "Saída" da mesma linha. US1 completa e testável de forma independente.

---

## Phase 2: User Story 2 - Auditoria de consistência geral (Priority: P2)

**Goal**: Confirmar formalmente que nenhum outro componente usa cor off-brand para indicadores semânticos, e verificar visualmente todas as telas do app.

**Independent Test**: Executar busca global por classes Tailwind built-in com semântica de cor (`text-red-*`, `text-green-*`, etc.) em `src/**/*.tsx` e obter zero matches. Complementar com inspeção visual em cada tela.

### Implementation for User Story 2

- [X] T002 [P] [US2] Executar busca global por classes off-brand em `src/**/*.tsx` — esperado: zero matches para `text-red-`, `text-green-`, `text-yellow-`, `text-blue-`, `bg-red-`, `bg-green-`, `bg-yellow-`, `bg-blue-` com significado semântico (cinzas são neutros e aceitos)
- [X] T003 [P] [US2] Verificar visualmente todas as telas: Dashboard (saldo negativo → coral, positivo → verde), Histórico de Jogos (impacto financeiro → tokens corretos), Histórico de Movimentações (valores após T001 → coral/verde), Detalhe do Jogo (textos auxiliares → cinza neutro), Criar Jogo, Ajuste de Caixa

**Checkpoint**: Zero classes off-brand com significado semântico encontradas. Todas as telas conformes com a paleta oficial. US2 completa — consistência de tema verificada em toda a aplicação.

---

## Dependencies (Story Completion Order)

```
US1 (T001)  →  finaliza independentemente
                  ↓
              US2 (T002, T003)  →  paralelos entre si, bloqueados por US1 para os valores de movimentações
```

T002 e T003 podem rodar em paralelo entre si. Ambos dependem de T001 estar completo para que a verificação das movimentações esteja correta.

## Parallel Execution

```
Phase 1:  T001  (único — single file, single line)
Phase 2:  T002 ║ T003  (paralelos — busca de código e verificação visual são independentes)
```

## Implementation Strategy

**MVP**: Apenas Phase 1 (T001) já entrega o valor principal ao usuário — corrige o único bug de cor visível imediatamente.

**Complete**: Phase 1 + Phase 2 fecha formalmente a auditoria e documenta conformidade de toda a codebase.

## Validation Summary

| Critério de Sucesso | Verificado por | Tarefa |
|---------------------|---------------|--------|
| SC-001: valores negativos em coral idêntico em todas as telas | Verificação visual Phase 2 | T003 |
| SC-002: valores positivos em verde idêntico em todas as telas | Verificação visual Phase 2 | T003 |
| SC-003: zero indicadores semânticos fora da paleta | Busca global | T002 |
| SC-004: movimentações e histórico de jogos visualmente coerentes | Verificação visual | T003 |
