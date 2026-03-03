# Component Contracts: UI Interface Specifications

**Feature**: [spec.md](../spec.md) | **Data Model**: [data-model.md](../data-model.md)  
**Purpose**: Define contratos de interface dos componentes principais da aplicação
**Date**: 2026-03-03

## Overview

Este documento especifica os contratos (props, eventos, comportamento) dos componentes UI principais. Serve como contrato entre design e implementação, garantindo consistência e testabilidade.

---

## 1. Dashboard Components

### CashDisplay

**Purpose**: Exibir saldo do caixa de forma destacada com feedback visual

**Props**:
```typescript
interface CashDisplayProps {
  balance: Money;              // Saldo em centavos
  isLoading?: boolean;         // Estado de carregamento
  lastUpdated?: Date;          // Última atualização
  variant?: 'default' | 'compact'; // Variação visual
}
```

**Behavior**:
- Exibe valor formatado em R$ brasileiro
- Saldo negativo: texto vermelho + ícone de alerta
- Saldo zero: texto cinza escuro
- Saldo positivo: texto verde
- Loading state: skeleton/spinner
- Animação suave ao mudar valor (spring animation)

**Accessibility**:
- `role="status"` com `aria-live="polite"`
- `aria-label="Saldo do caixa: [valor formatado]"`
- Contraste mínimo 4.5:1 (WCAG AA)

**Example**:
```tsx
<CashDisplay 
  balance={toMoney(150.50)} 
  lastUpdated={new Date()}
  variant="default"
/>
```

---

### GameList

**Purpose**: Listar jogos do mês corrente com navegação para detalhes

**Props**:
```typescript
interface GameListProps {
  games: Game[];                    // Lista de jogos
  isLoading?: boolean;              // Carregamento
  emptyMessage?: string;            // Mensagem quando vazio
  onGameClick?: (gameId: string) => void; // Callback ao clicar
  filter?: 'all' | 'upcoming' | 'finished'; // Filtro de status
}
```

**Behavior**:
- Ordena por data (mais recente primeiro)
- Card por jogo: data, número de jogadores, status, valor impacto
- Status badge: draft (cinza), in_progress (azul), finished (verde), cancelled (vermelho)
- Skeleton loading para cada card
- Empty state: ilustração + mensagem "Nenhum jogo neste mês"
- Click em card navega para detalhes do jogo

**Accessibility**:
- Lista semântica (`<ul>/<li>`)
- Cada card é um `<button>` ou link com `aria-label` descritivo
- Focus visible em navegação por teclado

**Example**:
```tsx
<GameList
  games={currentMonthGames}
  onGameClick={(id) => navigate(`/games/${id}`)}
  filter="upcoming"
/>
```

---

## 2. Game Management Components

### GameForm

**Purpose**: Formulário para criar/editar jogo com validação

**Props**:
```typescript
interface GameFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Game>;    // Dados iniciais (edit mode)
  onSubmit: (data: GameFormData) => Promise<void>;
  onCancel?: () => void;
}

interface GameFormData {
  date: Date;
  courtCost: Money;
  players: PlayerInput[];
}

interface PlayerInput {
  name: string;
  paymentMethod: PaymentMethod;
  amountPaid?: Money;  // Optional, defaults to 1000 (R$ 10,00)
}
```

**Behavior**:
- React Hook Form + Zod validation
- Campos: data (DatePicker), custo quadra (Input numérico, default R$ 90)
- Seção "Jogadores":
  - Textarea para colar lista do WhatsApp
  - Botão "Processar Lista" → chama parser, adiciona jogadores
  - OU Input manual + botão "Adicionar"
- Lista de jogadores adicionados (PlayerRow por jogador)
- Cada jogador: toggle PIX/Na Quadra, botão Remover
- Cálculo em tempo real: preview do impacto no caixa
- Validações:
  - Data obrigatória
  - Custo quadra >= 0
  - Pelo menos 1 jogador (warning se < 9)
- Submit: loading state, desabilita form
- Erros: toast + inline messages

**Accessibility**:
- Labels associados a todos inputs
- Erros de validação com `aria-describedby`
- Focus management (erro foca primeiro campo inválido)

**Example**:
```tsx
<GameForm
  mode="create"
  onSubmit={async (data) => {
    await gameStore.createGame(data);
    navigate('/dashboard');
  }}
  onCancel={() => navigate(-1)}
/>
```

