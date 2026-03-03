// T002 (002-dual-cash-split): Zod schema for Transaction validation with cashTarget

import { z } from 'zod'

export const transactionTypeSchema = z.enum(['game', 'manual_in', 'manual_out', 'transfer'])

export const cashTargetSchema = z.enum(['court', 'adm'])

export const transactionSchema = z.object({
  id: z.string().uuid(),
  type: transactionTypeSchema,
  amount: z.number().int(), // Money in cents, can be negative
  description: z.string().min(1).max(500),
  justification: z.string().min(5).max(500).nullable(),
  gameId: z.string().uuid().nullable(),
  cashTarget: cashTargetSchema,
  createdAt: z.date()
}).refine(data => {
  // Type-specific validations
  if (data.type === 'game') {
    return data.gameId !== null && data.justification === null
  }
  if (data.type === 'manual_in') {
    return data.gameId === null && data.justification !== null && data.amount > 0
  }
  if (data.type === 'manual_out') {
    return data.gameId === null && data.justification !== null && data.amount < 0
  }
  if (data.type === 'transfer') {
    return data.gameId === null && data.amount > 0 && data.cashTarget === 'court'
  }
  return false
}, {
  message: 'Transaction type validation failed'
})

export type TransactionInput = z.infer<typeof transactionSchema>
