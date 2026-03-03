# Data Model: Sistema de Gerenciamento de Presença e Caixa para Futsal

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)  
**Phase**: 1 - Design & Contracts  
**Date**: 2026-03-03

## Purpose

Define as entidades de dados, seus atributos, relacionamentos e regras de validação. Este modelo serve como fonte de verdade para a implementação dos types TypeScript e da camada de persistência.

---

## Core Entities

### 1. Game (Jogo)

Representa uma partida de futsal informal.

**Attributes**:
- `id: string` - UUID único
- `date: Date` - Data e hora do jogo
- `status: GameStatus` - Estado atual: `'draft' | 'in_progress' | 'finished' | 'cancelled'`
- `courtCost: Money` - Custo da quadra em centavos (default: 9000 = R$ 90,00)
- `players: Player[]` - Lista de presenças/jogadores
- `cashImpact: Money` - Impacto calculado no caixa (pode ser negativo)
- `createdAt: Date` - Timestamp de criação
- `updatedAt: Date` - Timestamp de última atualização
- `finalishedAt: Date | null` - Timestamp de finalização (null se não finalizado)

**Relationships**:
- `players`: 1:N com `Player` (um jogo tem muitos jogadores)
- `transaction`: 1:1 opcional com `Transaction` (criado quando jogo é finalizado)

**Business Rules**:
- `courtCost` deve ser >= 0
- `cashImpact` = (soma de `amountPaid` de TODOS os players) - `courtCost`
- Ambas formas de pagamento (PIX e on_court) contam para o caixa
- Apenas jogos com `status='finished'` geram `Transaction`
- Após finalizar (`status='finished'`), jogo é imutável (apenas leitura)
- `finalishedAt` definido automaticamente ao mudar status para 'finished'

**Validation**:
```typescript
const gameSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  status: z.enum(['draft', 'in_progress', 'finished', 'cancelled']),
  courtCost: z.number().int().nonnegative(), // Money (cents)
  players: z.array(playerSchema).min(0),
  cashImpact: z.number().int(), // Money (cents), can be negative
  createdAt: z.date(),
  updatedAt: z.date(),
  finalishedAt: z.date().nullable()
});
```

**State Transitions**:
```
draft → in_progress → finished
  ↓          ↓
cancelled  cancelled
```

---

### 2. Player (Presença/Jogador)

Representa a participação de uma pessoa em um jogo específico.

**Attributes**:
- `id: string` - UUID único
- `gameId: string` - Referência ao jogo (FK)
- `name: string` - Nome do jogador
- `paymentMethod: PaymentMethod` - Forma de pagamento: `'pix' | 'on_court'`
- `amountPaid: Money` - Valor pago em centavos (editável, default: 1000 = R$ 10,00)
- `addedAt: Date` - Timestamp de quando foi adicionado ao jogo

**Relationships**:
- `game`: N:1 com `Game` (muitos players pertencem a um jogo)

**Business Rules**:
- `name` deve ter pelo menos 2 caracteres
- `name` pode ser duplicado (diferentes pessoas com mesmo nome)
- `amountPaid` é editável por jogador (default R$ 10,00, mas pode ser alterado no frontend)
- **Ambas** formas de pagamento (`pix` e `on_court`) contam para `cashImpact` do caixa
- `paymentMethod='pix'`: Jogador pagou via PIX para a gerente
- `paymentMethod='on_court'`: Jogador pagou diretamente na quadra (também entra no caixa)

**Validation**:
```typescript
const playerSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  paymentMethod: z.enum(['pix', 'on_court']),
  amountPaid: z.number().int().positive().default(1000), // Default R$ 10,00, editável
  addedAt: z.date()
});
```

---

### 3. Transaction (Movimentação de Caixa)

Representa uma entrada ou saída de dinheiro no caixa.

**Attributes**:
- `id: string` - UUID único
- `type: TransactionType` - Tipo: `'game' | 'manual_in' | 'manual_out'`
- `amount: Money` - Valor em centavos (positivo para entrada, negativo para saída)
- `description: string` - Descrição da movimentação
- `justification: string | null` - Justificativa obrigatória para ajustes manuais
- `gameId: string | null` - Referência ao jogo (FK), null para ajustes manuais
- `createdAt: Date` - Timestamp da transação

**Relationships**:
- `game`: N:1 opcional com `Game` (transações de jogos referenciam o jogo)

**Business Rules**:
- `type='game'`: `gameId` obrigatório, `justification` null, `amount` vem de `cashImpact` do jogo
- `type='manual_in'`: `gameId` null, `justification` obrigatória, `amount` > 0
- `type='manual_out'`: `gameId` null, `justification` obrigatória, `amount` < 0
- Transações são imutáveis após criação (append-only log)
- Para "cancelar" uma transação, cria-se uma transação reversa

**Validation**:
```typescript
const transactionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['game', 'manual_in', 'manual_out']),
  amount: z.number().int(), // Money (cents), can be negative
  description: z.string().min(1).max(500),
  justification: z.string().min(5).max(500).nullable(),
  gameId: z.string().uuid().nullable(),
  createdAt: z.date()
}).refine(data => {
  // Type-specific validations
  if (data.type === 'game') {
    return data.gameId !== null && data.justification === null;
  }
  if (data.type === 'manual_in') {
    return data.gameId === null && data.justification !== null && data.amount > 0;
  }
  if (data.type === 'manual_out') {
    return data.gameId === null && data.justification !== null && data.amount < 0;
  }
  return false;
}, {
  message: "Transaction type validation failed"
});
```

---

