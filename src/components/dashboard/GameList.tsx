// T041: GameList component - displays list of games

import type { Game } from '@/types/game'
import { GameCard } from './GameCard'

interface GameListProps {
  games: Game[]
  loading?: boolean
  onGameClick?: (gameId: string) => void
}

export function GameList({ games, loading = false, onGameClick }: GameListProps) {
  // T046: Empty state
  if (!loading && games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-brand-gray-dark mb-1">
          Nenhum jogo neste mês
        </h3>
        <p className="text-sm text-gray-500">
          Crie um novo jogo para começar
        </p>
      </div>
    )
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }
  
  // Games list
  return (
    <div className="space-y-4">
      {games.map(game => (
        <GameCard
          key={game.id}
          id={game.id}
          date={game.date}
          status={game.status}
          playerCount={game.players.length}
          cashImpact={game.status === 'finished' ? game.cashImpact : undefined}
          onClick={() => onGameClick?.(game.id)}
        />
      ))}
    </div>
  )
}
