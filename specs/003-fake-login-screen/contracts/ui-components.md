# UI Contracts: Tela de Login Fake

**Feature**: 003-fake-login-screen  
**Date**: 2026-03-03

---

## Novos componentes

### `<LoginPage />` — `src/pages/Login.tsx`

Página pública de login. Não recebe props — lê do `useAuthStore` e usa `useNavigate`.

**Layout (mobile-first)**:
```
┌─────────────────────────────┐
│  [fundo brand-bg]           │
│                             │
│    ⚽  Fut da quinta        │  ← logo textual, centralizado
│    [subtítulo sutil]        │
│                             │
│  ┌─────────────────────┐   │
│  │ Card branco         │   │
│  │                     │   │
│  │ Usuário             │   │
│  │ [input]             │   │
│  │                     │   │
│  │ Senha               │   │
│  │ [input type=pass]   │   │
│  │                     │   │
│  │ [msg erro global]   │   │  ← visível apenas após tentativa falha
│  │                     │   │
│  │ [btn Entrar]        │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Behavior**:
- Se `isAuthenticated === true` ao montar → `<Navigate to="/" replace />` imediatamente.
- Ao submeter: chama `authStore.login(username.trim(), password.trim())`.
  - Retorno `true` → `navigate('/', { replace: true })`.
  - Retorno `false` → exibe erro genérico "Usuário ou senha inválidos" no formulário.
- Loading state: botão desabilitado durante processamento (síncrono mas pode ter micro-delay para UX).

**Componentes usados**: `Input`, `Button`, `Card` (todos existentes).

---

### `<PrivateRoute />` — `src/components/auth/PrivateRoute.tsx`

Guard wrapper para rotas protegidas.

```typescript
interface PrivateRouteProps {
  children: React.ReactNode
}
```

**Behavior**:
- Lê `isAuthenticated` de `useAuthStore`.
- `isAuthenticated === false` → `<Navigate to="/login" replace />`.
- `isAuthenticated === true` → renderiza `children`.

**Uso em `App.tsx`**:
```tsx
<Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
// ... todas as outras rotas existentes
```

---

## Componentes modificados

### `<Header />` — `src/components/layout/Header.tsx`

**Mudança**: Adicionar botão de logout no canto direito, visível apenas quando não há `onBack` (i.e., na tela inicial / Dashboard).

**Props existentes sem mudança**:
```typescript
interface HeaderProps {
  title?: string
  onBack?: () => void
  children?: React.ReactNode
}
```

**Nova behavior**:
- Quando `onBack` é `undefined`: exibe botão de logout (ícone `ArrowRightOnRectangleIcon` de `@heroicons/react/24/outline`) no lado direito.
- Ao clicar: `authStore.logout()` → `navigate('/login', { replace: true })`.
- Quando `onBack` está definido: comportamento atual sem mudança (sem botão logout).

---

### `App.tsx` — `src/App.tsx`

**Mudanças**:
1. Adicionar rota `/login` → `<LoginPage />` (pública, sem PrivateRoute).
2. Envolver todas as rotas existentes com `<PrivateRoute>`.
3. Lazy-load `LoginPage`.

**Estrutura após mudança**:
```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/"                     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  <Route path="/game/new"             element={<PrivateRoute><GameCreate /></PrivateRoute>} />
  <Route path="/game/:id"             element={<PrivateRoute><GameDetail /></PrivateRoute>} />
  <Route path="/cash/adjust"          element={<PrivateRoute><CashAdjust /></PrivateRoute>} />
  <Route path="/history/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
  <Route path="/history/games"        element={<PrivateRoute><GameHistory /></PrivateRoute>} />
</Routes>
```

---

## Novo store

### `useAuthStore` — `src/store/authStore.ts`

```typescript
// Interface pública do store
interface AuthState {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

// Credenciais (constantes no mesmo arquivo)
const VALID_USERNAME = 'parceriasdojoguinho'
const VALID_PASSWORD = 'futdaquinta'
```

**Persistência**: Zustand `persist` middleware com `localStorage`, chave `'auth-storage'`.
