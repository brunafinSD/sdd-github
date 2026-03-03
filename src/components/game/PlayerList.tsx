// T051, T064: PlayerList component with summary footer

import type { Money } from '@/types/money'
import { formatMoney } from '@/types/money'
import type { PaymentMethod } from '@/types/game'
import { PlayerRow, type PlayerFormData } from './PlayerRow'

interface PlayerListProps {
  players: PlayerFormData[]
  courtCost: Money
  editable?: boolean
  onChangePayment?: (id: string, method: PaymentMethod) => void
  onChangeAmount?: (id: string, amount: Money) => void
  onRemove?: (id: string) => void
}

export function PlayerList({
  players,
  courtCost,
  editable = true,
  onChangePayment,
  onChangeAmount,
  onRemove
}: PlayerListProps) {
  const totalPaid = players.reduce((sum, p) => sum + p.amountPaid, 0) as Money
  const cashImpact = (totalPaid - courtCost) as Money

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">Nenhum jogador adicionado</p>
        <p className="text-xs mt-1">Cole a lista do WhatsApp ou adicione manualmente</p>
      </div>
    )
  }

  return (
    <div>
      {/* Player rows */}
      <div>
        {players.map(player => (
          <PlayerRow
            key={player.id}
            player={player}
            editable={editable}
            onChangePayment={onChangePayment}
            onChangeAmount={onChangeAmount}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Jogadores</span>
          <span className="font-medium">{players.length}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total arrecadado</span>
          <span className="font-medium text-brand-green">{formatMoney(totalPaid)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Custo da quadra</span>
          <span className="font-medium text-brand-red">- {formatMoney(courtCost)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>Impacto no caixa</span>
          <span className={cashImpact >= 0 ? 'text-brand-green' : 'text-brand-red'}>
            {cashImpact >= 0 ? '+' : ''}{formatMoney(cashImpact)}
          </span>
        </div>
      </div>
    </div>
  )
}
