// T044, T060, T086, T017 (002-dual-cash-split): Dashboard with dual-cash + CourtWithdrawModal

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { BottomNav } from '@/components/layout/BottomNav'
import { CashDisplay } from '@/components/dashboard/CashDisplay'
import { GameList } from '@/components/dashboard/GameList'
import { Button } from '@/components/ui/Button'
import { CourtWithdrawModal } from '@/components/cash/CourtWithdrawModal'
import { seedDatabase } from '@/services/seed'
import type { Money } from '@/types/money'

export function Dashboard() {
  const navigate = useNavigate()
  const { games, loading: gamesLoading, loadCurrentMonthGames } = useGameStore()
  const { summary, loading: cashLoading, loadSummary, transferToAdm, applyCourtCredit } = useCashStore()
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  useEffect(() => {
    // Seed database on first load
    seedDatabase().then(() => {
      // Load data
      loadCurrentMonthGames()
      loadSummary()
    })
  }, [loadCurrentMonthGames, loadSummary])

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`)
  }

  const handleCreateGame = () => {
    navigate('/game/new')
  }

  const handleAdjustCash = () => {
    navigate('/cash/adjust')
  }

  const negativeGames = games.filter(g => g.status === 'finished' && g.cashImpact < 0)
  const courtBalance = summary?.courtBalance ?? (0 as Money)
  const showWithdrawButton = courtBalance > 0

  return (
    <div className="min-h-screen bg-brand-gray-light pb-20">
      <Header title="Fut da quinta" />

      <Container>
        {/* Cash Display + breakdown + actions */}
        <div className="mb-8">
          <CashDisplay
            balance={summary?.totalBalance ?? (0 as Money)}
            courtBalance={summary?.courtBalance}
            admBalance={summary?.admBalance}
            loading={cashLoading}
          />

          <div className={`mt-3 grid gap-2 ${showWithdrawButton ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <Button
              onClick={handleAdjustCash}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Ajustar Caixa
            </Button>

            {showWithdrawButton && (
              <Button
                onClick={() => setWithdrawOpen(true)}
                variant="ghost"
                size="sm"
                className="w-full border border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10"
              >
                Saque Quadra
              </Button>
            )}
          </div>
        </div>

        {/* Games Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-gray-dark">
              Jogos do Mês
            </h2>
            <Button onClick={handleCreateGame} size="sm">
              + Criar Jogo
            </Button>
          </div>

          <GameList
            games={games}
            loading={gamesLoading}
            onGameClick={handleGameClick}
          />
        </div>
      </Container>

      <BottomNav />

      {/* T017: CourtWithdrawModal */}
      {withdrawOpen && (
        <CourtWithdrawModal
          courtBalance={courtBalance}
          negativeGames={negativeGames}
          onClose={() => setWithdrawOpen(false)}
          onTransfer={async (amount, description) => {
            await transferToAdm(amount, description)
            await loadSummary()
          }}
          onApplyCredit={async (gameId, amount) => {
            await applyCourtCredit(gameId, amount)
            await loadSummary()
          }}
        />
      )}
    </div>
  )
}
