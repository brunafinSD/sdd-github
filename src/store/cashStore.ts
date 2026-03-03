// T030: Cash store with Zustand

import { create } from 'zustand'
import type { Transaction, CashSummary } from '@/types/cash'
import type { Money } from '@/types/money'
import { cashService } from '@/services/cashService'

interface CashState {
  transactions: Transaction[]
  summary: CashSummary | null
  loading: boolean
  error: string | null
  
  // Actions
  loadTransactions: () => Promise<void>
  loadSummary: () => Promise<void>
  addManualEntry: (amount: Money, description: string, justification: string) => Promise<void>
  addManualExit: (amount: Money, description: string, justification: string) => Promise<void>
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Promise<Transaction[]>
}

export const useCashStore = create<CashState>((set) => ({
  transactions: [],
  summary: null,
  loading: false,
  error: null,

  loadTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const transactions = await cashService.getAllTransactions()
      set({ transactions, loading: false })
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

  addManualEntry: async (amount, description, justification) => {
    set({ loading: true, error: null })
    try {
      const transaction = await cashService.addManualEntry(amount, description, justification)
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }))
      
      // Reload summary
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addManualExit: async (amount, description, justification) => {
    set({ loading: true, error: null })
    try {
      const transaction = await cashService.addManualExit(amount, description, justification)
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false
      }))
      
      // Reload summary
      const { loadSummary } = useCashStore.getState()
      await loadSummary()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
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
