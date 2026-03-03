# Research: Sistema de Gerenciamento de Presença e Caixa para Futsal

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Phase**: 0 - Outline & Research  
**Date**: 2026-03-03

## Purpose

Resolver questões técnicas e de design identificadas durante o planejamento da feature. Consolidar decisões sobre tecnologias, padrões e arquitetura para garantir implementação alinhada com a constitution.

## Research Topics

### 1. PWA Offline Strategy com Dados Mockados

**Decisão**: Utilizar IndexedDB + Zustand + Service Worker com Workbox

**Rationale**:
- **IndexedDB** para persistência estruturada de dados mockados (jogos, movimentações, caixa)
- **Zustand** para estado global em memória (performance, reactivity)
- **Workbox** para cache de assets estáticos (shell, JS, CSS, ícones)
- Sincronização: IndexedDB ↔ Zustand no mount/unmount
- Service Worker intercepta apenas assets, dados vêm de IndexedDB

**Alternativas Consideradas**:
- ❌ **LocalStorage**: Limitado a 5-10MB, JSON strings (performance ruim para dados estruturados)
- ❌ **Cache Storage apenas**: Não é ideal para dados de aplicação, melhor para assets
- ❌ **React Query com persistence**: Overhead desnecessário sem API real ainda

**Padrão de Implementação**:
```typescript
// services/storage.ts - Camada de abstração
export const storage = {
  async getGames(): Promise<Game[]> {
    // IndexedDB query
  },
  async saveGame(game: Game): Promise<void> {
    // IndexedDB insert/update
  }
};

// store/gameStore.ts - Zustand
export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  isLoading: false,
  
  loadGames: async () => {
    set({ isLoading: true });
    const games = await storage.getGames();
    set({ games, isLoading: false });
  },
  
  addGame: async (game: Game) => {
    await storage.saveGame(game);
    set(state => ({ games: [...state.games, game] }));
  }
}));
```

---

### 2. WhatsApp List Parser - Estratégia de Parsing

**Decisão**: Regex-based parser com fallback para line-by-line splitting

**Rationale**:
- Listas do WhatsApp têm formatos variados: "1. Nome", "• Nome", "Nome", "Nome 🎉"
- Regex remove: números, bullets, emojis, caracteres especiais
- Considera apenas texto alfabético (a-zA-ZÀ-ÿ) com espaços
- Split por linha (\n), trim, filter vazios
- Tolerante a erros: ignora linhas não parseáveis

**Alternativas Consideradas**:
- ❌ **Parser estruturado complexo**: Overkill, WhatsApp não tem formato fixo
- ❌ **Manual line-by-line**: Usuário precisa limpar antes (UX ruim)
- ❌ **ML/NLP**: Overhead absurdo para problema simples

**Padrão de Implementação**:
```typescript
// utils/whatsappParser.ts
export function parseWhatsAppList(text: string): string[] {
  return text
    .split('\n')
    .map(line => {
      // Remove números iniciais: "1. João" → "João"
      let cleaned = line.replace(/^[\d.•\-*]+\s*/, '');
      // Remove emojis e caracteres especiais
      cleaned = cleaned.replace(/[^\p{L}\s]/gu, '');
      // Trim e normalize espaços
      return cleaned.trim().replace(/\s+/g, ' ');
    })
    .filter(name => name.length >= 2) // Mínimo 2 chars
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicatas
}

// hooks/useWhatsAppParser.ts
export function useWhatsAppParser() {
  const parseAndAdd = useCallback((text: string) => {
    const names = parseWhatsAppList(text);
    return names.map(name => ({
      id: generateId(),
      name,
      paymentMethod: 'pix' as const // Default
    }));
  }, []);
  
  return { parseAndAdd };
}
```

---

### 3. Cálculos Financeiros - Precisão e Type Safety

**Decisão**: Aritmética em centavos (integer) + Type Branding para Money

**Rationale**:
- **Problema**: JavaScript float tem imprecisão (0.1 + 0.2 = 0.30000000000000004)
- **Solução**: Trabalhar com centavos (integers) internamente
- **Type Branding**: Garantir que valores monetários não sejam confundidos com números comuns
- **Formatação**: Apenas para display, cálculos sempre em centavos

