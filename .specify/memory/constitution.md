# Fut-Pay Manager Constitution
<!-- Constituição para projeto web React PWA responsivo -->

## Core Principles

### I. Mobile-First
Desenvolvimento mobile-first obrigatório: projetar primeiro para mobile, depois expandir para telas maiores. Layout responsivo adaptável a dispositivos móveis, tablets e desktops. Navegação e interação otimizadas para toque e gestos.

### II. PWA
Implementação completa de PWA: manifesto web, service worker, instalação em dispositivos, ícones adaptáveis.

### III. Performance-First (NON-NEGOTIABLE)
Performance é prioridade: Lighthouse score mínimo de 90. Core Web Vitals dentro dos targets do Google (LCP < 2.5s, FID < 100ms, CLS < 0.1). Code splitting e lazy loading obrigatórios. Performance budgets definidos e monitorados. Otimização de imagens e assets.

### IV. Test-First (NON-NEGOTIABLE)
Desenvolvimento orientado a testes: testes escritos antes da implementação. Cobertura mínima de 80% para código crítico. Red-Green-Refactor obrigatório. Testes unitários, integração e E2E. Testes de acessibilidade automatizados.

### V. Componentização & Type Safety
React com TypeScript obrigatório para type safety. Componentização atômica: componentes pequenos, reutilizáveis e testáveis. Hooks e padrões modernos. Separação clara entre lógica (hooks customizados), apresentação (componentes) e dados (services/API). Gerenciamento de estado eficiente e escalável.

### VI. Acessibilidade & Inclusão
WCAG 2.1 nível AA mínimo obrigatório. Navegação por teclado completa. Leitores de tela testados. Contraste adequado. ARIA labels corretos. Foco visível. Suporte a preferências do usuário (dark mode, reduced motion).

### VII. Segurança & Privacy
HTTPS obrigatório. Sanitização de inputs. Proteção contra XSS e CSRF. Autenticação e autorização seguras. Dados sensíveis nunca no client-side. Content Security Policy configurada. Dependências atualizadas e auditadas.

## Requisitos Técnicos

### Stack Tecnológico
- **Frontend**: React 18+ com TypeScript obrigatório
- **Build Tool**: Vite
- **Styling**: Tailwind CSS com componentização atômica
- **Ícones**: Heroicons (`@heroicons/react`) — biblioteca padrão obrigatória para todos os ícones do projeto. Nunca usar emojis, texto unicode ou outras bibliotecas de ícones.
- **PWA**: Workbox para service workers, manifesto
- **Estado Global**: Context API para estado local/simples, Zustand (preferencial) para estado complexo
- **Dados**: Dados mockados inicialmente (JSON/TypeScript), preparar camada de serviços para futura integração com API
- **Formulários**: React Hook Form (gerenciamento) + Zod (validação de schemas)
- **Testes**: Vitest/Jest + React Testing Library + Playwright/Cypress para E2E

**Fase Inicial - Frontend com Dados Mockados:**
- Criar **camada de serviços/API abstraída** (ex: `services/api.ts`) para facilitar transição futura
- Usar **Zustand** para gerenciar dados mockados (transações, saldo, histórico)
- Simular latência/loading states mesmo com dados mockados (melhor UX)
- TypeScript garante type safety entre dados mockados e futuros dados reais
- Quando integrar backend: trocar implementação dos services, manter interface
- **React Query**: adicionar quando API real estiver disponível (cache, revalidação, mutações)

**Clarificação de Ferramentas:**
- Use **React Hook Form + Zod** para todos os formulários (login, cadastro, pagamentos, etc.)
- Use **Zustand** para estado global (usuário, tema, preferências) E dados mockados da aplicação
- Prepare arquitetura para futura API: separar lógica de dados em services/hooks customizados

### Qualidade e Testes
- Cobertura mínima: 80% para código crítico, 60% geral
- Testes unitários para lógica e componentes
- Testes de acessibilidade automatizados (axe, jest-axe)
- Testes de performance (Lighthouse CI)
- Testes em Chrome, Firefox, Safari, Edge
- Testes responsivos em múltiplos viewports

### DevOps e Infraestrutura
- **CI/CD**: GitHub Actions
- **Versionamento**: Git com Conventional Commits, Semantic Versioning
- **Quality Gates**: Lint, format, tests, build antes de merge
- **Monitoramento**: Sentry/LogRocket para erros, Analytics para uso
- **Performance**: Lighthouse CI, Web Vitals monitoring
- **Lint & Format**: ESLint + Prettier + Husky pre-commit hooks
- **Segurança**: Dependabot, npm audit, OWASP checks

### Documentação
- README completo: setup, scripts, arquitetura, contribuição
- Storybook para documentação de componentes UI
- JSDoc/TSDoc para funções complexas
- CHANGELOG atualizado seguindo Keep a Changelog
- Comentários apenas onde necessário (código auto-explicativo preferível)

## Workflow de Desenvolvimento

### Planejamento
- Planejamento e revisão de requisitos
- Definição de tarefas e prioridades
- Estimativas e cronograma

### Desenvolvimento
- Desenvolvimento orientado a testes
- Revisão de código obrigatória
- Padrões de código consistentes

### Integração e Deploy
- Integração contínua e deploy automatizado
- Validação em ambiente de staging
- Testes em múltiplos navegadores e dispositivos
- Monitoramento contínuo em produção

## Performance Budget

- **JavaScript**: < 170KB gzipped total
- **CSS**: < 50KB gzipped
- **Imagens**: WebP/AVIF, lazy loading, responsive
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse Score**: ≥ 90 (Performance, Accessibility, Best Practices, SEO)

## Design & UX

- Design system consistente via Tailwind config (cores, tipografia, espaçamento)
- **Paleta de Cores**: Tema esportivo e de movimento com cores vibrantes e energéticas
  - **Azul**: Cor primária - confiança e profissionalismo
  - **Verde**: Sucesso, ações positivas, confirmações
  - **Laranja**: Destaque, calls-to-action, alertas importantes
  - **Cinza Escuro**: Textos principais, elementos de contraste
  - **Cinza Claro**: Backgrounds secundários, borders, elementos sutis
  - **Branco**: Background principal, cards, áreas de conteúdo
- Componentes atômicos reutilizáveis (atoms, molecules, organisms)
- **Ícones**: sempre usar `@heroicons/react` — importar variante `24/outline` por padrão, `24/solid` para ícones em estado ativo/selecionado. Exemplo: `import { ChevronLeftIcon } from '@heroicons/react/24/outline'`
- Feedback visual imediato para ações do usuário (loading, success, error)
- Estados visuais claros: loading states, error states, empty states
- Animações sutis e performáticas respeitando prefers-reduced-motion
- Dark mode e light mode (via class ou data-theme)
- Componentes documentados (README ou Storybook quando aplicável)

## Governance

Esta constituição define os princípios fundamentais do projeto Fut-Pay Manager. Todas as decisões técnicas e de produto devem estar alinhadas com estes princípios.

**Mudanças**: Requerem discussão em equipe, documentação via ADR, aprovação e plano de migração.

**Compliance**: Pull requests devem demonstrar aderência aos princípios. Code reviews verificam qualidade, testes, acessibilidade, performance e segurança.

**Exceções**: Devem ser justificadas, documentadas e aprovadas. Criar issues para resolver débito técnico.

**Version**: 1.0.0 | **Ratified**: 2026-03-03 | **Last Amended**: 2026-03-03