### 4. CashSummary (Resumo do Caixa)

Representa o estado agregado do caixa. Calculado dinamicamente, não persistido.

**Attributes**:
- `currentBalance: Money` - Saldo atual em centavos
- `totalIn: Money` - Total de entradas (positivo)
- `totalOut: Money` - Total de saídas (negativo)
- `transactionCount: number` - Total de transações
- `lastUpdatedAt: Date` - Data da última transação

**Calculation**:
```typescript
function calculateCashSummary(transactions: Transaction[]): CashSummary {
  const sorted = transactions.sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );
  
  const currentBalance = sorted.reduce((sum, t) => sum + t.amount, 0) as Money;
  const totalIn = sorted
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0) as Money;
  const totalOut = sorted
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0) as Money;
  
  return {
    currentBalance,
    totalIn,
    totalOut,
    transactionCount: transactions.length,
    lastUpdatedAt: sorted[sorted.length - 1]?.createdAt ?? new Date()
  };
}
```

**Business Rules**:
- Sempre calculado on-demand, nunca armazenado
- `currentBalance` = soma de todos `transaction.amount`
- Pode ser negativo (débito)

---

## Type Definitions (TypeScript)

```typescript
// types/money.ts
export type Money = number & { readonly __brand: 'Money' };

export function toMoney(reais: number): Money {
  return Math.round(reais * 100) as Money;
}

export function fromMoney(cents: Money): number {
  return cents / 100;
}

// types/game.ts
export type GameStatus = 'draft' | 'in_progress' | 'finished' | 'cancelled';
export type PaymentMethod = 'pix' | 'on_court';

export interface Game {
  id: string;
  date: Date;
  status: GameStatus;
  courtCost: Money;
  players: Player[];
  cashImpact: Money;
  createdAt: Date;
  updatedAt: Date;
  finalishedAt: Date | null;
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  paymentMethod: PaymentMethod;
  amountPaid: Money;
  addedAt: Date;
}

// types/cash.ts
export type TransactionType = 'game' | 'manual_in' | 'manual_out';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: Money;
  description: string;
  justification: string | null;
  gameId: string | null;
  createdAt: Date;
}

export interface CashSummary {
  currentBalance: Money;
  totalIn: Money;
  totalOut: Money;
  transactionCount: number;
  lastUpdatedAt: Date;
}
```

---

## IndexedDB Schema

```typescript
// services/db.ts
import Dexie, { Table } from 'dexie';

export class FutsalDB extends Dexie {
  games!: Table<Game, string>;
  players!: Table<Player, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('FutsalCashManager');
    
    this.version(1).stores({
      games: 'id, date, status, finalishedAt',
      players: 'id, gameId, name',
      transactions: 'id, type, gameId, createdAt'
    });
  }
}

export const db = new FutsalDB();
```

**Indexes**:
- `games`: `id` (PK), `date`, `status`, `finalishedAt`
- `players`: `id` (PK), `gameId` (FK index), `name`
- `transactions`: `id` (PK), `type`, `gameId` (FK index), `createdAt`

---

## Data Flow

```
User Action → Store (Zustand) → Service → IndexedDB
                ↓                           ↓
            UI Update ← Reactive State ← Query Result
```

**Example Flow - Create Game**:
1. User fills GameForm, clicks "Criar Jogo"
2. `useGameStore.createGame(data)` called
3. Store calls `gameService.createGame(data)`
4. Service validates with Zod schema
5. Service inserts into `db.games`
6. Service returns created game
7. Store updates state: `set(state => ({ games: [...state.games, newGame] }))`
8. React re-renders components subscribed to `useGameStore`

**Example Flow - Finalize Game**:
1. User clicks "Finalizar Jogo"
2. `useGameStore.finalizeGame(gameId)` called
3. Store calls `gameService.finalizeGame(gameId)`
4. Service:
   - Updates game: `status='finished'`, `finalishedAt=now()`
   - Calculates `cashImpact`: soma de todos `player.amountPaid` - `courtCost`
   - Creates `Transaction` type='game' with `amount=cashImpact`
   - Inserts transaction into `db.transactions`
5. Store updates both games and triggers cash recalculation
6. UI updates: game marked as finished, cash balance updated

---

## Validation Rules Summary

| Entity | Rule | Enforcement |
|--------|------|-------------|
| Game | courtCost >= 0 | Zod schema |
| Game | cashImpact calculated | Business logic |
| Player | name.length >= 2 | Zod schema |
| Player | amountPaid > 0, default 1000 | Zod schema |
| Transaction | type-specific validations | Zod refinement |
| Transaction | manual requires justification | Zod refinement |
| CashSummary | calculated, not stored | Runtime computation |

---

## Migration Strategy (Future API Integration)

Quando migrar para API backend:

1. **Keep interfaces identical**: `Game`, `Player`, `Transaction` types não mudam
2. **Swap service implementation**:
   ```typescript
   // services/gameService.ts
   // BEFORE (mock)
   async function getGames(): Promise<Game[]> {
     return db.games.toArray();
   }
   
   // AFTER (API)
   async function getGames(): Promise<Game[]> {
     const response = await fetch('/api/games');
     return response.json();
   }
   ```
3. **Add API layer**: `services/api.ts` com fetch wrappers
4. **Keep Zustand**: Mesma store, apenas service muda
5. **Add React Query**: Para cache/revalidation (opcional)

**Zero changes** em components, types, ou stores. Apenas camada de serviços é alterada.

---

**Data Model Complete**: 2026-03-03  
**Next**: Contracts & Quickstart
