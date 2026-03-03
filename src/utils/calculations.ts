// T010 (002-dual-cash-split): Cash impact calculations — single + dual-drawer

import type { Money } from '@/types/money'
import { toMoney } from '@/types/money'
import type { PaymentMethod } from '@/types/game'

/**
 * Calculate total cash impact for a game (legacy — total only).
 * Formula: sum(all player.amountPaid) - courtCost
 */
export function calculateCashImpact(
  players: Array<{ amountPaid: Money }>,
  courtCost: Money = toMoney(90)
): Money {
  const revenue = players.reduce((sum, p) => sum + p.amountPaid, 0)
  return (revenue - courtCost) as Money
}

/**
 * Calculate cash impact split by payment method.
 * Used by finalizeGame() to route payments to the correct cash drawer.
 *
 * - on_court → court cash (physical money collected at the venue)
 * - pix      → adm cash (digital transfer)
 *
 * Court cost is deducted proportionally from the court drawer since
 * that is where on-court payments accumulate.
 *
 * @returns { court, adm } — both can be negative if courtCost > on_court revenue
 */
export function calculateCashImpactByTarget(
  players: Array<{ amountPaid: Money; paymentMethod: PaymentMethod }>,
  courtCost: Money = toMoney(90)
): { court: Money; adm: Money } {
  const courtRevenue = players
    .filter(p => p.paymentMethod === 'on_court')
    .reduce((sum, p) => sum + p.amountPaid, 0)

  const admRevenue = players
    .filter(p => p.paymentMethod === 'pix')
    .reduce((sum, p) => sum + p.amountPaid, 0)

  // Court cost is debited from court drawer only
  const courtImpact = (courtRevenue - courtCost) as Money
  const admImpact = admRevenue as Money

  return { court: courtImpact, adm: admImpact }
}
