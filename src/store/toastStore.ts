// T095: Toast store — estado global de notificações

import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, variant?: ToastVariant) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, variant = 'info') => {
    const id = crypto.randomUUID()
    set(state => ({ toasts: [...state.toasts, { id, message, variant }] }))

    // Auto-dismiss after 3.5 s
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },

  dismiss: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
}))

// Convenience helpers — call anywhere without hooks
export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().show(msg, 'error'),
  info:    (msg: string) => useToastStore.getState().show(msg, 'info'),
}
