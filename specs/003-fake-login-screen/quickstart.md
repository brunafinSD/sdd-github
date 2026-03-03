# Quickstart: Tela de Login Fake

**Feature**: 003-fake-login-screen  
**Date**: 2026-03-03

---

## Visão Geral

Esta feature adiciona uma tela de login fake ao app Fut da quinta. As credenciais são fixas e hardcoded. Não há backend — a validação ocorre inteiramente no client-side.

**Credenciais válidas**:
| Campo | Valor |
|-------|-------|
| Usuário | `parceriasdojoguinho` |
| Senha | `futdaquinta` |

---

## Arquivos a criar

| Arquivo | Descrição |
|---------|-----------|
| `src/store/authStore.ts` | Zustand store com `isAuthenticated`, `login()`, `logout()` + persist |
| `src/pages/Login.tsx` | Página de login (logo + formulário RHF+Zod) |
| `src/components/auth/PrivateRoute.tsx` | Guard wrapper para rotas protegidas |

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/login` + envolver rotas existentes com `<PrivateRoute>` |
| `src/components/layout/Header.tsx` | Adicionar botão logout quando `onBack` é undefined |

---

## Fluxo de implementação recomendado

```
T001 authStore (store + persist + login + logout)
  ↓
T002 PrivateRoute (guarda de rota)
  ↓
T003 App.tsx (rota /login + wrap routes)
  ↓
T004 Login.tsx (página com logo + formulário)
  ↓
T005 Header.tsx (botão logout)
```

---

## Como testar manualmente

### US1 — Acesso com credenciais corretas
1. Abra o app em `http://localhost:5173` sem login.
2. Verifique que é redirecionado para `/login`.
3. Digite `parceriasdojoguinho` / `futdaquinta`.
4. Clique em "Entrar".
5. Verifique que o Dashboard aparece.

### US2 — Credenciais erradas
1. Na tela de login, digite qualquer combinação incorreta.
2. Clique em "Entrar".
3. Verifique a mensagem "Usuário ou senha inválidos" — sem indicar qual campo.
4. Verifique que nenhuma rota interna ficou acessível.

### US3 — Sessão persistida
1. Faça login normalmente.
2. Pressione F5 (recarregar).
3. Verifique que o Dashboard aparece diretamente (sem passar pela tela de login).

### Logout
1. No Dashboard, clique no ícone de logout (canto superior direito do header).
2. Verifique que é redirecionado para `/login`.
3. Tente acessar `http://localhost:5173/` diretamente — deve redirecionar para `/login`.

### Campos vazios
1. Na tela de login, deixe os campos vazios e clique em "Entrar".
2. Verifique que mensagens de validação aparecem nos campos, sem chamar o login.

### Redirect de rota autenticada para /login
1. Sem estar logado, tente acessar `http://localhost:5173/history/games`.
2. Verifique que é redirecionado para `/login`.

---

## Dependências

Nenhum pacote novo necessário. Todos já presentes:
- `zustand` (com `persist` middleware embutido via `zustand/middleware`)
- `react-hook-form`
- `zod`
- `react-router-dom`
- `@heroicons/react`
