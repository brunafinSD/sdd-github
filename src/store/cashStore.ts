// T007-T009 (002-dual-cash-split): Cash store — dual-cash actions

import { create } from 'zustand'
import type { Transaction, Transfer, CashSummary, CashTarget } from '@/types/cash'
import type { Money } from '@/types/money'
import { cashService } from '@/services/cashService'
import { toast } from '@/store/toastStore'

interface CashState {
  transactions: Transaction[]
  transfers: Transfer[]
  summary: CashSummary | null
  loading: boolean
  error: string | null

  // Actions
  loadTransactions: () => Promise<void>
  loadSummary: () => Promise<void>
  addManualEntry: (amount: Money, description: string, justification: string, cashTarget: CashTarget) => Promise<void>
  addManualExit: (amount: Money, description: string, justification: string, cashTarget: CashTarget) => Promise<void>
  transferToAdm: (amount: Money, description?: string) => Promise<void>
  applyCourtCredit: (gameId: string, amount: Money) => Promise<void>
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Promise<Transaction[]>
}

export const useCashStore = create<CashState>((set) => ({
  transactions: [],
  transfers: [],
  summary: null,
  loading: false,
  error: null,

  loadTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const [transactions, transfers] = await Promise.all([
        cashService.getAllTransactions(),
        cashService.getAllTransfers()
      ])
      set({ transactions, transfers, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  loadSummary: async () => {
    set({ loading: true, error: null })
    try {
      const summary = await cashService.getCashSummary()
      set({ summary, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addManualEntry: async (amount, description, justification, cashTarget) => {
    set({ loading: true, error: null })
    try {
      const transaction = await cashService.addManualEntry(amount, description, justification, cashTarget)
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }))
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addManualExit: async (amount, description, justification, cashTarget) => {
    set({ loading: true, error: null })
    try {
      const transaction = await cashService.addManualExit(amount, description, justification, cashTarget)
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }))
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  transferToAdm: async (amount, description) => {
    set({ loading: true, error: null })
    try {
      const transfer = await cashService.createTransfer(amount, description)
      set(state => ({
        transfers: [transfer, ...state.transfers],
        loading: false
      }))
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
      toast.success('Transferência realizada com sucesso!')
    } catch (error) {
      const msg = (error as Error).message
      set({ error: msg, loading: false })
      toast.error(msg)
      throw error
    }
  },

  applyCourtCredit: async (gameId, amount) => {
    set({ loading: true, error: null })
    try {
      // Debit from court cash as a manual_out
      const transaction = await cashService.addManualExit(
        (-amount) as Money,
        'Abatimento no custo do jogo',
        `Crédito aplicado ao jogo ${gameId}`,
        'court'
      )
      // Update game.courtCredit in DB
      const { db } = await import('@/services/db')
      const game = await db.games.get(gameId)
      if (game) {
        const existing = game.courtCredit ?? 0
        await db.games.update(gameId, { courtCredit: (existing + amount) as Money })
      }
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }))
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
      toast.success('Abatimento aplicado com sucesso!')
    } catch (error) {
      const msg = (error as Error).message
      set({ error: msg, loading: false })
      toast.error(msg)
      throw error
    }
  },

  getTransactionsByDateRange: async (startDate, endDate) => {
    try {
      return await cashService.getTransactionsByDateRange(startDate, endDate)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  }
}))