**Alternativas Consideradas**:
- ❌ **Biblioteca Decimal.js/Big.js**: Overhead de 10-20KB, overkill para escopo simples
- ❌ **Float direto**: Erros de arredondamento, inaceitável para dinheiro
- ❌ **String arithmetic**: Complexo, propenso a erros

**Padrão de Implementação**:
```typescript
// types/money.ts
export type Money = number & { readonly __brand: 'Money' };

export function toMoney(reais: number): Money {
  return Math.round(reais * 100) as Money;
}

export function fromMoney(cents: Money): number {
  return cents / 100;
}

export function formatMoney(cents: Money): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(fromMoney(cents));
}

// utils/calculations.ts
export function calculateCashImpact(
  players: Array<{ amountPaid: Money }>,
  courtCost: Money = toMoney(90)
): Money {
  const revenue = players.reduce((sum, p) => sum + p.amountPaid, 0);
  return (revenue - courtCost) as Money;
}

// Example usage
const players = [
  { amountPaid: toMoney(10) },
  { amountPaid: toMoney(10) },
  // ... 8 more players
];
const impact = calculateCashImpact(players); // 10 players × R$ 10
console.log(formatMoney(impact)); // "R$ 10,00" (10000 - 9000 = 1000 centavos)
```

---

### 4. Componentização Atômica - Estrutura de Design System

**Decisão**: Atomic Design adaptado com Tailwind CSS + Design Tokens

**Rationale**:
- **Atoms**: Componentes primitivos reutilizáveis (Button, Input, Badge, Card)
- **Molecules**: Composições simples (PlayerRow, CashCard, GameCard)
- **Organisms**: Composições complexas (PlayerList, GameForm, TransactionList)
- **Templates/Pages**: Layouts e páginas completas
- **Tailwind Config**: Design tokens (cores, espaçamento, tipografia)
- **Variant API**: Props para variações (size, color, variant)

**Alternativas Consideradas**:
- ❌ **Shadcn/ui**: Overhead de copiar componentes, queremos controle total
- ❌ **Material UI/Chakra**: Bundle gigante (>100KB), não é mobile-first
- ❌ **Componentes ad-hoc**: Inconsistência, duplicação de código

**Padrão de Implementação**:
```typescript
// components/ui/Button.tsx - Atom
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-semibold transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
      {...props}
    >
      {children}
    </button>
  );
}

// components/game/PlayerRow.tsx - Molecule
interface PlayerRowProps {
  player: Player;
  onPaymentChange: (method: PaymentMethod) => void;
  onRemove: () => void;
}

export function PlayerRow({ player, onPaymentChange, onRemove }: PlayerRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <span className="text-gray-800">{player.name}</span>
      <div className="flex gap-2">
        <Badge variant={player.paymentMethod === 'pix' ? 'success' : 'default'}>
          {player.paymentMethod === 'pix' ? 'PIX' : 'Na quadra'}
        </Badge>
        <Button size="sm" variant="secondary" onClick={onRemove}>
          Remover
        </Button>
      </div>
    </div>
  );
}
```

**Tailwind Config**:
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E40AF',    // Primary
          green: '#10B981',   // Success
          orange: '#F97316',  // CTA/Alert
          'gray-dark': '#1F2937',
          'gray-light': '#F3F4F6'
        }
      }
    }
  }
}
```

---

### 5. Testes - Estratégia de Coverage e Tipos

**Decisão**: Test Pyramid - 70% Unit, 20% Integration, 10% E2E

**Rationale**:
- **Unit (70%)**: Utils, cálculos financeiros, hooks, parsers (crítico)
- **Integration (20%)**: Componentes + store, fluxos de formulários
- **E2E (10%)**: User journeys principais (P1 Dashboard, P2 Criar Jogo)
- **Acessibilidade**: Integrado em todos os níveis (jest-axe)
- **Performance**: Lighthouse CI no CI/CD

**Alternativas Consideradas**:
- ❌ **Apenas E2E**: Lento, frágil, feedback tardio
- ❌ **Apenas Unit**: Não testa integração, pode falhar em prod
- ❌ **50/50 Unit/E2E**: Piramide invertida, anti-pattern

**Padrão de Implementação**:
```typescript
// tests/unit/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCashImpact, toMoney, formatMoney } from '@/utils/calculations';

