// T078, T087, T088, T089: TransactionListItem component

import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatMoney } from '@/types/money'
import type { Transaction } from '@/types/cash'

interface TransactionListItemProps {
  transaction: Transaction
}

const typeConfig: Record<
  Transaction['type'],
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  game:       { label: 'Jogo',           variant: 'info' },
  manual_in:  { label: 'Entrada',        variant: 'success' },
  manual_out: { label: 'Saída',          variant: 'danger' },
  transfer:   { label: 'Quadra → ADM',  variant: 'default' },
}

// T089: Date formatting helper
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const navigate = useNavigate()
  const { type, amount, description, createdAt, gameId } = transaction
  const { label, variant } = typeConfig[type] ?? typeConfig.manual_in

  // T088: Click-through to game detail for game transactions
  const isClickable = type === 'game' && !!gameId
  const handleClick = () => {
    if (isClickable) navigate(`/game/${gameId}`)
  }

  const isPositive = amount >= 0
  // Transfers are neutral — court→adm doesn't change total
  const isTransfer = type === 'transfer'

  return (
    <li
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={e => isClickable && e.key === 'Enter' && handleClick()}
      className={`
        flex items-center justify-between gap-3 py-3
        border-b border-gray-100 last:border-0
        ${isClickable ? 'cursor-pointer hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors' : ''}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* T087: type badge */}
        <Badge variant={variant}>{label}</Badge>

        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-gray-dark truncate">{description}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(createdAt)}</p>
        </div>
      </div>

      <span
        className={`text-sm font-bold shrink-0 ${
          isTransfer
            ? 'text-brand-gray-dark'
            : isPositive ? 'text-brand-green' : 'text-brand-red'
        }`}
      >
        {isTransfer ? formatMoney(amount) : `${isPositive ? '+' : ''}${formatMoney(amount)}`}
      </span>
    </li>
  )
}
