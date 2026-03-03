// T038: Seed mock data for IndexedDB

import { db } from './db'
import type { Game, Player } from '@/types/game'
import type { Transaction } from '@/types/cash'
import { toMoney } from '@/types/money'
import { calculateCashImpact } from '@/utils/calculations'

/** Increment this when the data model changes to force a re-seed */
const SEED_VERSION = '2'

/**
 * Seed the database with mock data.
 * Clears and re-seeds automatically when SEED_VERSION changes.
 */
export async function seedDatabase() {
  const storedVersion = localStorage.getItem('seedVersion')

  if (storedVersion === SEED_VERSION) {
    const existingGames = await db.games.count()
    if (existingGames > 0) {
      console.log('Database already seeded (v' + SEED_VERSION + ')')
      return
    }
  }

  // Clear old data when version mismatch
  if (storedVersion !== SEED_VERSION) {
    console.log('Seed version changed, clearing database...')
    await db.games.clear()
    await db.players.clear()
    await db.transactions.clear()
  }

  console.log('Seeding database (v' + SEED_VERSION + ')...')

  // Create mock games for current and previous month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Game 1: Last week, finished
  const game1Date = new Date(currentYear, currentMonth, now.getDate() - 7)
  const game1: Game = {
    id: crypto.randomUUID(),
    date: game1Date,
    status: 'finished',
    courtCost: toMoney(90),
    players: [],
    cashImpact: toMoney(10), // Will recalculate
    createdAt: game1Date,
    updatedAt: game1Date,
    finalishedAt: game1Date
  }
  await db.games.add(game1)

  // Add players to game1
  const game1Players: Player[] = [
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'João Silva',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Maria Santos',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Pedro Costa',
      paymentMethod: 'on_court',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Ana Oliveira',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Carlos Mendes',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Juliana Rocha',
      paymentMethod: 'on_court',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Roberto Lima',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Fernanda Alves',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Lucas Ferreira',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game1Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game1.id,
      name: 'Camila Souza',
      paymentMethod: 'on_court',
      amountPaid: toMoney(10),
      addedAt: game1Date
    }
  ]
  
  for (const player of game1Players) {
    await db.players.add(player)
  }

  // Update game1 with correct cashImpact
  const game1CashImpact = calculateCashImpact(game1Players, game1.courtCost)
  await db.games.update(game1.id, { cashImpact: game1CashImpact })

  // Create transaction for game1
  const game1Transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'game',
    amount: game1CashImpact,
    description: `Jogo finalizado - ${game1Players.length} jogadores`,
    justification: null,
    gameId: game1.id,
    createdAt: game1Date
  }
  await db.transactions.add(game1Transaction)

  // Game 2: Yesterday, in progress
  const game2Date = new Date(currentYear, currentMonth, now.getDate() - 1)
  const game2: Game = {
    id: crypto.randomUUID(),
    date: game2Date,
    status: 'pending',
    courtCost: toMoney(90),
    players: [],
    cashImpact: 0 as any,
    createdAt: game2Date,
    updatedAt: game2Date,
    finalishedAt: null
  }
  await db.games.add(game2)

  // Add players to game2 (fewer players)
  const game2Players: Player[] = [
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'João Silva',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Maria Santos',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Pedro Costa',
      paymentMethod: 'on_court',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Ana Oliveira',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Carlos Mendes',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Juliana Rocha',
      paymentMethod: 'on_court',
      amountPaid: toMoney(10),
      addedAt: game2Date
    },
    {
      id: crypto.randomUUID(),
      gameId: game2.id,
      name: 'Roberto Lima',
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
      addedAt: game2Date
    }
  ]
  
  for (const player of game2Players) {
    await db.players.add(player)
  }

  // Game 3: Next week, pending
  const game3Date = new Date(currentYear, currentMonth, now.getDate() + 7)
  const game3: Game = {
    id: crypto.randomUUID(),
    date: game3Date,
    status: 'pending',
    courtCost: toMoney(90),
    players: [],
    cashImpact: 0 as any,
    createdAt: now,
    updatedAt: now,
    finalishedAt: null
  }
  await db.games.add(game3)

  // Add manual transaction (entry)
  const manualEntry: Transaction = {
    id: crypto.randomUUID(),
    type: 'manual_in',
    amount: toMoney(50),
    description: 'Doação João',
    justification: 'Doação para ajudar no caixa do time',
    gameId: null,
    createdAt: new Date(currentYear, currentMonth, now.getDate() - 5)
  }
  await db.transactions.add(manualEntry)

  localStorage.setItem('seedVersion', SEED_VERSION)
  console.log('Database seeded successfully!')
  console.log(`- ${await db.games.count()} games`)
  console.log(`- ${await db.players.count()} players`)
  console.log(`- ${await db.transactions.count()} transactions`)
}

/**
 * Clear all data from database (for testing)
 */
export async function clearDatabase() {
  await db.games.clear()
  await db.players.clear()
  await db.transactions.clear()
  console.log('Database cleared')
}
