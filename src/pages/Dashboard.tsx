// T044, T060, T086: Dashboard page with navigation

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { BottomNav } from '@/components/layout/BottomNav'
import { CashDisplay } from '@/components/dashboard/CashDisplay'
import { GameList } from '@/components/dashboard/GameList'
import { Button } from '@/components/ui/Button'
import { seedDatabase } from '@/services/seed'

export function Dashboard() {
  const navigate = useNavigate()
  const { games, loading: gamesLoading, loadCurrentMonthGames } = useGameStore()
  const { summary, loading: cashLoading, loadSummary } = useCashStore()

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

  return (
    <div className="min-h-screen bg-brand-gray-light pb-20">
      <Header title="Futsal Cash Manager" />

      <Container>
        {/* Cash Display + Ajustar Caixa */}
        <div className="mb-8">
          <CashDisplay 
            balance={summary?.currentBalance ?? (0 as any)} 
            loading={cashLoading}
          />
          <Button
            onClick={handleAdjustCash}
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
          >
            Ajustar Caixa
          </Button>
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
    </div>
  )
}
