// T027: Game service with CRUD operations

import { db } from './db'
import type { Game, Player } from '@/types/game'
import type { Money } from '@/types/money'
import { calculateCashImpact } from '@/utils/calculations'
import { toMoney } from '@/types/money'

export const gameService = {
  /**
   * Get all games
   */
  async getAllGames(): Promise<Game[]> {
    const games = await db.games.toArray()
    
    // Populate players for each game
    const gamesWithPlayers = await Promise.all(
      games.map(async (game) => ({
        ...game,
        players: await db.players.where('gameId').equals(game.id).toArray()
      }))
    )
    
    // Sort by date descending (most recent first)
    return gamesWithPlayers.sort((a, b) => b.date.getTime() - a.date.getTime())
  },

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Game | undefined> {
    const game = await db.games.get(id)
    if (!game) return undefined
    
    const players = await db.players.where('gameId').equals(id).toArray()
    return { ...game, players }
  },

  /**
   * Create a new game
   */
  async createGame(data: {
    date: Date
    courtCost?: number
  }): Promise<Game> {
    const game: Game = {
      id: crypto.randomUUID(),
      date: data.date,
      status: 'pending',
      courtCost: (data.courtCost ?? toMoney(90)) as Money,
      players: [],
      cashImpact: 0 as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      finalishedAt: null
    }
    
    await db.games.add(game)
    return game
  },

  /**
   * Update game
   */
  async updateGame(id: string, updates: Partial<Game>): Promise<void> {
    await db.games.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  },

  /**
   * Add player to game
   */
  async addPlayer(gameId: string, player: Omit<Player, 'id' | 'gameId' | 'addedAt'>): Promise<Player> {
    const newPlayer: Player = {
      ...player,
      id: crypto.randomUUID(),
      gameId,
      addedAt: new Date()
    }
    
    await db.players.add(newPlayer)
    return newPlayer
  },

  /**
   * Update player
   */
  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    await db.players.update(playerId, updates)
  },

  /**
   * Remove player from game
   */
  async removePlayer(playerId: string): Promise<void> {
    await db.players.delete(playerId)
  },

  /**
   * Finalize game - calculate cash impact and mark as finished
   */
  async finalizeGame(gameId: string): Promise<void> {
    const game = await this.getGameById(gameId)
    if (!game) throw new Error('Game not found')
    
    const cashImpact = calculateCashImpact(game.players, game.courtCost)
    
    await db.games.update(gameId, {
      status: 'finished',
      cashImpact,
      finalishedAt: new Date(),
      updatedAt: new Date()
    })
  },

  /**
   * Get games for current month
   */
  async getCurrentMonthGames(): Promise<Game[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    const games = await this.getAllGames()
    // getAllGames already returns sorted desc; just filter
    return games.filter(game => game.date >= startOfMonth && game.date <= endOfMonth)
  }
}
