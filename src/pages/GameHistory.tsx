// T082, T084, T086, T089: GameHistory page — todos os jogos finalizados

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatMoney } from '@/types/money'

// T089: date formatter
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function GameHistory() {
  const navigate = useNavigate()
  const { games, loading, loadGames } = useGameStore()

  useEffect(() => {
    loadGames()
  }, [loadGames])

  // T084: only finished games
  const finishedGames = games.filter(g => g.status === 'finished')

  return (
    <div className="min-h-screen bg-brand-gray-light pb-20">
      <Header title="Histórico" />

      {/* T086: Tab switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex">
          <button
            onClick={() => navigate('/history/transactions')}
            className="px-4 py-3 text-sm text-gray-500 hover:text-brand-blue transition-colors"
          >
            Movimentações
          </button>
          <button
            className="px-4 py-3 text-sm font-semibold text-brand-blue border-b-2 border-brand-blue"
          >
            Partidas
          </button>
        </div>
      </div>

      <Container maxWidth="md">
        <div className="space-y-4 py-6">
          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-4">
              Jogos finalizados{finishedGames.length > 0 && ` (${finishedGames.length})`}
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : finishedGames.length === 0 ? (
              /* T090: empty state */
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum jogo finalizado ainda.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {finishedGames.map(game => {
                  const isPositive = game.cashImpact >= 0
                  return (
                    /* T088: click-through to game detail */
                    <li
                      key={game.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/game/${game.id}`)}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/game/${game.id}`)}
                      className="flex items-center justify-between gap-3 py-3 -mx-3 px-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-gray-dark capitalize">
                          {formatDate(game.date)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {game.players.length} jogador{game.players.length !== 1 ? 'es' : ''} · quadra {formatMoney(game.courtCost)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-bold ${isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                          {isPositive ? '+' : ''}{formatMoney(game.cashImpact)}
                        </span>
                        <Badge variant="success">Concluído</Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </Container>

      <BottomNav />
    </div>
  )
}
