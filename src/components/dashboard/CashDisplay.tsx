// T013 (002-dual-cash-split): CashDisplay with dual-cash breakdown

import { useMemo } from 'react'
import { formatMoney, type Money } from '@/types/money'
import { Card } from '@/components/ui/Card'
import { CashBreakdown } from './CashBreakdown'

interface CashDisplayProps {
  balance: Money
  courtBalance?: Money
  admBalance?: Money
  loading?: boolean
}

export function CashDisplay({ balance, courtBalance, admBalance, loading = false }: CashDisplayProps) {
  const isNegative = balance < 0

  // Determine color based on balance
  const colorClass = useMemo(() => {
    if (isNegative) return 'text-brand-red'
    if (balance === 0) return 'text-brand-gray-dark'
    return 'text-brand-green'
  }, [balance, isNegative])

  const showBreakdown = courtBalance !== undefined && admBalance !== undefined

  return (
    <Card padding="lg" className="text-center">
      <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
        Saldo do Caixa
      </h2>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-4 gap-2">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          <p
            className={`text-4xl font-bold ${colorClass} transition-colors`}
            aria-label={`Saldo do caixa: ${formatMoney(balance)}`}
          >
            {formatMoney(balance)}
          </p>

          {showBreakdown && (
            <CashBreakdown
              courtBalance={courtBalance as Money}
              admBalance={admBalance as Money}
            />
          )}

          {isNegative && (
            <div
              className="mt-4 p-3 bg-brand-red/10 border border-brand-red/30 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-brand-red font-medium">
                ⚠️ Caixa negativo! O time está em débito.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
