# Futsal Cash Manager

PWA para gerenciar presenças e caixa de um grupo de futsal.  
Funciona 100% offline, sem backend — tudo salvo no IndexedDB do browser.

---

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Dashboard** | Saldo do caixa do mês + lista de jogos |
| **Criar Jogo** | Importa lista do WhatsApp ou adiciona jogadores manualmente |
| **Detalhe do Jogo** | Edita presença, método de pagamento e valor; finaliza para atualizar o caixa |
| **Ajustar Caixa** | Registra entradas (doações) ou saídas (despesas) com justificativa |
| **Histórico de Movimentações** | Filtra transações por período |
| **Histórico de Partidas** | Lista todos os jogos finalizados com impacto no caixa |

---

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Zustand** — estado global
- **Dexie** — IndexedDB
- **React Hook Form** + **Zod** — formulários e validação
- **React Router v7** — roteamento
- **Heroicons** — ícones
- **Workbox / vite-plugin-pwa** — service worker e cache offline

---

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (hot reload)
npm run dev

# Checar tipos TypeScript
npx tsc --noEmit

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Estrutura de pastas

```
src/
├── components/
│   ├── cash/          # TransactionListItem, TransactionList, DateRangeFilter, CashAdjustForm
│   ├── dashboard/     # CashDisplay, GameCard, GameList
│   ├── game/          # PlayerRow, PlayerList
│   ├── layout/        # Header, Container, BottomNav, ErrorBoundary
│   └── ui/            # Button, Input, CurrencyInput, Card, Badge, Spinner, ToastContainer
├── hooks/             # useWhatsAppParser, usePwaInstall
├── pages/             # Dashboard, GameCreate, GameDetail, CashAdjust, TransactionHistory, GameHistory
├── schemas/           # Zod schemas (game, cash)
├── services/          # db, gameService, cashService, seed
├── store/             # gameStore, cashStore, toastStore
├── types/             # money, game, cash
└── utils/             # calculations, parsers
```

---

## Dados de exemplo

Na primeira execução o app carrega dados de exemplo (seed) para demonstrar as funcionalidades.  
Se alterar o modelo de dados, incremente `SEED_VERSION` em `src/services/seed.ts` para forçar um re-seed.

---

## PWA / Instalação

No Chrome/Edge, um botão de instalação (ícone de download) aparece no cabeçalho quando o browser suporta.  
Também pode instalar pelo menu do browser → "Instalar aplicativo".
