// T017, T018: Zod schemas for Game and Player validation

import { z } from 'zod'

export const gameStatusSchema = z.enum(['pending', 'finished'])

export const paymentMethodSchema = z.enum(['pix', 'on_court'])

export const playerSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  paymentMethod: paymentMethodSchema,
  amountPaid: z.number().int().positive().default(1000), // Default R$ 10.00
  addedAt: z.date()
})

export const gameSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  status: gameStatusSchema,
  courtCost: z.number().int().nonnegative(), // Money in cents
  players: z.array(playerSchema),
  cashImpact: z.number().int(), // Can be negative
  createdAt: z.date(),
  updatedAt: z.date(),
  finishedAt: z.date().nullable()
})

export type GameInput = z.infer<typeof gameSchema>
export type PlayerInput = z.infer<typeof playerSchema>
