// T012 (002-dual-cash-split): CashBreakdown — dual cash drawer sub-display

import { formatMoney, type Money } from '@/types/money'

interface CashBreakdownProps {
  courtBalance: Money
  admBalance: Money
}

/**
 * Displays court and ADM balances side by side in a compact row.
 * Renders below the total balance in CashDisplay.
 * Negative values render in brand-red.
 */
export function CashBreakdown({ courtBalance, admBalance }: CashBreakdownProps) {
  const courtNegative = courtBalance < 0
  const admNegative = admBalance < 0

  return (
    <div
      className="flex items-center justify-center gap-2 mt-4 text-xs"
      aria-label={`Quadra: ${formatMoney(courtBalance)}, ADM: ${formatMoney(admBalance)}`}
    >
      <span className={courtNegative ? 'text-brand-red' : 'text-gray-400'}>
        Quadra {formatMoney(courtBalance)}
      </span>
      <span className="text-gray-200">·</span>
      <span className={admNegative ? 'text-brand-red' : 'text-gray-400'}>
        ADM {formatMoney(admBalance)}
      </span>
    </div>
  )
}
