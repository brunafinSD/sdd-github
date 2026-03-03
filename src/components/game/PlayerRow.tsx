// T050, T062, T063: PlayerRow component - name, payment toggle, amount input

import { formatMoney, toMoney, type Money } from '@/types/money'
import type { PaymentMethod } from '@/types/game'
import { Input } from '@/components/ui/Input'

export interface PlayerFormData {
  id: string
  name: string
  paymentMethod: PaymentMethod
  amountPaid: Money
}

interface PlayerRowProps {
  player: PlayerFormData
  editable?: boolean
  onChangePayment?: (id: string, method: PaymentMethod) => void
  onChangeAmount?: (id: string, amount: Money) => void
  onRemove?: (id: string) => void
}

export function PlayerRow({ player, editable = true, onChangePayment, onChangeAmount, onRemove }: PlayerRowProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(',', '.')) || 0
    onChangeAmount?.(player.id, toMoney(value))
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Name */}
      <span className="flex-1 text-sm font-medium text-brand-gray-dark truncate">
        {player.name}
      </span>

      {/* Payment method toggle */}
      {editable ? (
        <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => onChangePayment?.(player.id, 'pix')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              player.paymentMethod === 'pix'
                ? 'bg-brand-blue text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            PIX
          </button>
          <button
            type="button"
            onClick={() => onChangePayment?.(player.id, 'on_court')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              player.paymentMethod === 'on_court'
                ? 'bg-brand-yellow text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Na Quadra
          </button>
        </div>
      ) : (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          player.paymentMethod === 'pix'
            ? 'bg-brand-blue text-white'
            : 'bg-brand-yellow text-white'
        }`}>
          {player.paymentMethod === 'pix' ? 'PIX' : 'Na Quadra'}
        </span>
      )}

      {/* Amount */}
      {editable ? (
        <div className="w-24 shrink-0">
          <Input
            type="number"
            step="0.01"
            min="0"
            defaultValue={(player.amountPaid / 100).toFixed(2)}
            onChange={handleAmountChange}
            className="text-right text-sm py-1.5"
            aria-label={`Valor pago por ${player.name}`}
          />
        </div>
      ) : (
        <span className="text-sm font-medium text-brand-green w-24 text-right shrink-0">
          {formatMoney(player.amountPaid)}
        </span>
      )}

      {/* Remove button */}
      {editable && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          className="text-gray-400 hover:text-brand-red transition-colors shrink-0"
          aria-label={`Remover ${player.name}`}
        >
          ✕
        </button>
      )}
    </div>
  )
}
