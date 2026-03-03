# Data Model: Tela de Login Fake

**Feature**: 003-fake-login-screen  
**Date**: 2026-03-03

---

## Entities

### AuthSession

Representa o estado de autenticação do usuário na sessão atual.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `isAuthenticated` | `boolean` | `true` se o usuário fez login com as credenciais corretas nesta sessão |

**Persistência**: `localStorage` via Zustand `persist` middleware, chave `'auth-storage'`.

**Estado inicial**: `{ isAuthenticated: false }` — sempre falso ao inicializar pela primeira vez.

**Transições de estado**:

```
[não autenticado] --login(user, pass) válido--> [autenticado]
[autenticado]     --logout()--> [não autenticado]
[qualquer]        --reload da página--> [lê localStorage, restaura estado anterior]
```

---

### Credentials (constantes, sem persistência)

Valores fixos armazenados como constantes no `authStore`. Não são persistidos, não são configuráveis em runtime.

| Campo | Valor |
|-------|-------|
| `VALID_USERNAME` | `'parceriasdojoguinho'` |
| `VALID_PASSWORD` | `'futdaquinta'` |

**Regras de validação**:
- Comparação sensível a maiúsculas/minúsculas (case-sensitive).
- Espaços nas bordas removidos via `trim()` antes da comparação.
- Ambos os campos obrigatórios (não podem estar vazios).

---

## Store Interface

```typescript
interface AuthState {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean  // retorna true se sucesso
  logout: () => void
}
```

**Nota**: `login()` retorna `boolean` sincronamente — não há chamada assíncrona, sem `Promise`. O chamador (página de login) usa o retorno para exibir ou não o erro.

---

## Validação — Schema Zod (formulário)

```typescript
// Valida apenas que os campos não estão vazios
// A verificação de credenciais corretas ocorre no onSubmit
const loginSchema = z.object({
  username: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type LoginFormData = z.infer<typeof loginSchema>
```

---

## Fluxo de dados

```
User submits form
  └─> Zod valida campos não-vazios
        ├─ falha → exibe erros de campo (username/password required)
        └─ sucesso → authStore.login(username.trim(), password.trim())
                          ├─ credenciais corretas → isAuthenticated = true → navigate('/')
                          └─ credenciais erradas  → setFormError('Usuário ou senha inválidos')
```
