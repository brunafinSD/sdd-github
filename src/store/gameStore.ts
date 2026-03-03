// T029: Game store with Zustand

import { create } from 'zustand'
import type { Game, Player } from '@/types/game'
import { gameService } from '@/services/gameService'
import { cashService } from '@/services/cashService'

interface GameState {
  games: Game[]
  currentGame: Game | null
  loading: boolean
  error: string | null
  
  // Actions
  loadGames: () => Promise<void>
  loadCurrentMonthGames: () => Promise<void>
  getGameById: (id: string) => Promise<void>
  createGame: (data: { date: Date; courtCost?: number }) => Promise<Game>
  updateGame: (id: string, updates: Partial<Game>) => Promise<void>
  addPlayer: (gameId: string, player: Omit<Player, 'id' | 'gameId' | 'addedAt'>) => Promise<void>
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>
  removePlayer: (playerId: string) => Promise<void>
  finalizeGame: (gameId: string) => Promise<void>
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  currentGame: null,
  loading: false,
  error: null,

  loadGames: async () => {
    set({ loading: true, error: null })
    try {
      const games = await gameService.getAllGames()
      set({ games, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  loadCurrentMonthGames: async () => {
    set({ loading: true, error: null })
    try {
      const games = await gameService.getCurrentMonthGames()
      set({ games, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  getGameById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const game = await gameService.getGameById(id)
      set({ currentGame: game ?? null, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createGame: async (data) => {
    set({ loading: true, error: null })
    try {
      const game = await gameService.createGame(data)
      set(state => ({
        games: [...state.games, game],
        currentGame: game,
        loading: false
      }))
      return game
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateGame: async (id, updates) => {
    try {
      await gameService.updateGame(id, updates)
      set(state => ({
        games: state.games.map(g => g.id === id ? { ...g, ...updates } : g),
        currentGame: state.currentGame?.id === id 
          ? { ...state.currentGame, ...updates }
          : state.currentGame
      }))
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  addPlayer: async (gameId, player) => {
    try {
      const newPlayer = await gameService.addPlayer(gameId, player)
      set(state => ({
        games: state.games.map(g => 
          g.id === gameId 
            ? { ...g, players: [...g.players, newPlayer] }
            : g
        ),
        currentGame: state.currentGame?.id === gameId
          ? { ...state.currentGame, players: [...state.currentGame.players, newPlayer] }
          : state.currentGame
      }))
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updatePlayer: async (playerId, updates) => {
    try {
      await gameService.updatePlayer(playerId, updates)
      set(state => ({
        games: state.games.map(g => ({
          ...g,
          players: g.players.map(p => p.id === playerId ? { ...p, ...updates } : p)
        })),
        currentGame: state.currentGame ? {
          ...state.currentGame,
          players: state.currentGame.players.map(p => 
            p.id === playerId ? { ...p, ...updates } : p
          )
        } : null
      }))
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  removePlayer: async (playerId) => {
    try {
      await gameService.removePlayer(playerId)
      set(state => ({
        games: state.games.map(g => ({
          ...g,
          players: g.players.filter(p => p.id !== playerId)
        })),
        currentGame: state.currentGame ? {
          ...state.currentGame,
          players: state.currentGame.players.filter(p => p.id !== playerId)
        } : null
      }))
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  finalizeGame: async (gameId) => {
    set({ loading: true, error: null })
    try {
      await gameService.finalizeGame(gameId)
      
      // Get updated game to get cashImpact
      const updatedGame = await gameService.getGameById(gameId)
      if (updatedGame) {
        // Create transaction
        await cashService.createGameTransaction(
          gameId,
          updatedGame.cashImpact,
          `Jogo finalizado - ${updatedGame.players.length} jogadores`
        )
        
        // Update state
        set(state => ({
          games: state.games.map(g => g.id === gameId ? updatedGame : g),
          currentGame: state.currentGame?.id === gameId ? updatedGame : state.currentGame,
          loading: false
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  }
}))
