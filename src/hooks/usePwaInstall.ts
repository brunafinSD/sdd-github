// T099: usePwaInstall — expõe prompt de instalação nativo do browser.
// O evento beforeinstallprompt é capturado globalmente em main.tsx
// para evitar race condition (pode disparar antes do React montar).

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  // Inicializa com o evento já capturado (se disponível)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    () => window.__pwaPrompt ?? null
  )
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  )

  useEffect(() => {
    // Também ouve eventos tardios (navegações internas)
    const handlePrompt = (e: Event) => {
      e.preventDefault()
      window.__pwaPrompt = e as BeforeInstallPromptEvent
      setPromptEvent(e as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setIsInstalled(true)
      setPromptEvent(null)
      window.__pwaPrompt = undefined
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      window.__pwaPrompt = undefined
    }
    setPromptEvent(null)
  }

  return { canInstall: !!promptEvent && !isInstalled, install }
}
