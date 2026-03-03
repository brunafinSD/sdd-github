// T003 (002-dual-cash-split): IndexedDB schema with Dexie v2 — dual cash

import Dexie, { type Table } from 'dexie'
import type { Game, Player } from '@/types/game'
import type { Transaction, Transfer } from '@/types/cash'

/**
 * IndexedDB database for Futsal Cash Manager
 */
export class FutsalDB extends Dexie {
  games!: Table<Game, string>
  players!: Table<Player, string>
  transactions!: Table<Transaction, string>
  transfers!: Table<Transfer, string>

  constructor() {
    super('FutsalCashManager')

    // Keep v1 intact so Dexie knows the previous schema
    this.version(1).stores({
      games: 'id, date, status, finishedAt',
      players: 'id, gameId, name',
      transactions: 'id, type, gameId, createdAt'
    })

    // v2: add cashTarget index on transactions + new transfers table
    this.version(2)
      .stores({
        games: 'id, date, status, finishedAt',
        players: 'id, gameId, name',
        transactions: 'id, type, gameId, createdAt, cashTarget',
        transfers: 'id, createdAt'
      })
      .upgrade(tx =>
        tx.table('transactions').toCollection().modify((t: Transaction) => {
          if ((t as any).cashTarget === undefined) {
            (t as any).cashTarget = 'adm'
          }
        })
      )
  }
}

export const db = new FutsalDB()
