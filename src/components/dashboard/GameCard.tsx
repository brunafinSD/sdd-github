// T040: GameCard component - displays game summary

import { formatMoney, type Money } from '@/types/money'
import type { GameStatus } from '@/types/game'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface GameCardProps {
  id: string
  date: Date
  status: GameStatus
  playerCount: number
  cashImpact?: Money
  onClick?: () => void
}

export function GameCard({ 
  date, 
  status, 
  playerCount, 
  cashImpact, 
  onClick 
}: GameCardProps) {
  // Format date
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
  
  // Status badge
  const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
    pending: { variant: 'warning', label: 'Pendente' },
    finished: { variant: 'success', label: 'Concluído' },
  }

  const { variant, label } = statusConfig[status] ?? statusConfig['pending']
  
  // Cash impact color
  const impactColor = cashImpact && cashImpact < 0 
    ? 'text-brand-red' 
    : 'text-brand-green'
  
  return (
    <Card 
      padding="md" 
      hover={!!onClick}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={variant}>{label}</Badge>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          
          <p className="text-sm text-brand-gray-dark">
            <span className="font-medium">{playerCount}</span> jogador{playerCount !== 1 ? 'es' : ''}
          </p>
        </div>
        
        {status === 'finished' && cashImpact !== undefined && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Impacto</p>
            <p className={`text-lg font-bold ${impactColor}`}>
              {formatMoney(cashImpact)}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
