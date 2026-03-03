# Data Model: Padronização de Layout e Consistência de Tema

**Feature**: 004-theme-consistency  
**Date**: 2026-03-03

---

## Nenhuma entidade nova

Esta feature não introduz novas entidades de dados, não altera schemas existentes e não modifica nenhuma camada de serviço ou store.

A mudança é exclusivamente na camada de apresentação (UI styling): substituição de um token de cor Tailwind CSS off-brand por um token da paleta oficial do tema.

---

## Token de Design afetado

O conceito "token de design" abaixo representa a convenção de cor semântica, não uma entidade persistida.

### Cor Semântica: Valor Negativo / Perigo

| Propriedade | Valor |
|-------------|-------|
| **Nome semântico** | Negativo / Perigo |
| **Token oficial** | `brand-red` |
| **Hex** | `#ff6a5a` |
| **Definido em** | `src/index.css` (`--color-brand-red`) e `theme.config.mjs` (`colorDanger`) |
| **Uso correto** | `text-brand-red`, `bg-brand-red`, `border-brand-red` |
| **Uso incorreto (corrigir)** | `text-red-600` (Tailwind built-in, cor diferente) |

### Mapa completo de cores semânticas (referência)

| Semântica | Token Tailwind | Hex | Uso |
|-----------|---------------|-----|-----|
| Primário / Ativo | `brand-blue` | `#272d4d` | Header, BottomNav ativo, botões primários |
| Positivo / Sucesso | `brand-green` | `#35997e` | Valores positivos, jogos concluídos |
| Negativo / Perigo | `brand-red` | `#ff6a5a` | Valores negativos, alertas de erro |
| Pendente / Atenção | `brand-yellow` | `#ffb350` | Pagamento "Na Quadra", status pendente |
| Texto principal | `brand-gray-dark` | `#1F2937` | Texto de conteúdo, labels |
| Fundo de cards | `brand-gray-light` | `#F3F4F6` | Backgrounds secundários |
| Fundo geral | `brand-bg` | `#F5F6F8` | Fundo da aplicação |
