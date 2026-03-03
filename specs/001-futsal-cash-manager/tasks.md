---
description: "Implementation tasks for Futsal Cash Manager"
---

# Tasks: Sistema de Gerenciamento de Presença e Caixa para Futsal

**Input**: Design documents from `/specs/001-futsal-cash-manager/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in specification - omitted from this task list

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single-page React application
- All paths relative to project root: `src/`, `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling configuration

- [x] T001 Create Vite project with React + TypeScript template
- [x] T002 [P] Install core dependencies (zustand, zod, react-hook-form, @hookform/resolvers, dexie)
- [x] T003 [P] Install and configure Tailwind CSS with brand color palette
- [x] T004 [P] Configure Vitest with jsdom environment and setup file
- [x] T005 [P] Configure Playwright for E2E testing
- [x] T006 [P] Setup ESLint with jsx-a11y plugin
- [x] T007 [P] Configure Workbox for PWA service worker
- [x] T008 [P] Create PWA manifest.json with app metadata
- [x] T009 Configure path aliases (@/ → /src) in vite.config.ts and tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 [P] Create Money branded type and utility functions in src/types/money.ts
- [x] T011 [P] Create GameStatus and PaymentMethod types in src/types/game.ts
- [x] T012 [P] Create TransactionType type in src/types/cash.ts
- [x] T013 [P] Define Game entity interface in src/types/game.ts
- [x] T014 [P] Define Player entity interface in src/types/game.ts
- [x] T015 [P] Define Transaction entity interface in src/types/cash.ts
- [x] T016 [P] Define CashSummary interface in src/types/cash.ts
- [x] T017 [P] Create Zod schema for Game validation in src/schemas/game.ts
- [x] T018 [P] Create Zod schema for Player validation in src/schemas/game.ts
- [x] T019 [P] Create Zod schema for Transaction validation in src/schemas/cash.ts
- [x] T020 Create IndexedDB schema with Dexie in src/services/db.ts
- [x] T021 [P] Implement toMoney() converter in src/utils/money.ts
- [x] T022 [P] Implement fromMoney() converter in src/utils/money.ts
- [x] T023 [P] Implement formatMoney() with Intl.NumberFormat in src/utils/money.ts
- [x] T024 [P] Implement calculateCashImpact() for games in src/utils/calculations.ts
- [x] T025 [P] Implement parseWhatsAppList() regex parser in src/utils/parsers.ts
- [x] T026 [P] Implement sanitizeName() cleaner in src/utils/parsers.ts
- [x] T027 Create base gameService with CRUD operations in src/services/gameService.ts
- [x] T028 Create base cashService with transaction operations in src/services/cashService.ts
- [x] T029 Create useGameStore with Zustand in src/store/gameStore.ts
- [x] T030 Create useCashStore with Zustand in src/store/cashStore.ts
- [x] T031 [P] Create Button atom component in src/components/ui/Button.tsx
- [x] T032 [P] Create Input atom component in src/components/ui/Input.tsx
- [x] T033 [P] Create Card atom component in src/components/ui/Card.tsx
- [x] T034 [P] Create Badge atom component in src/components/ui/Badge.tsx
- [x] T035 [P] Create Spinner atom component in src/components/ui/Spinner.tsx
- [x] T036 [P] Create Header layout component in src/components/layout/Header.tsx
- [x] T037 [P] Create Container layout component in src/components/layout/Container.tsx
- [x] T038 Seed mock data for games in IndexedDB in src/services/seed.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visualizar Dashboard com Caixa e Jogos (Priority: P1) 🎯 MVP

**Goal**: Display cash balance and current month's games on dashboard home page

**Independent Test**: Access home page, verify cash balance displays in R$ Brazilian format, verify games list shows current month games with date and status, verify negative balance shows red/alert styling

### Implementation for User Story 1

