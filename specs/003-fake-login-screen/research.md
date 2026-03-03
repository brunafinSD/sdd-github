# Research: Tela de Login Fake

**Feature**: 003-fake-login-screen  
**Date**: 2026-03-03

---

## R-001: Persistência de sessão no client-side

**Question**: Como persistir o estado de autenticação entre recarregamentos sem backend?

**Decision**: `localStorage` com chave simples (`auth_session = '1'`), lido na inicialização do Zustand store via `persist` middleware.

**Rationale**:
- `sessionStorage` é descartado ao fechar a aba — violaria FR-005.
- `localStorage` persiste indefinidamente — sem expiração, conforme Assumption da spec.
- Zustand oferece middleware `persist` com `localStorage` como storage backend: integra diretamente sem boilerplate extra.
- IndexedDB (Dexie, já usado no projeto) seria excessivo para um boolean de sessão.

**Alternatives considered**:
- `sessionStorage`: descartado — não persiste entre recarregamentos/abas fechadas.
- Cookie: funciona, mas requer parsing manual e não se integra nativamente ao Zustand persist.
- Dexie (IndexedDB): disponível no projeto, mas overhead desnecessário para um único boolean.

---

## R-002: Estratégia de proteção de rotas (Route Guard)

**Question**: Como bloquear acesso a rotas sem autenticação no React Router v6?

**Decision**: Componente `PrivateRoute` que lê `isAuthenticated` do `useAuthStore` e redireciona para `/login` se falso; wrap todas as rotas existentes em `App.tsx`.

**Rationale**:
- React Router v6 não tem o conceito de `<PrivateRoute>` nativo, mas o padrão idiomático é um componente wrapper que retorna `<Navigate to="/login" />` quando não autenticado.
- Concentra a lógica de guarda em um único ponto — qualquer nova rota adicionada automaticamente fica protegida ao ser envolvida.
- Alternativa (verificar dentro de cada página) exigiria duplicar lógica em todos os 6 pages existentes.

**Alternatives considered**:
- Verificar em cada página individualmente: descartado — duplicação, propenso a esquecer páginas futuras.
- `loader` do React Router v6.4+: descartado — projeto usa BrowserRouter sem Data Router, migração estaria fora de escopo.

---

## R-003: Armazenamento das credenciais hardcoded

**Question**: Onde colocar as credenciais fixas (`parceriasdojoguinho` / `futdaquinta`)?

**Decision**: Constantes em `src/store/authStore.ts` (mesmo arquivo do store), não em `.env`.

**Rationale**:
- `.env` é para variáveis que variam por ambiente (dev/prod). Credenciais fixas que nunca mudam não se beneficiam de `.env`.
- Manter no store deixa claro que é "fake auth" — qualquer desenvolvedor que abrir o arquivo entende imediatamente o contexto.
- O cliente já sabe que é hardcoded (spec diz "pode ser hard code") — não há falsa sensação de segurança.
- Se um futuro upgrade para auth real for feito, a troca ocorre exclusivamente no `authStore.ts`.

**Alternatives considered**:
- Arquivo `.env` (`VITE_AUTH_USER`, `VITE_AUTH_PASS`): descartado — falsa sensação de segurança (variáveis Vite são injetadas no bundle e visíveis no source map do browser).
- Arquivo `src/config/auth.ts` separado: desnecessário para duas constantes.

---

## R-004: Localização do botão de Logout

**Question**: Onde colocar a ação de logout na UI existente?

**Decision**: Ícone/botão de logout no `Header` existente (`src/components/layout/Header.tsx`), aparecendo apenas quando a rota não tem `onBack` (i.e., no Dashboard).

**Rationale**:
- O `Header` é o componente de topo mais visível e já recebe `title` e `onBack` como props.
- Dashboard é o único ponto de entrada após login — faz sentido expor logout lá.
- Evita criar nova navegação ou menu dropdown para um único item.

**Alternatives considered**:
- BottomNav: descartado — já tem 4 itens; logout não é navegação de conteúdo.
- Menu hambúrguer / dropdown: descartado — overhead de componente para uma única ação.
- Dentro da página de Login (não faz sentido — usuário não está logado).

---

## R-005: Validação do formulário de login

**Question**: Usar React Hook Form + Zod (padrão do projeto) ou validação manual?

**Decision**: React Hook Form + Zod, exatamente como nos outros formulários do projeto.

**Rationale**:
- Consistência com padrão já estabelecido (CourtWithdrawModal, GameCreate etc.).
- Zod valida campos obrigatórios (FR-008) de forma declarativa.
- A validação de credenciais em si é lógica de negócio, não de schema — ocorre no `onSubmit` do form após Zod validar que os campos não estão vazios.

**No alternatives seriously considered** — padrão do projeto é claro.

---

## R-006: Constituição — exceções necessárias

**Question**: A feature tem alguma violação das regras da constituição?

**Violations identified**:

| Regra | Status | Justificativa |
|-------|--------|---------------|
| "Dados sensíveis nunca no client-side" (Segurança §VII) | ⚠️ Exceção justificada | As credenciais são **intencionalmente fake/hardcoded** — não protegem dados reais. A spec explicitamente permite "hard code". Não há dados sensíveis reais em risco. |
| "Test-First" (Princípio IV) | ⚠️ Exceção tática | Projeto em fase de desenvolvimento ativo sem infraestrutura de testes configurada. Testes serão endereçados como dívida técnica documentada. |
| Demais princípios | ✅ Conformante | Mobile-first, TypeScript, RHF+Zod, Heroicons, lazy loading, componentização atômica. |