describe('calculateCashImpact', () => {
  it('should calculate positive impact with 10 players', () => {
    const players = Array.from({ length: 10 }, () => ({ amountPaid: toMoney(10) }));
    const impact = calculateCashImpact(players);
    expect(impact).toBe(1000); // R$ 10,00 em centavos
    expect(formatMoney(impact)).toBe('R$ 10,00');
  });
  
  it('should calculate negative impact with 5 players', () => {
    const players = Array.from({ length: 5 }, () => ({ amountPaid: toMoney(10) }));
    const impact = calculateCashImpact(players);
    expect(impact).toBe(-4000); // R$ -40,00
  });
  
  it('should handle custom court cost', () => {
    const players = Array.from({ length: 10 }, () => ({ amountPaid: toMoney(10) }));
    const impact = calculateCashImpact(players, toMoney(100));
    expect(impact).toBe(0); // 10×10 - 100 = 0
  });

  it('should handle variable player amounts', () => {
    const players = [
      { amountPaid: toMoney(10) },
      { amountPaid: toMoney(15) },
      { amountPaid: toMoney(20) }
    ];
    const impact = calculateCashImpact(players, toMoney(30));
    expect(impact).toBe(1500); // (10+15+20) - 30 = 15
  });
});

// tests/integration/GameForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { GameForm } from '@/components/game/GameForm';

describe('GameForm', () => {
  it('should parse WhatsApp list and add players', async () => {
    render(<GameForm />);
    
    const textarea = screen.getByLabelText(/lista de jogadores/i);
    await userEvent.paste(textarea, '1. João\n2. Maria 🎉\n3. Pedro');
    
    await userEvent.click(screen.getByText(/adicionar/i));
    
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });
  
  it('should be accessible', async () => {
    const { container } = render(<GameForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// tests/e2e/dashboard.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('Dashboard displays cash balance and current month games', async ({ page }) => {
  await page.goto('/');
  
  // Cash displayed
  await expect(page.locator('[data-testid="cash-balance"]')).toContainText('R$');
  
  // Games list visible
  await expect(page.locator('[data-testid="games-list"]')).toBeVisible();
  
  // Performance check
  const metrics = await page.evaluate(() => JSON.stringify(window.performance.timing));
  // Assert LCP, FID, etc.
});
```

---

## Summary of Decisions

| Topic | Decision | Technology | Rationale |
|-------|----------|-----------|-----------|
| **Offline Storage** | IndexedDB + Zustand | Dexie.js wrapper | Estruturado, >50MB, persistência + reactivity |
| **WhatsApp Parser** | Regex + line split | Native JS | Tolerante a erros, leve, sem deps |
| **Money Arithmetic** | Centavos (int) + branding | TypeScript types | Precisão garantida, type-safe |
| **Design System** | Atomic Design + Tailwind | Tailwind CSS | Consistência, mobile-first, leve |
| **Testing** | Pyramid 70/20/10 | Vitest + RTL + Playwright | Balance velocidade/confiança |

## Implementation Priority

1. **Setup base** (Vite + React + TypeScript + Tailwind)
2. **Types & Utils** (Money, calculations, formatters)
3. **Storage Layer** (IndexedDB abstraction + stores)
4. **UI Atoms** (Button, Input, Card, Badge)
5. **Feature Components** (PlayerList, GameForm, etc.)
6. **Pages** (Dashboard → GameCreate → CashAdjust → History)
7. **PWA** (Manifest + Service Worker + icons)
8. **Tests** (Unit → Integration → E2E)

## Open Questions

**None**. All technical decisions are resolved. Ready to proceed to Phase 1: Design & Contracts.

---

**Research Complete**: 2026-03-03  
**Next Phase**: Phase 1 - Data Model & Contracts