- [x] T039 [P] [US1] Create CashDisplay component in src/components/dashboard/CashDisplay.tsx
- [x] T040 [P] [US1] Create GameCard molecule component in src/components/dashboard/GameCard.tsx
- [x] T041 [US1] Create GameList component in src/components/dashboard/GameList.tsx — games ordered most recent first
- [x] T042 [US1] Implement getCurrentMonthGames() selector in src/store/gameStore.ts
- [x] T043 [US1] Implement getCashSummary() calc in src/store/cashStore.ts
- [x] T044 [US1] Create Dashboard page in src/pages/Dashboard.tsx
- [x] T045 [US1] Add Dashboard route to App.tsx
- [x] T046 [US1] Add empty state message for "Nenhum jogo neste mês" in GameList
- [x] T047 [US1] Add negative balance alert styling to CashDisplay

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. User can view dashboard with cash balance and games.

---

## Phase 4: User Story 2 - Criar e Gerenciar Jogo com Presenças (Priority: P2)

**Goal**: Create game, add players (paste WhatsApp list or manual), mark payment methods, edit amounts, finalize game to update cash

**Independent Test**: Navigate to create game page, enter date, paste WhatsApp names list (auto-parsed), mark payment methods for each player, edit player amounts, click "Finalizar Jogo", verify cash updated correctly (sum all amountPaid - R$ 90), verify game appears on dashboard

### Implementation for User Story 2

- [x] T048 [P] [US2] Create PlayerRow molecule component in src/components/game/PlayerRow.tsx
- [x] T049 [US2] Create PlayerList organism component in src/components/game/PlayerList.tsx
- [x] T050 [P] [US2] Create useWhatsAppParser custom hook in src/hooks/useWhatsAppParser.ts
- [x] T051 [US2] Create GameForm with React Hook Form + Zod in src/components/game/GameForm.tsx
- [x] T052 [US2] Add createGame() action to gameStore in src/store/gameStore.ts
- [x] T053 [US2] Add updateGame() action to gameStore in src/store/gameStore.ts
- [x] T054 [US2] Add finalizeGame() action to gameStore in src/store/gameStore.ts
- [x] T055 [US2] Add createTransaction() action to cashStore in src/store/cashStore.ts
- [x] T056 [US2] Integrate finalizeGame to create Transaction when status='finished'
- [x] T057 [US2] Create GameCreate page in src/pages/GameCreate.tsx — botão primário é "Salvar como Pendente" (status draft), botão secundário é "Finalizar Jogo" (status finished + atualiza caixa)
- [x] T058 [US2] Create GameDetail page with player list view in src/pages/GameDetail.tsx
- [x] T059 [US2] Add GameCreate and GameDetail routes to App.tsx
- [x] T060 [US2] Add "Criar Jogo" button to Dashboard navigation
- [x] T061 [US2] Add editable courtCost field to GameForm (default R$ 90)
- [x] T062 [US2] Add editable amountPaid input to PlayerRow (default R$ 10)
- [x] T063 [US2] Add payment method toggle to PlayerRow (PIX/Na Quadra)
- [x] T064 [US2] Add player summary footer to PlayerList (total players, total amount)
- [x] T065 [US2] Add validation: prevent finalize if no players added
- [x] T066 [US2] Add confirmation dialog before finalizing game

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. User can create games and see them on dashboard.

---

## Phase 5: User Story 3 - Ajustar Entradas e Saídas do Caixa (Priority: P3)

**Goal**: Manually adjust cash with entries (donations) or exits (expenses), always with required justification

**Independent Test**: Access cash adjustment page, add manual entry (e.g. R$ 50, justification "Doação João"), verify cash increased and transaction appears in history; add manual exit (e.g. R$ 80, justification "Compra bolas"), verify cash decreased; attempt to submit without justification and verify error

### Implementation for User Story 3

