---
description: "Implementation tasks for Tela de Login Fake"
---

# Tasks: Tela de Login Fake

**Input**: Design documents from `/specs/003-fake-login-screen/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ui-components.md ✅ quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- All file paths are exact and relative to repo root

---

## Phase 1: Setup

**Purpose**: Create directory structure for new auth components — no packages to install.

- [X] T001 Create directory `src/components/auth/` (created implicitly when T003 file is added — serves as explicit checkpoint)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: `authStore` is the single source of truth for auth state and credentials. ALL user story tasks depend on this.

**⚠️ CRITICAL**: T002 must be complete before T003, T004, T005, T006 can begin.

- [X] T002 Create `src/store/authStore.ts` — Zustand store with `persist` middleware (localStorage key `'auth-storage'`); hardcoded constants `VALID_USERNAME = 'parceriasdojoguinho'` and `VALID_PASSWORD = 'futdaquinta'`; state `{ isAuthenticated: boolean }`; action `login(username, password): boolean` — trims both inputs, compares case-sensitively, sets `isAuthenticated = true` on match and returns `true`, otherwise returns `false`; action `logout(): void` — sets `isAuthenticated = false`; export `useAuthStore`

**Checkpoint**: `useAuthStore` available and persisting to localStorage — all US tasks can now begin in parallel.

---

## Phase 3: User Story 1 — Acesso com credenciais corretas (P1) 🎯 MVP

**Goal**: Usuário não autenticado é bloqueado e redirecionado para `/login`; ao inserir credenciais corretas é levado ao Dashboard e todas as rotas ficam acessíveis.

**Independent Test**:
1. Abrir `http://localhost:5173` sem login → deve ir para `/login`.
2. Tentar acessar `/history/games` diretamente → deve ir para `/login`.
3. Inserir `parceriasdojoguinho` / `futdaquinta` → deve ir para o Dashboard.
4. Com login feito, tentar acessar `/login` diretamente → deve ir para o Dashboard.

### Implementação — User Story 1

- [X] T003 [P] [US1] Create `src/components/auth/PrivateRoute.tsx` — reads `isAuthenticated` from `useAuthStore`; if `false` returns `<Navigate to="/login" replace />`; if `true` renders `children`; props: `{ children: React.ReactNode }`
- [X] T004 [P] [US1] Create `src/pages/Login.tsx` — if `isAuthenticated` mount-time check → `<Navigate to="/" replace />`; Zod schema `loginSchema` with `username: z.string().min(1, 'Usuário obrigatório')` and `password: z.string().min(1, 'Senha obrigatória')`; RHF `useForm<LoginFormData>`; logo section: centered "Fut da quinta" title (`text-4xl font-bold text-brand-blue`) + subtitle "Gestão do fut da quinta" (`text-sm text-gray-400`); Card with form containing `<Input label="Usuário" ...register('username')>` and `<Input label="Senha" type="password" ...register('password')>`; `onSubmit`: trim both fields, call `authStore.login()`, on `true` → `navigate('/', { replace: true })`, on `false` → set `formError` state with `"Usuário ou senha inválidos"`; `<p role="alert">` showing `formError` when set (`text-sm text-brand-red bg-brand-red/10` rounded); `<Button type="submit" fullWidth disabled={submitting}>Entrar</Button>`; clears `formError` on any input change via `watch`; mobile-first, full-screen `min-h-screen bg-brand-gray-light flex flex-col items-center justify-center p-6`
- [X] T005 [US1] Update `src/App.tsx` — lazy-import `LoginPage`: `const LoginPage = lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })))`; add `<Route path="/login" element={<LoginPage />} />` as **public** route (no PrivateRoute); wrap all 6 existing routes with `<PrivateRoute>`: Dashboard, GameCreate, GameDetail, CashAdjust, TransactionHistory, GameHistory; import `PrivateRoute` from `@/components/auth/PrivateRoute` (depends on T003 and T004 being created first)

**Checkpoint**: US1 fully functional — app bloqueia acesso sem login e permite acesso com credenciais corretas.

