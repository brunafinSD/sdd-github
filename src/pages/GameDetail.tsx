// T058, T060, T095: GameDetail page — editar lista de presença para jogos pendentes

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Spinner } from '@/components/ui/Spinner'
import { PlayerList } from '@/components/game/PlayerList'
import { type PlayerFormData } from '@/components/game/PlayerRow'
import { useWhatsAppParser } from '@/hooks/useWhatsAppParser'
import { formatMoney, toMoney, type Money } from '@/types/money'
import type { PaymentMethod } from '@/types/game'
import { toast } from '@/store/toastStore'

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pending: { variant: 'warning', label: 'Pendente' },
  finished: { variant: 'success', label: 'Concluído' },
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    currentGame, loading,
    getGameById, updateGame,
    addPlayer, updatePlayer, removePlayer,
    finalizeGame,
  } = useGameStore()
  const { loadSummary } = useCashStore()

  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualName, setManualName] = useState('')

  // Edit state for pending games (local until saved)
  const [editDate, setEditDate] = useState('')
  const [editCourtCostCents, setEditCourtCostCents] = useState<Money>(toMoney(0))

  const { rawText, setRawText, parse, clear: clearWhatsApp } = useWhatsAppParser()

  useEffect(() => {
    if (id) getGameById(id)
  }, [id, getGameById])

  // Sync local edit state when game loads
  useEffect(() => {
    if (currentGame) {
      setEditDate(currentGame.date.toISOString().split('T')[0])
      setEditCourtCostCents(currentGame.courtCost)
    }
  }, [currentGame?.id])

  if (loading || !currentGame) {
    return (
      <div className="min-h-screen bg-brand-gray-light flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const isEditable = currentGame.status !== 'finished'

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(currentGame.date)

  const players: PlayerFormData[] = currentGame.players.map(p => ({
    id: p.id,
    name: p.name,
    paymentMethod: p.paymentMethod,
    amountPaid: p.amountPaid
  }))

  // --- Handlers ---

  const handleChangePayment = async (playerId: string, method: PaymentMethod) => {
    await updatePlayer(playerId, { paymentMethod: method })
  }

  const handleChangeAmount = async (playerId: string, amount: Money) => {
    await updatePlayer(playerId, { amountPaid: amount })
  }

  const handleRemove = async (playerId: string) => {
    await removePlayer(playerId)
  }

  const handleAddManual = async () => {
    const name = manualName.trim()
    if (name.length < 2) return
    await addPlayer(currentGame.id, {
      name,
      paymentMethod: 'pix',
      amountPaid: toMoney(10),
    })
    setManualName('')
  }

  const handleWhatsAppImport = async () => {
    const names = parse()
    if (names.length === 0) return
    for (const name of names) {
      if (name.trim().length >= 2) {
        await addPlayer(currentGame.id, {
          name: name.trim(),
          paymentMethod: 'pix',
          amountPaid: toMoney(10),
        })
      }
    }
    clearWhatsApp()
  }

  const handleSaveInfo = async () => {
    const newDate = new Date(editDate + 'T12:00:00')
    await updateGame(currentGame.id, { date: newDate, courtCost: editCourtCostCents })
  }

  const handleFinalizeClick = () => {
    if (currentGame.players.length === 0) {
      setError('Adicione pelo menos um jogador antes de finalizar.')
      return
    }
    setError(null)
    setShowConfirm(true)
  }

  const handleConfirmFinalize = async () => {
    setShowConfirm(false)
    try {
      // Persist any date/cost edits first
      await handleSaveInfo()
      await finalizeGame(currentGame.id)
      await loadSummary()
      toast.success('Jogo finalizado e caixa atualizado!')
      navigate('/')
    } catch (err) {
      const msg = (err as Error).message
      setError(msg)
      toast.error(msg)
    }
  }

  const { variant, label } = statusConfig[currentGame.status] ?? statusConfig['pending']

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <Header title="Detalhes do Jogo" onBack={() => navigate('/')} />

      <Container maxWidth="md">
        <div className="space-y-6 py-6">

          {/* Game info */}
          <Card padding="md">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-gray-dark">
                {isEditable ? 'Informações do Jogo' : <span className="capitalize">{formattedDate}</span>}
              </h2>
              <Badge variant={variant}>{label}</Badge>
            </div>

            {isEditable ? (
              /* Editable fields for pending games */
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data do jogo"
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                />
                <CurrencyInput
                  label="Custo da quadra (R$)"
                  value={editCourtCostCents}
                  onChange={setEditCourtCostCents}
                />
              </div>
            ) : (
              /* Read-only for finished games */
              <>
                <p className="text-sm text-gray-500 capitalize">{formattedDate}</p>
                <p className="text-sm text-gray-500 mt-1">Quadra: {formatMoney(currentGame.courtCost)}</p>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mt-3 ${
                  currentGame.cashImpact >= 0 ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'
                }`}>
                  <span className="text-sm font-medium">Impacto no caixa:</span>
                  <span className="text-base font-bold">
                    {currentGame.cashImpact >= 0 ? '+' : ''}{formatMoney(currentGame.cashImpact)}
                  </span>
                </div>
              </>
            )}
          </Card>

          {/* WhatsApp import — only for editable games */}
          {isEditable && (
            <Card padding="md">
              <h2 className="text-lg font-bold text-brand-gray-dark mb-4">Importar do WhatsApp</h2>
              <textarea
                className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                placeholder="Cole aqui a lista de presença do WhatsApp..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                aria-label="Lista do WhatsApp"
              />
              <Button
                onClick={handleWhatsAppImport}
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={!rawText.trim()}
              >
                Importar Lista
              </Button>
            </Card>
          )}

          {/* Manual add — only for editable games */}
          {isEditable && (
            <Card padding="md">
              <h2 className="text-lg font-bold text-brand-gray-dark mb-4">Adicionar Jogador</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do jogador"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                />
                <Button onClick={handleAddManual} variant="secondary" size="md" className="shrink-0">
                  Adicionar
                </Button>
              </div>
            </Card>
          )}

          {/* Players */}
          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-4">
              Jogadores ({players.length})
            </h2>
            <PlayerList
              players={players}
              courtCost={currentGame.courtCost}
              editable={isEditable}
              onChangePayment={handleChangePayment}
              onChangeAmount={handleChangeAmount}
              onRemove={handleRemove}
            />
          </Card>

          {/* Error */}
          {error && (
            <p className="text-sm text-brand-red bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3" role="alert">
              {error}
            </p>
          )}

          {/* Finalize button — only if editable */}
          {isEditable && (
            <Button
              onClick={handleFinalizeClick}
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Finalizar Jogo'}
            </Button>
          )}
        </div>
      </Container>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-brand-gray-dark mb-2">Finalizar jogo?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Isso irá registrar {players.length} jogador{players.length !== 1 ? 'es' : ''} e atualizar o saldo do caixa. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="primary" fullWidth onClick={handleConfirmFinalize} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