---

### PlayerList

**Purpose**: Lista editável de jogadores em um jogo

**Props**:
```typescript
interface PlayerListProps {
  players: Player[];
  onPaymentMethodChange: (playerId: string, method: PaymentMethod) => void;
  onAmountChange: (playerId: string, amount: Money) => void;
  onRemove: (playerId: string) => void;
  readonly?: boolean;              // Modo leitura (jogo finalizado)
  showSummary?: boolean;           // Exibir resumo (X PIX, Y na quadra)
}
```

**Behavior**:
- Lista de PlayerRow componentes
- Se `readonly=true`: sem botões de ação
- Se `showSummary=true`: footer com totais (quantidade de jogadores e soma total dos valores pagos)
- Transições animadas ao adicionar/remover

**Example**:
```tsx
<PlayerList
  players={game.players}
  onPaymentMethodChange={(id, method) => 
    updatePlayer(id, { paymentMethod: method })
  }
  onAmountChange={(id, amount) =>
    updatePlayer(id, { amountPaid: amount })
  }
  onRemove={removePlayer}
  showSummary
/>
```

---

### PlayerRow

**Purpose**: Exibir um jogador individual com ações

**Props**:
```typescript
interface PlayerRowProps {
  player: Player;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountChange: (amount: Money) => void;
  onRemove: () => void;
  readonly?: boolean;
}
```

**Behavior**:
- Nome do jogador
- Badge com método de pagamento (PIX verde, Na Quadra cinza)
- Toggle button para trocar método (se não readonly)
- Input editável para valor pago (default R$ 10,00, se não readonly)
- Botão remover (ícone X, se não readonly)
- Animação fade-out ao remover

**Example**:
```tsx
<PlayerRow
  player={player}
  onPaymentMethodChange={(method) => handleChange(player.id, method)}
  onAmountChange={(amount) => handleAmountChange(player.id, amount)}
  onRemove={() => handleRemove(player.id)}
/>
```

---

## 3. Cash Management Components

### CashAdjustForm

**Purpose**: Formulário para ajustes manuais do caixa

**Props**:
```typescript
interface CashAdjustFormProps {
  onSubmit: (data: CashAdjustData) => Promise<void>;
  onCancel?: () => void;
}

interface CashAdjustData {
  type: 'manual_in' | 'manual_out';
  amount: Money;
  justification: string;
}
```

**Behavior**:
- Toggle para tipo: Entrada (verde) / Saída (vermelho)
- Input valor (R$), convertido para centavos
- Textarea justificativa (obrigatória, mín 5 chars)
- Preview do impacto: "Saldo atual: R$ X → Novo saldo: R$ Y"
- Validações:
  - Valor > 0
  - Justificativa obrigatória
- Submit cria Transaction e atualiza caixa

**Example**:
```tsx
<CashAdjustForm
  onSubmit={async (data) => {
    await cashStore.addManualTransaction(data);
    navigate('/dashboard');
  }}
/>
```

---

### TransactionList

**Purpose**: Histórico de movimentações do caixa

**Props**:
```typescript
interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  filter?: {
    type?: TransactionType;
    dateRange?: { start: Date; end: Date };
  };
  onTransactionClick?: (transaction: Transaction) => void;
}
```

**Behavior**:
- Ordenado por data (mais recente primeiro)
- Card por transação:
  - Tipo (badge): Jogo (azul), Entrada (verde), Saída (vermelho)
  - Descrição
  - Valor (formatado, + para entrada, - para saída)
  - Data/hora
  - Justificativa (se manual)
- Se `type='game'`: link para detalhes do jogo
- Filtros: tipo, período (DateRangePicker)
- Infinite scroll ou paginação (se > 50 itens)

**Example**:
```tsx
<TransactionList
  transactions={allTransactions}
  filter={{ type: 'manual_in' }}
  onTransactionClick={(t) => {
    if (t.gameId) navigate(`/games/${t.gameId}`);
  }}
/>
```

---

## 4. Common UI Components (Atoms)

### Button

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Variants**:
- `primary`: bg-blue-600, hover:bg-blue-700
- `secondary`: bg-gray-200, hover:bg-gray-300
- `danger`: bg-red-600, hover:bg-red-700
- `ghost`: transparent, hover:bg-gray-100