- [x] T067 [P] [US3] Create CashAdjustForm component with React Hook Form in src/components/cash/CashAdjustForm.tsx
- [x] T068 [US3] Add manual entry type radio to CashAdjustForm (entrada/saída)
- [x] T069 [US3] Add amount input with R$ formatting to CashAdjustForm
- [x] T070 [US3] Add justification textarea to CashAdjustForm (required, min 5 chars)
- [x] T071 [US3] Add addManualEntry() action to cashStore in src/store/cashStore.ts
- [x] T072 [US3] Add addManualExit() action to cashStore in src/store/cashStore.ts
- [x] T073 [US3] Create CashAdjust page in src/pages/CashAdjust.tsx
- [x] T074 [US3] Add CashAdjust route to App.tsx
- [x] T075 [US3] Add "Ajustar Caixa" button to Dashboard navigation
- [x] T076 [US3] Add Zod validation for justification (min 5, max 500 chars)
- [x] T077 [US3] Add success feedback after manual adjustment

**Checkpoint**: All core user stories (1, 2, 3) should now be independently functional. User can view, create games, and adjust cash manually.

---

## Phase 6: User Story 4 - Visualizar Histórico de Movimentações e Partidas (Priority: P4)

**Goal**: View complete transaction history (entries, exits, games) with filters and game history page

**Independent Test**: Access transaction history page, verify all transactions appear with date/type/amount/description; filter by date period, verify filtering works; click on game transaction, verify game details shown; access game history page, verify all finished games listed

### Implementation for User Story 4

- [x] T078 [P] [US4] Create TransactionListItem component in src/components/cash/TransactionListItem.tsx
- [x] T079 [US4] Create TransactionList component in src/components/cash/TransactionList.tsx
- [x] T080 [P] [US4] Create DateRangeFilter component in src/components/cash/DateRangeFilter.tsx
- [x] T081 [US4] Create TransactionHistory page in src/pages/TransactionHistory.tsx
- [x] T082 [US4] Create GameHistory page in src/pages/GameHistory.tsx
- [x] T083 [US4] Add getTransactionsByDateRange() selector to cashStore
- [x] T084 [US4] Add getFinishedGames() selector to gameStore
- [x] T085 [US4] Add TransactionHistory and GameHistory routes to App.tsx
- [x] T086 [US4] Add "Histórico" navigation link to Header — implementado como BottomNav fixo no rodapé (Início / Histórico / Ajustar Caixa) em src/components/layout/BottomNav.tsx; abas Movimentações/Partidas dentro das páginas de histórico
- [x] T087 [US4] Add transaction type badges (Jogo/Entrada/Saída) to TransactionListItem
- [x] T088 [US4] Add click-through from transaction to game detail page
- [x] T089 [US4] Add date formatting to transaction and game lists
- [x] T090 [US4] Add empty state for "Nenhuma movimentação encontrada"

