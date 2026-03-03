// T024: Calculate cash impact for a game

import type { Money } from '@/types/money'
import { toMoney } from '@/types/money'

/**
 * Calculate cash impact for a game
 * Formula: sum(all player.amountPaid) - courtCost
 * 
 * @param players - Array of players in the game
 * @param courtCost - Cost of court in cents (default R$ 90.00)
 * @returns Cash impact in cents (can be negative)
 */
export function calculateCashImpact(
  players: Array<{ amountPaid: Money }>,
  courtCost: Money = toMoney(90)
): Money {
  const revenue = players.reduce((sum, p) => sum + p.amountPaid, 0)
  return (revenue - courtCost) as Money
}
