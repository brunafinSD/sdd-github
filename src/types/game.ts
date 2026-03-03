// T011, T013, T014: Game-related types

import type { Money } from './money'

/**
 * Game status enum
 * - pending: jogo salvo mas ainda não finalizado
 * - finished: jogo finalizado, caixa atualizado
 */
export type GameStatus = 'pending' | 'finished'

/**
 * Payment method enum
 */
export type PaymentMethod = 'pix' | 'on_court'

/**
 * Game entity - represents a futsal game
 */
export interface Game {
  id: string
  date: Date
  status: GameStatus
  courtCost: Money
  players: Player[]
  cashImpact: Money
  createdAt: Date
  updatedAt: Date
  finalishedAt: Date | null
}

/**
 * Player entity - represents a player in a game
 */
export interface Player {
  id: string
  gameId: string
  name: string
  paymentMethod: PaymentMethod
  amountPaid: Money
  addedAt: Date
}
