// T001 (002-dual-cash-split): Cash/Transaction types with dual-cash support

import type { Money } from './money'

/**
 * Target cash drawer for a transaction or adjustment
 */
export type CashTarget = 'court' | 'adm'

/**
 * Transaction type enum
 * 'transfer' is used for internal court → adm transfers (history display only)
 */
export type TransactionType = 'game' | 'manual_in' | 'manual_out' | 'transfer'

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
  /** Which cash drawer this transaction affects */
  cashTarget: CashTarget
  createdAt: Date
}

/**
 * Internal transfer from court cash → ADM cash.
 * Does NOT change totalBalance; redistributes between drawers.
 */
export interface Transfer {
  id: string
  /** Always > 0 and <= courtBalance at time of creation */
  amount: Money
  description: string | null
  createdAt: Date
}

/**
 * Cash summary - calculated dynamically from all transactions + transfers
 */
export interface CashSummary {
  /** court + adm */
  totalBalance: Money
  /** Physical cash collected on court */
  courtBalance: Money
  /** PIX + manual entries + transfers received */
  admBalance: Money
  totalIn: Money
  totalOut: Money
  transactionCount: number
  lastUpdatedAt: Date
}
