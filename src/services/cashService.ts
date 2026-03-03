// T004-T006 (002-dual-cash-split): Cash service with dual-cash support

import { db } from './db'
import type { Transaction, Transfer, CashSummary, CashTarget } from '@/types/cash'
import type { Money } from '@/types/money'

export const cashService = {
  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.transactions.orderBy('createdAt').reverse().toArray()
  },

  /**
   * Get all transfers (court → adm internal moves)
   */
  async getAllTransfers(): Promise<Transfer[]> {
    return await db.transfers.orderBy('createdAt').reverse().toArray()
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id)
  },

  /**
   * Create transaction from game finalization.
   * Each player payment is routed to the correct cash drawer via cashTarget.
   */
  async createGameTransaction(
    gameId: string,
    amount: Money,
    description: string,
    cashTarget: CashTarget
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'game',
      amount,
      description,
      justification: null,
      gameId,
      cashTarget,
      createdAt: new Date()
    }

    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Add manual entry (income) — cashTarget selects which drawer receives
   */
  async addManualEntry(
    amount: Money,
    description: string,
    justification: string,
    cashTarget: CashTarget
  ): Promise<Transaction> {
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
      cashTarget,
      createdAt: new Date()
    }

    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Add manual exit (expense) — cashTarget selects which drawer is debited
   */
  async addManualExit(
    amount: Money,
    description: string,
    justification: string,
    cashTarget: CashTarget
  ): Promise<Transaction> {
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
      cashTarget,
      createdAt: new Date()
    }

    await db.transactions.add(transaction)
    return transaction
  },

  /**
   * Create an internal transfer from court cash → ADM cash.
   * Validates that amount > 0 and does not exceed courtBalance.
   * Does NOT change totalBalance — redistributes between drawers.
   */
  async createTransfer(amount: Money, description?: string): Promise<Transfer> {
    if (amount <= 0) throw new Error('Transfer amount must be positive')

    const summary = await this.getCashSummary()
    if (amount > summary.courtBalance) {
      throw new Error(
        `Saldo insuficiente no caixa quadra. Disponível: R$ ${(summary.courtBalance / 100).toFixed(2)}`
      )
    }

    const transfer: Transfer = {
      id: crypto.randomUUID(),
      amount,
      description: description ?? null,
      createdAt: new Date()
    }

    await db.transfers.add(transfer)
    return transfer
  },

  /**
   * Calculate dual-cash summary.
   *
   * courtBalance = Σ(transactions WHERE cashTarget='court' AND amount > 0)
   *              - Σ(transactions WHERE cashTarget='court' AND amount < 0)
   *              - Σ(transfers.amount)
   *
   * admBalance   = Σ(transactions WHERE cashTarget='adm' AND amount > 0)
   *              - Σ(transactions WHERE cashTarget='adm' AND amount < 0)
   *              + Σ(transfers.amount)
   *
   * totalBalance = courtBalance + admBalance
   */
  async getCashSummary(): Promise<CashSummary> {
    const [transactions, transfers] = await Promise.all([
      db.transactions.toArray(),
      db.transfers.toArray()
    ])

    const totalTransferAmount = transfers.reduce((sum, t) => sum + t.amount, 0)

    const courtIn = transactions
      .filter(t => t.cashTarget === 'court' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const courtOut = Math.abs(
      transactions
        .filter(t => t.cashTarget === 'court' && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const admIn = transactions
      .filter(t => t.cashTarget === 'adm' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const admOut = Math.abs(
      transactions
        .filter(t => t.cashTarget === 'adm' && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const courtBalance = (courtIn - courtOut - totalTransferAmount) as Money
    const admBalance = (admIn - admOut + totalTransferAmount) as Money
    const totalBalance = (courtBalance + admBalance) as Money

    const totalIn = (courtIn + admIn) as Money
    const totalOut = (courtOut + admOut) as Money

    const lastTransaction = [...transactions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0]

    return {
      totalBalance,
      courtBalance,
      admBalance,
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
