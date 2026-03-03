# Implementation Plan: Padronização de Layout e Consistência de Tema

**Branch**: `004-theme-consistency` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-theme-consistency/spec.md`

## Summary

Corrigir a inconsistência de cores semânticas no app: o único bug confirmado é `text-red-600` (vermelho padrão do Tailwind) em `TransactionListItem` para valores negativos — deve ser `text-brand-red` (coral `#ff6a5a`). Auditoria completa do código fonte confirma que todos os demais componentes já usam os tokens do tema corretamente. A mudança é cirúrgica: um único arquivo, uma única classe CSS.

## Technical Context

**Language/Version**: TypeScript 5.2 / React 18.2  
**Primary Dependencies**: Tailwind CSS v4 (tokens via `@theme` em `src/index.css`), Heroicons  
**Storage**: N/A — nenhuma mudança de dados  
**Testing**: Vitest + React Testing Library (infraestrutura não configurada — dívida técnica existente)  
**Target Platform**: PWA mobile-first (Chrome/Safari/Android, iOS Home Screen)  
**Project Type**: web-app / PWA  
**Performance Goals**: Zero impacto — troca de classe utilitária Tailwind  
**Constraints**: Nenhum pacote novo; escopo restrito a correções de token de cor  
**Scale/Scope**: 1 arquivo a modificar confirmado; ~15 componentes auditados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Nota |
|------|--------|------|
| Mobile-first layout | PASS | Nenhuma mudança de layout |
| TypeScript obrigatório | PASS | Apenas troca de string de classe CSS |
| Heroicons para ícones | PASS | Nenhum ícone novo |
| Componentização atômica | PASS | Corrige token em componente existente |
| Acessibilidade — contraste WCAG AA | PASS | `brand-red #ff6a5a` já é usado em badges e alertas — mesmo perfil de contraste que o estado atual; não é regressão |
| Performance-First | PASS | Troca de classe utilitária sem impacto em bundle |
| Test-First | EXCEPTION | Infraestrutura de testes não configurada no projeto (dívida técnica pré-existente, documentada em features 001–003) |

## Project Structure

### Documentation (this feature)

```text
specs/004-theme-consistency/
  plan.md              <- este arquivo
  research.md          <- auditoria de todos os componentes com uso de cores
  data-model.md        <- N/A (sem mudança de dados — documentado)
  quickstart.md        <- como implementar e verificar manualmente
  contracts/
    ui-components.md   <- contrato do componente TransactionListItem corrigido
  checklists/
    requirements.md    <- spec quality checklist (existente)
```

### Source Code

```text
src/
  components/
    cash/
      TransactionListItem.tsx   [EDIT]   text-red-600 → text-brand-red (linha 74)
```

## Implementation Phases

### Phase 1 — Corrigir bug confirmado (P1)

Único arquivo, única linha. Corrige o problema explicitamente identificado pelo usuário.

**T001** — `src/components/cash/TransactionListItem.tsx`  
- Linha 74: substituir `'text-red-600'` por `'text-brand-red'` na expressão ternária de cor do valor negativo.  
- Antes: `isPositive ? 'text-brand-green' : 'text-red-600'`  
- Depois: `isPositive ? 'text-brand-green' : 'text-brand-red'`  
- Validação: abrir a lista de movimentações e confirmar que o valor negativo tem a mesma tonalidade coral do badge "Saída" na mesma linha.

---

### Phase 2 — Auditoria de consistência geral (P2)

Confirmação formal de que nenhum outro componente tem uso de cor off-brand para indicadores semânticos. A auditoria já foi realizada durante `/speckit.specify` e não encontrou outros problemas. Esta fase documenta o resultado e fecha o escopo.

**T002** — Auditoria de código (busca global)  
- Executar busca por `text-red-`, `text-green-`, `text-yellow-`, `text-blue-`, `bg-red-`, `bg-green-`, `bg-yellow-`, `bg-blue-` em `src/**/*.tsx`.  
- Resultado esperado: zero matches após a correção T001 para cores fora do tema com significado semântico.  
- Cinzas (`text-gray-*`, `bg-gray-*`) são aceitos — semanticamente neutros.

**T003** — Verificação visual em todas as telas  
- Dashboard: saldo negativo em `text-brand-red`, saldo positivo em `text-brand-green` ✅  
- Histórico de Jogos: impacto financeiro em `text-brand-red`/`text-brand-green` ✅  
- Lista de Movimentações: valores negativos, após T001, em `text-brand-red` ✅  
- Detalhe do Jogo: textos secundários em cinza neutro ✅  
- Criar Jogo: textos de instrução em cinza neutro ✅  
- Ajuste de Caixa: nenhum indicador de cor semântica ✅

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Test-First não aplicado | Infraestrutura de testes não configurada no projeto | Configurar Vitest está fora do escopo desta feature — dívida técnica pré-existente |