**Checkpoint**: All user stories complete and independently functional. Full feature set available.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [x] T091 [P] Create Navigation component with routing in src/components/layout/Navigation.tsx — implementado como BottomNav (src/components/layout/BottomNav.tsx) com links para Início/Histórico/Ajustar Caixa
- [x] T092 Setup React Router in App.tsx with lazy loading for pages — todas as 6 páginas carregadas com React.lazy + Suspense; cada página vira chunk JS separado no build
- [x] T093 [P] Add loading states with Spinner to all async operations — Spinner presente em Dashboard, GameCreate, GameDetail, GameHistory, TransactionHistory
- [x] T094 [P] Add error boundaries for component error handling — ErrorBoundary (class component) envolve toda a árvore em App.tsx; exibe mensagem amigável + botão "Voltar ao início" — src/components/layout/ErrorBoundary.tsx
- [x] T095 [P] Add toast notifications for user feedback across app — toastStore (Zustand) com auto-dismiss (3.5s) + ToastContainer; toast.success/error chamado em GameCreate, GameDetail e CashAdjust — src/store/toastStore.ts, src/components/ui/ToastContainer.tsx
- [ ] T096 [P] Implement dark mode toggle with theme persistence
- [x] T097 [P] Add prefers-reduced-motion CSS respecting user preferences — @media (prefers-reduced-motion: reduce) em src/index.css desativa animações/transições
- [x] T098 Configure Workbox caching strategies for offline support — vite-plugin-pwa gera sw.js + workbox com precache de 18 entradas (confirmar no build)
- [x] T099 Add "Install App" PWA prompt to Header — usePwaInstall hook intercepta beforeinstallprompt; race condition corrigida capturando o evento em main.tsx antes do ReactDOM.createRoot e armazenando em window.__pwaPrompt; hook inicializa estado direto do global — src/hooks/usePwaInstall.ts, src/main.tsx, src/components/layout/Header.tsx
- [x] T100 [P] Add favicon and app icons to public/ — gerados via scripts/generate-icons.mjs (sharp + public/icon.png): favicon.ico (48px), apple-touch-icon.png (180px), pwa-192x192.png, pwa-512x512.png; index.html atualizado com link rel=icon e apple-touch-icon; precache sobe de 18 para 29 entradas; public/icon.svg removido
- [x] T111 [P] Add PWA splash screens for iOS — scripts/generate-icons.mjs gera 6 splash screens (icon 192px centralizado em fundo #1E40AF) para iPhone SE/8/12-14/14ProMax e iPad Air/Pro; link rel="apple-touch-startup-image" com media queries por dispositivo adicionado ao index.html; splash-*.png incluído no includeAssets do vite.config.ts — public/splash-*.png, index.html, vite.config.ts
- [x] T112 [P] Create theme.config.mjs as single source of truth for brand colors — vite.config.ts importa e usa theme.colorPrimary no manifest e injeta meta theme-color via plugin transformIndexHtml; scripts/generate-icons.mjs importa e converte hex→rgb para o fundo das splash screens; src/index.css recebe comentário de sincronia; para trocar a paleta basta editar um hex em theme.config.mjs e rodar npm run generate-icons — theme.config.mjs, vite.config.ts, scripts/generate-icons.mjs, src/index.css, index.html
- [x] T101 [P] Optimize bundle size with code splitting — lazy loading divide 408 kB monolítico em chunks por página (maior: Card 99 kB, index 188 kB)
- [x] T102 [P] Add lazy loading for images and heavy components — React.lazy em todas as páginas em App.tsx
- [ ] T103 Run Lighthouse CI audit and fix performance issues
- [ ] T104 Run axe accessibility audit and fix violations
- [x] T105 [P] Add README.md with setup and development instructions — README.md criado na raiz do projeto
- [ ] T106 Validate all user stories work end-to-end per quickstart.md
- [x] T107 [US2] WhatsApp parser detecta seção "LISTA:" e extrai apenas nomes numerados até o próximo cabeçalho (ex: "ESPERA:"); fallback para texto completo quando sem cabeçalho — src/utils/parsers.ts
- [x] T108 [US1/US2] Labels de status dos jogos padronizados: draft/in_progress → "Pendente" (badge warning), finished → "Concluído" (badge success), cancelled → "Cancelado" (badge danger) — src/components/dashboard/GameCard.tsx, src/pages/GameDetail.tsx
- [x] T109 [US1/US2] GameStatus simplificado para dois valores internos: 'pending' (jogo salvo, não finalizado) e 'finished' (jogo concluído, caixa atualizado) — src/types/game.ts, src/schemas/game.ts, src/services/gameService.ts, src/services/seed.ts
- [x] T110 [US1] Seed versionado com SEED_VERSION em localStorage — quando a versão muda, limpa o IndexedDB e re-seed com dados atualizados; GameCard usa fallback seguro para status desconhecido — src/services/seed.ts, src/components/dashboard/GameCard.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **RECOMMENDED MVP**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (dashboard updates automatically)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (uses same cash store)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No hard dependencies but benefits from US2 being complete

### Within Each User Story

- Atoms/molecules before organisms (e.g., PlayerRow before PlayerList)
- Store actions before page components
- Core implementation before navigation/integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T008 can all run in parallel (different config files)

**Phase 2 (Foundational)**: Most tasks can run in parallel:
- Types (T010-T016): All parallel
- Schemas (T017-T019): All parallel
- Utils (T021-T026): All parallel
- UI Atoms (T031-T035): All parallel
- Layout (T036-T037): Parallel

**Phase 3 (US1)**: T039-T040 can run in parallel (CashDisplay + GameCard)

**Phase 4 (US2)**: T048 and T050 can run in parallel (PlayerRow + hook)

**Phase 5 (US3)**: T067-T070 can develop simultaneously once form structure defined

**Phase 6 (US4)**: T078 and T080 can run in parallel (TransactionListItem + DateRangeFilter)

**Phase 7 (Polish)**: T091, T093, T094, T095, T096, T097, T100, T101, T102, T105 can all run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all type definitions together:
Task T010: "Create Money branded type in src/types/money.ts"
Task T011: "Create GameStatus type in src/types/game.ts"
Task T012: "Create TransactionType type in src/types/cash.ts"

# Launch all UI atoms together:
Task T031: "Create Button component in src/components/ui/Button.tsx"
Task T032: "Create Input component in src/components/ui/Input.tsx"
Task T033: "Create Card component in src/components/ui/Card.tsx"
Task T034: "Create Badge component in src/components/ui/Badge.tsx"
Task T035: "Create Spinner component in src/components/ui/Spinner.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. Complete Phase 1: Setup (9 tasks)
2. Complete Phase 2: Foundational (29 tasks) - **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (9 tasks)
4. **STOP and VALIDATE**: Test dashboard with cash and games
5. Deploy/demo MVP if ready
6. Total: **47 tasks for MVP**

### Incremental Delivery

1. Setup + Foundational → Foundation ready (38 tasks)
2. Add User Story 1 → Dashboard MVP working (9 tasks) → Deploy/Demo
3. Add User Story 2 → Full game management (19 tasks) → Deploy/Demo
4. Add User Story 3 → Cash adjustments (11 tasks) → Deploy/Demo
5. Add User Story 4 → Complete history (13 tasks) → Deploy/Demo
6. Add Polish → Production-ready (16 tasks) → Final Deploy

### Parallel Team Strategy

With multiple developers (after Foundational phase complete):

1. Team completes Setup + Foundational together (38 tasks)
2. Once Foundational is done:
   - **Developer A**: User Story 1 - Dashboard (9 tasks)
   - **Developer B**: User Story 2 - Game Management (19 tasks)
   - **Developer C**: User Story 3 - Cash Adjustments (11 tasks)
   - **Developer D**: User Story 4 - History (13 tasks)
3. Stories complete and integrate independently
4. Team completes Polish together (16 tasks)

---

## Summary

- **Total Tasks**: 106
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 29 tasks (BLOCKS all user stories)
- **User Story 1 (P1 - MVP)**: 9 tasks
- **User Story 2 (P2)**: 19 tasks
- **User Story 3 (P3)**: 11 tasks
- **User Story 4 (P4)**: 13 tasks
- **Polish Phase**: 16 tasks

**MVP Scope**: Phases 1-3 = 47 tasks (Dashboard with cash display and games list)

**Parallel Tasks**: 47 tasks marked [P] can run in parallel within their phase

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P], optional [Story], and file paths

**Independent Testing**:
- US1: Dashboard displays cash and games - testable without other features
- US2: Create and finalize game - testable by verifying cash updates correctly
- US3: Manual cash adjustment - testable by verifying transactions created
- US4: View history - testable by checking all transactions appear with filters

**Suggested MVP**: Start with US1 only (Dashboard) = **47 tasks total**
