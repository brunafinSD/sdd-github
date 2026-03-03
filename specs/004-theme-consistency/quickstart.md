# Quickstart: Padronização de Layout e Consistência de Tema

**Feature**: 004-theme-consistency  
**Date**: 2026-03-03

---

## Visão Geral

Feature de correção cirúrgica: um único arquivo, uma única linha. Substitui `text-red-600` por `text-brand-red` em `TransactionListItem.tsx` para garantir que valores negativos na lista de movimentações usem o coral oficial do tema.

---

## Arquivos a modificar

| Arquivo | Mudança | Linha |
|---------|---------|-------|
| `src/components/cash/TransactionListItem.tsx` | `text-red-600` → `text-brand-red` | 74 |

## Arquivos a criar

Nenhum.

---

## Fluxo de implementação

```
Phase 1 — Corrigir bug (P1)
  T001: Editar TransactionListItem.tsx linha 74
        'text-red-600' → 'text-brand-red'

Phase 2 — Auditoria (P2)
  T002: Busca global por classes off-brand (confirmar zero matches semânticos)
  T003: Verificação visual em todas as telas
```

---

## Como fazer a mudança

### Phase 1 — T001

Abra `src/components/cash/TransactionListItem.tsx` e localize:

```tsx
: isPositive ? 'text-brand-green' : 'text-red-600'
```

Substitua por:

```tsx
: isPositive ? 'text-brand-green' : 'text-brand-red'
```

### Phase 2 — T002

Execute a busca no projeto:

```bash
# Deve retornar 0 matches após a correção
grep -r "text-red-\|text-green-\|text-yellow-\|text-blue-\|bg-red-\|bg-green-" src --include="*.tsx"
```

Resultado esperado: nenhum match (as únicas classes com prefixo Tailwind built-in sem semântica são os cinzas, que são neutros e aceitáveis).

---

## Como verificar manualmente

### Verificação da correção (US1)

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Faça login no app.
3. Navegue para **Histórico de Movimentações** (ícone de lista na nav inferior).
4. Localize uma movimentação com valor negativo (saída ou jogo com débito).
5. Compare visualmente a cor do valor (ex.: `-R$ 30,00`) com a cor do badge "Saída" ou "Jogo" da mesma linha.
6. **Esperado**: ambos exibem o mesmo coral (`#ff6a5a`) — indistinguíveis visualmente.

### Verificação da consistência geral (US2)

| Tela | O que verificar | Esperado |
|------|----------------|----------|
| Dashboard | Saldo negativo | Coral `brand-red` |
| Dashboard | Saldo positivo | Verde `brand-green` |
| Histórico de Jogos | Impacto financeiro negativo | Coral `brand-red` |
| Histórico de Movimentações | Valor negativo | Coral `brand-red` (após T001) |
| Histórico de Movimentações | Valor positivo | Verde `brand-green` |
| Detalhe do Jogo | Textos auxiliares | Cinza neutro |

---

## Notas

- **Nenhum pacote novo** é necessário.
- **Nenhuma mudança de paleta** — o token `brand-red` já existe e é amplamente utilizado.
- O token `brand-yellow` no `theme.config.mjs` está definido como `#ffb350` (âmbar), porém em `src/index.css` o valor é `#ff9000` (laranja mais saturado). Essa discrepância pré-existente está fora do escopo desta feature, mas pode ser um item de dívida técnica a abordar futuramente.