---

## Phase 4: User Story 2 — Tentativa com credenciais erradas (P2)

**Goal**: Credenciais inválidas resultam em mensagem de erro genérica; usuário permanece na tela de login; nenhum campo específico é revelado.

**Independent Test**:
1. Na tela de login, inserir `usuario_errado` / `senha_errada` → mensagem "Usuário ou senha inválidos" aparece.
2. Inserir credencial certa para usuário mas senha errada → mesma mensagem genérica (não revela qual campo).
3. Deixar campos em branco e clicar Entrar → erros de campo obrigatório (sem chamar `authStore.login()`).
4. Após erro, corrigir credenciais → acesso concedido normalmente.

> **Nota de implementação**: Esta user story é coberta inteiramente por **T004** (`Login.tsx`) que já implementa `formError`, `role="alert"`, validação Zod de campos obrigatórios, e erro genérico sem discriminar qual campo falhou. Nenhuma tarefa de implementação adicional necessária.

---

## Phase 5: User Story 3 — Sessão persistida entre recarregamentos (P3)

**Goal**: Sessão autenticada sobrevive a recarregamentos de página; logout encerra a sessão e protege todas as rotas.

**Independent Test**:
1. Fazer login → recarregar (F5) → Dashboard aparece diretamente (sem passar por `/login`).
2. Clicar no botão logout no header do Dashboard → vai para `/login`.
3. Após logout, tentar acessar `http://localhost:5173/` → redireciona para `/login`.

> **Nota de implementação**: A persistência via `localStorage` já está implementada em **T002** (`authStore` com `persist` middleware). A única tarefa restante nesta fase é o botão de logout no `Header`.

### Implementação — User Story 3

- [X] T006 [US3] Update `src/components/layout/Header.tsx` — when `onBack` is `undefined`: render `<button>` in the right slot of the header with `ArrowRightOnRectangleIcon` (`24/outline`, `className="w-5 h-5"`) from `@heroicons/react/24/outline`; `aria-label="Sair"`; `onClick`: calls `useAuthStore.getState().logout()` then `navigate('/login', { replace: true })`; button styled `text-gray-400 hover:text-brand-red transition-colors p-1`; when `onBack` is defined: existing back-button behavior unchanged, no logout button rendered

**Checkpoint**: Todas as 3 user stories funcionais e independentemente testáveis.

---

## Phase Final: Polish & Verificação

**Purpose**: Build + smoke test cross-cutting — garantir que nenhuma rota existente quebrou.

- [X] T007 Run `npm run build` and verify zero TypeScript errors; manually smoke-test: (a) unauthenticated redirect on all 6 routes, (b) login success, (c) reload persistence, (d) logout flow, (e) `/login` redirect when already authenticated

---

## Dependencies

```
T001 (dir setup)
  └─> T002 authStore ← FOUNDATIONAL (blocks all US tasks)
        ├─> T003 [P] PrivateRoute ──┐
        ├─> T004 [P] Login.tsx      ├─> T005 App.tsx ──> T006 Header ──> T007
        └─> (persist) ─────────────┘
```

**User story completion order**:
- US1 (MVP): T002 → T003 + T004 (parallel) → T005
- US2: covered by T004 (no extra tasks)
- US3: T002 (persist, foundational) + T006 (logout)

## Parallel Execution Examples

### US1 sprint (after T002 done)

```
Worker A: T003 PrivateRoute.tsx      (~10 min)
Worker B: T004 Login.tsx             (~25 min)
Then:     T005 App.tsx               (~10 min, after A+B)
```

### US3 sprint

```
Worker: T006 Header.tsx              (~10 min, independent of T003/T004/T005)
```

## Implementation Strategy

| Scope | Tasks | Value delivered |
|-------|-------|----------------|
| **MVP** (US1 only) | T001–T005 | App completamente protegido; login funcional |
| **+ US2** | (já em T004) | Feedback de erro para credenciais inválidas |
| **Completo** | + T006, T007 | Logout + persistência + verificação de build |
