// T012, T015, T016: Cash/Transaction types

import type { Money } from './money'

/**
 * Transaction type enum
 */
export type TransactionType = 'game' | 'manual_in' | 'manual_out'

/**
 * Transaction entity - represents a cash movement
 */
export interface Transaction {
  id: string
  type: TransactionType
  amount: Money
  description: string
  justification: string | null
  gameId: string | null
  createdAt: Date
}

/**
 * Cash summary - calculated dynamically
 */
export interface CashSummary {
  currentBalance: Money
  totalIn: Money
  totalOut: Money
  transactionCount: number
  lastUpdatedAt: Date
}
