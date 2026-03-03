// T002: Auth store — fake login with hardcoded credentials, persisted to localStorage

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Credentials (hardcoded — fake auth, no backend) ───────────────────────────
const VALID_USERNAME = 'parceriasdojoguinho'
const VALID_PASSWORD = 'futdaquinta'

// ── State interface ───────────────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean
  /**
   * Validates trimmed credentials against hardcoded values.
   * Returns true on success (and sets isAuthenticated = true),
   * false on failure (state unchanged).
   */
  login: (username: string, password: string) => boolean
  logout: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (username, password) => {
        const trimmedUser = username.trim()
        const trimmedPass = password.trim()

        if (trimmedUser === VALID_USERNAME && trimmedPass === VALID_PASSWORD) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => {
        set({ isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
