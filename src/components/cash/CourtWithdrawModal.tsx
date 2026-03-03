// T016 (002-dual-cash-split): CourtWithdrawModal — saque do caixa quadra

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { formatMoney, toMoney, type Money } from '@/types/money'
import type { Game } from '@/types/game'

type Mode = 'transfer' | 'credit'

// ─── Transfer schema ───────────────────────────────────────────────────────────
const transferSchema = z.object({
  amount: z
    .string()
    .min(1, 'Informe o valor')
    .refine(v => parseFloat(v.replace(',', '.')) > 0, 'O valor deve ser maior que zero'),
  description: z.string().max(200).optional()
})

type TransferFormData = z.infer<typeof transferSchema>

// ─── Credit schema ─────────────────────────────────────────────────────────────
const creditSchema = z.object({
  gameId: z.string().min(1, 'Selecione um jogo'),
  amount: z
    .string()
    .min(1, 'Informe o valor')
    .refine(v => parseFloat(v.replace(',', '.')) > 0, 'O valor deve ser maior que zero')
})

type CreditFormData = z.infer<typeof creditSchema>

// ─── Props ─────────────────────────────────────────────────────────────────────
interface CourtWithdrawModalProps {
  courtBalance: Money
  /** Finished games whose cashImpact < 0 (still in deficit) */
  negativeGames: Game[]
  onClose: () => void
  onTransfer: (amount: Money, description?: string) => Promise<void>
  onApplyCredit: (gameId: string, amount: Money) => Promise<void>
}

// ─── Transfer sub-form ─────────────────────────────────────────────────────────
function TransferForm({
  courtBalance,
  onTransfer,
  onClose
}: {
  courtBalance: Money
  onTransfer: CourtWithdrawModalProps['onTransfer']
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<TransferFormData>({ resolver: zodResolver(transferSchema) })

  const onSubmit = async (data: TransferFormData) => {
    const amount = toMoney(parseFloat(data.amount.replace(',', '.')))
    if (amount > courtBalance) {
      setError('amount', { message: `Saldo insuficiente. Disponível: ${formatMoney(courtBalance)}` })
      return
    }
    setSubmitting(true)
    try {
      await onTransfer(amount, data.description || undefined)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" noValidate>
      <Input
        label="Valor (R$)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        error={errors.amount?.message}
        {...register('amount')}
      />
      <Input
        label="Observação (opcional)"
        placeholder="Ex: Pagar a quadra..."
        {...register('description')}
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : 'Confirmar'}
        </Button>
      </div>
    </form>
  )
}

// ─── Credit sub-form ───────────────────────────────────────────────────────────
function CreditForm({
  courtBalance,
  negativeGames,
  onApplyCredit,
  onClose
}: {
  courtBalance: Money
  negativeGames: Game[]
  onApplyCredit: CourtWithdrawModalProps['onApplyCredit']
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm<CreditFormData>({ resolver: zodResolver(creditSchema) })

  const selectedGameId = watch('gameId')
  const selectedGame = negativeGames.find(g => g.id === selectedGameId)
  // Max credit = the game's deficit (abs of negative cashImpact)
  const maxCredit = selectedGame ? Math.abs(selectedGame.cashImpact) as Money : null

  const onSubmit = async (data: CreditFormData) => {
    const amount = toMoney(parseFloat(data.amount.replace(',', '.')))
    if (amount > courtBalance) {
      setError('amount', { message: `Saldo insuficiente. Disponível: ${formatMoney(courtBalance)}` })
      return
    }
    if (maxCredit !== null && amount > maxCredit) {
      setError('amount', {
        message: `Valor maior que o que falta do jogo (${formatMoney(maxCredit)})`
      })
      return
    }
    setSubmitting(true)
    try {
      await onApplyCredit(data.gameId, amount)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-brand-gray-dark mb-1">
          Jogo com saldo negativo <span className="text-brand-red">*</span>
        </label>
        <select
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue ${
            errors.gameId ? 'border-brand-red' : 'border-gray-300'
          }`}
          {...register('gameId')}
          defaultValue=""
        >
          <option value="" disabled>Selecione um jogo...</option>
          {negativeGames.map(game => (
            <option key={game.id} value={game.id}>
              {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(game.date)}
              {' — '}
              {game.players.length} jogadores — faltando {formatMoney(Math.abs(game.cashImpact) as Money)}
            </option>
          ))}
        </select>
        {errors.gameId && (
          <p className="mt-1 text-sm text-brand-red">{errors.gameId.message}</p>
        )}
      </div>

      <Input
        label="Valor a abater (R$)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      {maxCredit !== null && (
        <p className="text-xs text-gray-500">
          Valor faltante do jogo: <span className="text-brand-red font-medium">{formatMoney(maxCredit)}</span>
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : 'Confirmar'}
        </Button>
      </div>
    </form>
  )
}

// ─── Main modal ────────────────────────────────────────────────────────────────
export function CourtWithdrawModal({
  courtBalance,
  negativeGames,
  onClose,
  onTransfer,
  onApplyCredit
}: CourtWithdrawModalProps) {
  const [mode, setMode] = useState<Mode>('transfer')
  const hasCreditGames = negativeGames.length > 0

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="court-withdraw-title"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 id="court-withdraw-title" className="text-lg font-bold text-brand-gray-dark">
            Saque do Caixa Quadra
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Disponível: <span className="font-semibold text-brand-gray-dark">{formatMoney(courtBalance)}</span>
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode('transfer')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
              mode === 'transfer'
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            Transferir para ADM
          </button>
          {hasCreditGames && (
            <button
              type="button"
              onClick={() => setMode('credit')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                mode === 'credit'
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Abater em jogo
            </button>
          )}
        </div>

        {/* Sub-form */}
        {mode === 'transfer' ? (
          <TransferForm courtBalance={courtBalance} onTransfer={onTransfer} onClose={onClose} />
        ) : (
          <CreditForm
            courtBalance={courtBalance}
            negativeGames={negativeGames}
            onApplyCredit={onApplyCredit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
