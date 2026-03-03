// T028: Cash service with transaction operations

import { db } from './db'
import type { Transaction, CashSummary } from '@/types/cash'
import type { Money } from '@/types/money'

export const cashService = {
  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.transactions.orderBy('createdAt').reverse().toArray()
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id)
  },

  /**
   * Create transaction from game
   */
  async createGameTransaction(gameId: string, amount: Money, description: string): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'game',
      amount,
      description,
      justification: null,
      gameId,
      createdAt: new Date()
    }
    
    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Add manual entry (income)
   */
  async addManualEntry(amount: Money, description: string, justification: string): Promise<Transaction> {
    if (amount <= 0) throw new Error('Amount must be positive for entries')
    if (!justification || justification.length < 5) {
      throw new Error('Justification required (min 5 characters)')
    }
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'manual_in',
      amount,
      description,
      justification,
      gameId: null,
      createdAt: new Date()
    }
    
    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Add manual exit (expense)
   */
  async addManualExit(amount: Money, description: string, justification: string): Promise<Transaction> {
    if (amount >= 0) throw new Error('Amount must be negative for exits')
    if (!justification || justification.length < 5) {
      throw new Error('Justification required (min 5 characters)')
    }
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'manual_out',
      amount,
      description,
      justification,
      gameId: null,
      createdAt: new Date()
    }
    
    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Calculate cash summary
   */
  async getCashSummary(): Promise<CashSummary> {
    const transactions = await db.transactions.toArray()
    
    const totalIn = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) as Money
    
    const totalOut = Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    ) as Money
    
    const currentBalance = (totalIn - totalOut) as Money
    
    const lastTransaction = transactions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0]
    
    return {
      currentBalance,
      totalIn,
      totalOut,
      transactionCount: transactions.length,
      lastUpdatedAt: lastTransaction?.createdAt ?? new Date()
    }
  },

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.getAllTransactions()
    return transactions.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    )
  }
}
