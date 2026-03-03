// T020: IndexedDB schema with Dexie

import Dexie, { type Table } from 'dexie'
import type { Game, Player } from '@/types/game'
import type { Transaction } from '@/types/cash'

/**
 * IndexedDB database for Futsal Cash Manager
 */
export class FutsalDB extends Dexie {
  games!: Table<Game, string>
  players!: Table<Player, string>
  transactions!: Table<Transaction, string>

  constructor() {
    super('FutsalCashManager')
    
    this.version(1).stores({
      games: 'id, date, status, finishedAt',
      players: 'id, gameId, name',
      transactions: 'id, type, gameId, createdAt'
    })
  }
}

export const db = new FutsalDB()
