// T036, T049, T099: Header layout component with optional back button and PWA install prompt
// T006 [US3]: logout button when no back action (Dashboard-level pages)

import { ReactNode } from 'react'
import { ChevronLeftIcon, ArrowDownTrayIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  title?: string
  children?: ReactNode
  onBack?: () => void
}

export function Header({ title = 'Fut da quinta', children, onBack }: HeaderProps) {
  const { canInstall, install } = usePwaInstall()
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-brand-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {children}

            {/* T099: Install PWA button — shown only when browser supports it */}
            {canInstall && (
              <button
                onClick={install}
                aria-label="Instalar aplicativo"
                title="Instalar aplicativo"
                className="text-white/80 hover:text-white transition-colors"
              >
                <ArrowDownTrayIcon className="w-6 h-6" />
              </button>
            )}

            {/* T006: Logout — only on root-level pages (no back button) */}
            {!onBack && (
              <button
                onClick={handleLogout}
                aria-label="Sair"
                title="Sair"
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
