# Implementation Plan: Sistema de Gerenciamento de Presença e Caixa para Futsal

**Branch**: `001-futsal-cash-manager` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-futsal-cash-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

PWA React para gerenciamento de presença e caixa de time de futsal recreativo. Dashboard exibe saldo do caixa (R$) e jogos do mês. Gerente cria jogos, registra presenças colando lista do WhatsApp, marca pagamentos (PIX/na quadra), finaliza jogo calculando automaticamente impacto no caixa. Sistema mantém histórico de movimentações e partidas. Fase inicial: frontend-only com dados mockados, arquitetura preparada para API futura.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18+  
**Primary Dependencies**: React, TypeScript, Vite, Tailwind CSS, Zustand, React Hook Form, Zod, Workbox  
**Storage**: LocalStorage/IndexedDB (dados mockados inicialmente), camada de serviços abstraída para futura API REST  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E), jest-axe (acessibilidade), Lighthouse CI (performance)  
**Target Platform**: PWA - mobile-first (iOS Safari, Chrome Android), desktop secundário (Chrome, Firefox, Edge, Safari)
**Project Type**: Progressive Web App (PWA) - single-page application com suporte offline  
**Performance Goals**: Lighthouse score ≥90, LCP <2.5s, FID <100ms, CLS <0.1, bundle JS <170KB gzipped  
**Constraints**: Mobile-first obrigatório (viewport 360px+), offline-capable, <3min para registrar jogo completo no mobile, cálculos financeiros 100% precisos  
**Scale/Scope**: Single-user (gerente do time), ~4 telas principais, ~10-15 componentes, histórico ilimitado de jogos/movimentações

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Core Principles Compliance

**I. Mobile-First & Progressive**: ✅ PASS
- Viewport mínimo 360px especificado
- Dashboard otimizado para uso mobile
- Registro de jogo <3min no mobile é critério de sucesso

**II. PWA & Offline-First**: ✅ PASS
- PWA manifest + service worker especificados
- Workbox para gerenciamento de cache
- Dados mockados localmente (LocalStorage/IndexedDB)
- Funciona completamente offline (SC-007)

**III. Performance-First**: ✅ PASS
- Lighthouse score ≥90 obrigatório
- Core Web Vitals targets definidos (LCP <2.5s, FID <100ms, CLS <0.1)
- Bundle JS <170KB gzipped
- Code splitting + lazy loading planejados
- Lighthouse CI nos testes

**IV. Test-First**: ✅ PASS
- Vitest + RTL para unit/integration
- Playwright para E2E
- jest-axe para acessibilidade
- Cobertura 80% código crítico, 60% geral
- TDD obrigatório no workflow

**V. Componentização & Type Safety**: ✅ PASS
- TypeScript 5.x + React 18+ obrigatório
- Componentização atômica (ui/atoms → feature/molecules)
- Hooks customizados para lógica
- Services abstraídos para dados
- Zustand para estado global

**VI. Acessibilidade & Inclusão**: ✅ PASS
- WCAG 2.1 AA obrigatório
- jest-axe automatizado
- Testes com leitores de tela
- Dark/light mode suportado
- prefers-reduced-motion respeitado

**VII. Segurança & Privacy**: ✅ PASS
- HTTPS obrigatório (PWA requirement)
- Sanitização de inputs (WhatsApp list parser)
- Zod para validação de schemas
- CSP configurado
- Dependabot + npm audit

### ✅ Technical Requirements Compliance

**Stack Tecnológico**: ✅ PASS
- React 18+ ✅
- TypeScript obrigatório ✅
- Vite ✅
- Tailwind CSS ✅
- Zustand ✅
- React Hook Form + Zod ✅
- Vitest + RTL + Playwright ✅
- Workbox PWA ✅

**Design & UX**: ✅ PASS
- Paleta esportiva (azul, verde, laranja, cinzas, branco) ✅
- Design system via Tailwind config ✅
- Componentes atômicos ✅
- Feedback visual imediato ✅
- Dark/light mode ✅

**Performance Budget**: ✅ PASS
- JS <170KB gzipped ✅
- CSS <50KB gzipped ✅
- Imagens WebP/AVIF lazy loaded ✅
- Todos os Core Web Vitals targets ✅

### 🎯 Gate Result: **APPROVED**

**Zero violations**. All constitution principles and requirements are satisfied. Ready to proceed to Phase 0 Research.

---

