// T039: CashDisplay component - displays cash balance with visual feedback

import { useMemo } from 'react'
import { formatMoney, type Money } from '@/types/money'
import { Card } from '@/components/ui/Card'

interface CashDisplayProps {
  balance: Money
  loading?: boolean
}

export function CashDisplay({ balance, loading = false }: CashDisplayProps) {
  const isNegative = balance < 0
  
  // Determine color based on balance
  const colorClass = useMemo(() => {
    if (isNegative) return 'text-brand-red'
    if (balance === 0) return 'text-brand-gray-dark'
    return 'text-brand-green'
  }, [balance, isNegative])
  
  return (
    <Card padding="lg" className="text-center">
      <h2 className="text-lg font-medium text-brand-gray-dark mb-2">
        Saldo do Caixa
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          <p 
            className={`text-5xl font-bold ${colorClass} transition-colors`}
            aria-label={`Saldo do caixa: ${formatMoney(balance)}`}
          >
            {formatMoney(balance)}
          </p>
          
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
