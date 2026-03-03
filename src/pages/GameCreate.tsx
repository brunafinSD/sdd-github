// T057, T065, T066, T095: GameCreate page — salvar como pendente ou finalizar diretamente

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Spinner } from '@/components/ui/Spinner'
import { PlayerList } from '@/components/game/PlayerList'
import { type PlayerFormData } from '@/components/game/PlayerRow'
import { useWhatsAppParser } from '@/hooks/useWhatsAppParser'
import { toMoney, type Money } from '@/types/money'
import type { PaymentMethod } from '@/types/game'
import { toast } from '@/store/toastStore'

export function GameCreate() {
  const navigate = useNavigate()
  const { createGame, addPlayer, finalizeGame, loading } = useGameStore()
  const { loadSummary } = useCashStore()

  // Form state
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [courtCostCents, setCourtCostCents] = useState<Money>(toMoney(90))
  const [players, setPlayers] = useState<PlayerFormData[]>([])
  const [manualName, setManualName] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<'save' | 'finalize'>('finalize')
  const [error, setError] = useState<string | null>(null)

  // WhatsApp parser
  const { rawText, setRawText, parse, clear: clearWhatsApp } = useWhatsAppParser()

  const courtCost = courtCostCents

  const addPlayerFromName = (name: string) => {
    const trimmed = name.trim()
    if (trimmed.length < 2) return
    const newPlayer: PlayerFormData = {
      id: crypto.randomUUID(),
      name: trimmed,
      paymentMethod: 'pix',
      amountPaid: toMoney(10)
    }
    setPlayers(prev => [...prev, newPlayer])
  }

  const handleWhatsAppImport = () => {
    const names = parse()
    if (names.length === 0) return
    names.forEach(addPlayerFromName)
    clearWhatsApp()
  }

  const handleAddManual = () => {
    if (manualName.trim().length < 2) return
    addPlayerFromName(manualName)
    setManualName('')
  }

  const handleChangePayment = (id: string, method: PaymentMethod) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, paymentMethod: method } : p))
  }

  const handleChangeAmount = (id: string, amount: Money) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, amountPaid: amount } : p))
  }

  const handleRemove = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const handleSaveClick = () => {
    if (players.length === 0) {
      setError('Adicione pelo menos um jogador antes de salvar.')
      return
    }
    setError(null)
    setPendingAction('save')
    setShowConfirm(true)
  }

  const handleFinalizeClick = () => {
    // T065: Validate players exist
    if (players.length === 0) {
      setError('Adicione pelo menos um jogador antes de finalizar.')
      return
    }
    setError(null)
    setPendingAction('finalize')
    // T066: Show confirmation dialog
    setShowConfirm(true)
  }

  const handleConfirmFinalize = async () => {
    setShowConfirm(false)
    try {
      // Create game
      const game = await createGame({
        date: new Date(date + 'T12:00:00'),
        courtCost: courtCostCents
      })

      // Add all players
      for (const player of players) {
        await addPlayer(game.id, {
          name: player.name,
          paymentMethod: player.paymentMethod,
          amountPaid: player.amountPaid
        })
      }

      if (pendingAction === 'finalize') {
        // Finalize game and update cash
        await finalizeGame(game.id)
        await loadSummary()
        toast.success('Jogo finalizado e caixa atualizado!')
      } else {
        toast.success('Jogo salvo como pendente.')
      }

      // Navigate back to dashboard
      navigate('/')
    } catch (err) {
      const msg = (err as Error).message
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <Header title="Novo Jogo" onBack={() => navigate('/')} />

      <Container maxWidth="md">
        <div className="space-y-6 py-6">

          {/* Game info */}
          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-4">Informações do Jogo</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data do jogo"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              {/* T061: Editable court cost */}
              <CurrencyInput
                label="Custo da quadra (R$)"
                value={courtCostCents}
                onChange={setCourtCostCents}
              />
            </div>
          </Card>

          {/* WhatsApp import */}
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

          {/* Manual add */}
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

          {/* Player list */}
          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-4">
              Jogadores ({players.length})
            </h2>
            <PlayerList
              players={players}
              courtCost={courtCost}
              editable
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

          {/* Actions: save pending (primary) or finalize immediately (secondary) */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSaveClick}
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading && pendingAction === 'save' ? <Spinner size="sm" /> : 'Salvar como Pendente'}
            </Button>
            <Button
              onClick={handleFinalizeClick}
              variant="secondary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading && pendingAction === 'finalize' ? <Spinner size="sm" /> : 'Finalizar Jogo'}
            </Button>
          </div>
        </div>
      </Container>

      {/* T066: Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            {pendingAction === 'finalize' ? (
              <>
                <h3 className="text-lg font-bold text-brand-gray-dark mb-2">Finalizar jogo?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Isso irá registrar {players.length} jogador{players.length !== 1 ? 'es' : ''} e atualizar o saldo do caixa. Esta ação não pode ser desfeita.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-brand-gray-dark mb-2">Salvar como pendente?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  O jogo será salvo com {players.length} jogador{players.length !== 1 ? 'es' : ''} e ficará pendente até ser finalizado.
                </p>
              </>
            )}
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
