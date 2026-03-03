# Implementation Plan: Tela de Login Fake

**Branch**: `003-fake-login-screen` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fake-login-screen/spec.md`

## Summary

Adicionar uma tela de login com credenciais hardcoded (`parceriasdojoguinho` / `futdaquinta`) que protege todas as rotas existentes do app. A sessao e persistida via localStorage. Nenhum backend ou pacote novo e necessario: usa Zustand persist, React Hook Form + Zod e React Router v6, todos ja presentes no projeto.

## Technical Context

**Language/Version**: TypeScript 5.2 / React 18.2
**Primary Dependencies**: Zustand (persist), React Hook Form, Zod, React Router DOM v6, Tailwind CSS v4, Heroicons
**Storage**: localStorage via Zustand persist middleware (auth state only — boolean)
**Testing**: Vitest + React Testing Library (divida tecnica documentada — nao configurado ainda)
**Target Platform**: PWA mobile-first (Chrome/Safari Android, iOS Home Screen)
**Project Type**: web-app / PWA
**Performance Goals**: Login page chunk < 15KB gzipped; redirect em < 1s
**Constraints**: Offline-capable (funcionalidade de login nao depende de rede); nenhum pacote novo
**Scale/Scope**: 1 usuario compartilhado (grupo de futsal); ~5 rotas protegidas

## Constitution Check

| Gate | Status | Nota |
|------|--------|------|
| Mobile-first layout | PASS | Tela de login desenhada mobile-first |
| TypeScript obrigatorio | PASS | Todos os arquivos em .tsx/.ts com tipagem completa |
| RHF + Zod para formularios | PASS | loginSchema com campos obrigatorios |
| Heroicons para icones | PASS | ArrowRightOnRectangleIcon para logout |
| Lazy loading / code splitting | PASS | LoginPage sera lazy-loadada em App.tsx |
| Componentizacao atomica | PASS | Reutiliza Input, Button, Card existentes |
| Dados sensiveis no client-side | EXCEPTION | Credenciais sao intencionalmente fake/hardcoded — sem dados reais em risco. Spec explicitamente autoriza "hard code". Documentado em research.md R-006. |
| Test-First | EXCEPTION | Infraestrutura de testes nao configurada no projeto. Divida tecnica documentada. |

## Project Structure

### Documentation (this feature)

```text
specs/003-fake-login-screen/
  plan.md              <- este arquivo
  research.md          <- decisoes tecnicas (R-001 a R-006)
  data-model.md        <- AuthSession entity, Credentials constants, schema Zod
  quickstart.md        <- como testar manualmente
  contracts/
    ui-components.md   <- contratos de LoginPage, PrivateRoute, Header, App
  checklists/
    requirements.md    <- spec quality checklist
```

### Source Code

```text
src/
  store/
    authStore.ts         [NOVO]   Zustand store: isAuthenticated, login(), logout(), persist
  pages/
    Login.tsx            [NOVO]   Tela de login: logo + formulario RHF+Zod
  components/
    auth/
      PrivateRoute.tsx   [NOVO]   Route guard: redireciona para /login se nao autenticado
    layout/
      Header.tsx         [EDIT]   + botao logout quando onBack e undefined
  App.tsx                [EDIT]   + rota /login; wrap todas as rotas com PrivateRoute
```

## Implementation Phases

### Phase 1: Auth Foundation (prereq de tudo)

**T001** - `src/store/authStore.ts`
- Constantes: `VALID_USERNAME = 'parceriasdojoguinho'`, `VALID_PASSWORD = 'futdaquinta'`
- State: `{ isAuthenticated: boolean }`
- Actions: `login(username, password): boolean` (trim + case-sensitive compare), `logout(): void`
- Persistencia: `persist` middleware, storage `localStorage`, key `'auth-storage'`
- Export: `useAuthStore`

### Phase 2: Route Guard

**T002** - `src/components/auth/PrivateRoute.tsx`
- Le `isAuthenticated` de `useAuthStore`
- `false` → `<Navigate to="/login" replace />`
- `true` → `<>{children}</>`

### Phase 3: Router update

**T003** - `src/App.tsx`
- Importar `LoginPage` lazy: `const LoginPage = lazy(() => import('./pages/Login')...)`
- Adicionar `<Route path="/login" element={<LoginPage />} />` (rota publica)
- Envolver todas as 6 rotas existentes com `<PrivateRoute>`

### Phase 4: Login Page

**T004** - `src/pages/Login.tsx`
- Se `isAuthenticated` → `<Navigate to="/" replace />`
- Zod schema: `username: z.string().min(1)`, `password: z.string().min(1)`
- Logo: nome "Fut da quinta" centralizado com icone de bola (emoji ou Heroicons)
- Formulario: Input usuario, Input senha (type password), Button "Entrar"
- Erro global: `<p role="alert">` "Usuario ou senha invalidos" (visivel apos tentativa falha)
- Loading: `submitting` state durante processamento

### Phase 5: Logout in Header

**T005** - `src/components/layout/Header.tsx`
- Quando `!onBack`: renderizar `<button onClick={handleLogout}>` com `ArrowRightOnRectangleIcon` no canto direito
- `handleLogout`: `authStore.logout()` + `navigate('/login', { replace: true })`
- Acessibilidade: `aria-label="Sair"`

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Credenciais no client-side (Segurança VII) | Login e 100% fake — sem backend, dados nao sao sensiveis de fato | Qualquer solucao com backend estaria fora de escopo da feature |
| Test-First nao aplicado | Infraestrutura de testes nao configurada no projeto | Configurar Vitest esta fora do escopo desta feature |