## Phase 0 Complete: Research ✅

**Status**: Complete  
**Document**: [research.md](research.md)

**Key Decisions Made**:
1. **Offline Storage**: IndexedDB + Zustand (Dexie.js wrapper)
2. **WhatsApp Parser**: Regex-based with fallback
3. **Money Arithmetic**: Centavos (integers) + TypeScript branding
4. **Design System**: Atomic Design + Tailwind CSS
5. **Testing Strategy**: Test Pyramid (70% unit, 20% integration, 10% E2E)

All technical unknowns resolved. Ready for Phase 1.

---

## Phase 1 Complete: Design & Contracts ✅

**Status**: Complete  
**Documents**:
- [data-model.md](data-model.md) - Core entities and validation
- [contracts/ui-components.md](contracts/ui-components.md) - Component interfaces
- [quickstart.md](quickstart.md) - Development guide

**Deliverables**:
- 4 core entities defined (Game, Player, Transaction, CashSummary)
- TypeScript types + Zod schemas
- IndexedDB schema
- Component contracts (props, behavior, accessibility)
- Implementation roadmap (14-day plan)

**Constitution Re-check**: ✅ PASS (no changes from initial check)

---

## Next Steps

### Phase 2: Implementation Tasks

The plan stops here as per workflow. Execute `/speckit.tasks` to generate the task breakdown for implementation, OR start coding following the [quickstart.md](quickstart.md) guide.

**Branch**: `001-futsal-cash-manager` (already created)  
**Implementation Order**:
1. Foundation (types, utils, storage)
2. UI Atoms (Button, Input, Card, Badge)
3. Dashboard (P1)
4. Game Management (P2)
5. Cash Adjustments (P3)
6. History (P4)
7. PWA polish + E2E tests

**Estimated Timeline**: 14 days (following quickstart phasing)

---

**Plan Complete**: 2026-03-03  
**Ready for**: `/speckit.tasks` or direct implementation

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/           # Componentes React atômicos e compostos
│   ├── ui/              # Atoms: Button, Input, Card, Badge
│   ├── dashboard/       # Dashboard específico: CashDisplay, GameList
│   ├── game/            # Gerenciamento de jogos: GameForm, PlayerList, PaymentSelector
│   ├── history/         # Históricos: TransactionList, GameHistory
│   └── layout/          # Layout: Header, Navigation, Container
├── pages/               # Páginas/rotas principais
│   ├── Dashboard.tsx    # P1: Home com caixa + jogos do mês
│   ├── GameCreate.tsx   # P2: Criar/editar jogo
│   ├── GameDetail.tsx   # P2: Detalhes do jogo
│   ├── CashAdjust.tsx   # P3: Ajustes manuais do caixa
│   └── History.tsx      # P4: Históricos
├── services/            # Camada de serviços (mockados inicialmente)
│   ├── gameService.ts   # CRUD jogos
│   ├── cashService.ts   # Movimentações e cálculos
│   └── mockData.ts      # Dados mockados
├── store/               # Estado global (Zustand)
│   ├── gameStore.ts     # Estado de jogos
│   ├── cashStore.ts     # Estado do caixa
│   └── appStore.ts      # Estado da aplicação (tema, etc)
├── hooks/               # Custom hooks
│   ├── useGames.ts
│   ├── useCash.ts
│   └── useWhatsAppParser.ts  # Parser de lista do WhatsApp
├── types/               # TypeScript types/interfaces
│   ├── game.ts
│   ├── cash.ts
│   └── player.ts
├── utils/               # Utilitários
│   ├── calculations.ts  # Cálculos financeiros
│   ├── formatters.ts    # Formatação de moeda, data
│   └── validators.ts    # Validações customizadas
├── styles/              # Tailwind config e estilos globais
└── App.tsx              # Root component

public/
├── manifest.json        # PWA manifest
├── icons/              # Ícones PWA (múltiplos tamanhos)
└── sw.js               # Service worker (Workbox)

tests/
├── unit/               # Testes unitários (utils, cálculos, hooks)
├── integration/        # Testes de componentes e fluxos
└── e2e/                # Testes E2E (Playwright)
```

**Structure Decision**: Single-project PWA estruturado por feature/domínio. Componentes organizados atomicamente (ui/feature-specific). Services abstraem dados mockados para facilitar migração futura para API. Store separado por domínio (games, cash). Types centralizados para garantir type safety. Public contém assets PWA.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