**Behavior**:
- Loading: spinner + disabled + texto "Carregando..."
- Focus: ring-2 ring-blue-500
- Disabled: opacity-50 + cursor-not-allowed

---

### Input

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;   // Ex: "R$" para money input
  rightAddon?: React.ReactNode;
}
```

**Behavior**:
- Label acima do input
- Erro: borda vermelha + mensagem em vermelho abaixo
- Helper text em cinza claro
- Focus: ring azul

---

### Badge

**Props**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

**Variants**:
- `default`: gray
- `success`: green
- `warning`: orange
- `danger`: red
- `info`: blue

---

### Card

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;  // Se clicável, adiciona hover + cursor pointer
}
```

**Behavior**:
- `default`: bg-white, border cinza claro
- `outlined`: border mais destacada
- `elevated`: shadow-md
- Se `onClick`: hover:shadow-lg, cursor-pointer

---

## Event Contracts

### Form Submission Flow

```typescript
// 1. User submits form
handleSubmit(async (data) => {
  setIsLoading(true);
  try {
    // 2. Validate with Zod
    const validated = schema.parse(data);
    
    // 3. Call service/store
    await onSubmit(validated);
    
    // 4. Success feedback
    toast.success('Operação realizada com sucesso');
    
    // 5. Navigate or close
    navigate('/dashboard');
  } catch (error) {
    // 6. Error handling
    if (error instanceof ZodError) {
      // Validation errors → form state
      setErrors(error.formErrors);
    } else {
      // Other errors → toast
      toast.error('Erro ao processar operação');
    }
  } finally {
    setIsLoading(false);
  }
});
```

### Navigation Flow

```typescript
// From Dashboard → Game Details
<GameList onGameClick={(id) => navigate(`/games/${id}`)} />

// From Game Form → Dashboard (after save)
<GameForm onSubmit={async (data) => {
  await createGame(data);
  navigate('/dashboard');
}} />

// Cancel → Back
<Button onClick={() => navigate(-1)}>Cancelar</Button>
```

---

## State Management Contracts

### Store Interface (Zustand)

```typescript
// Game Store
interface GameStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadGames: () => Promise<void>;
  createGame: (data: GameFormData) => Promise<Game>;
  updateGame: (id: string, data: Partial<Game>) => Promise<void>;
  finalizeGame: (id: string) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
}

// Cash Store
interface CashStore {
  transactions: Transaction[];
  summary: CashSummary;
  isLoading: boolean;
  
  // Actions
  loadTransactions: () => Promise<void>;
  addManualTransaction: (data: CashAdjustData) => Promise<void>;
  getTransactionsByPeriod: (start: Date, end: Date) => Transaction[];
}
```

**Usage in Components**:
```typescript
function Dashboard() {
  const { games, loadGames } = useGameStore();
  const { summary } = useCashStore();
  
  useEffect(() => {
    loadGames();
  }, [loadGames]);
  
  return (
    <>
      <CashDisplay balance={summary.currentBalance} />
      <GameList games={games} />
    </>
  );
}
```

---

## Testing Contracts

### Component Testing Requirements

Each component must have:

1. **Unit tests** (RTL):
   - Renders without crashing
   - Props are correctly applied
   - User interactions trigger expected callbacks
   - Validation logic works
   - Loading/error states display correctly

2. **Accessibility tests**:
   - No axe violations
   - Keyboard navigation works
   - Screen reader announcements correct

3. **Integration tests** (for forms):
   - Full flow works end-to-end
   - Store updates correctly
   - Navigation works

**Example**:
```typescript
describe('GameForm', () => {
  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    render(<GameForm mode="create" onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/data/i), '2026-03-10');
    await userEvent.paste(screen.getByLabelText(/jogadores/i), 'João\nMaria');
    await userEvent.click(screen.getByText(/processar/i));
    await userEvent.click(screen.getByText(/salvar/i));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        date: expect.any(Date),
        players: expect.arrayContaining([
          expect.objectContaining({ name: 'João' })
        ])
      }));
    });
  });
  
  it('is accessible', async () => {
    const { container } = render(<GameForm mode="create" onSubmit={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

---

**Contracts Complete**: 2026-03-03  
**Next**: Quickstart Guide
