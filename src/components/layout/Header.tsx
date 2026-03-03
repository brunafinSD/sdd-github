// T036, T049, T099: Header layout component with optional back button and PWA install prompt

import { ReactNode } from 'react'
import { ChevronLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { usePwaInstall } from '@/hooks/usePwaInstall'

interface HeaderProps {
  title?: string
  children?: ReactNode
  onBack?: () => void
}

export function Header({ title = 'Futsal Cash Manager', children, onBack }: HeaderProps) {
  const { canInstall, install } = usePwaInstall()

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
          </div>
        </div>
      </div>
    </header>
  )
}
