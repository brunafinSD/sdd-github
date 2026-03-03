import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Captura beforeinstallprompt ANTES do React montar.
// O evento dispara cedo demais para ser capturado num useEffect.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
declare global {
  interface Window { __pwaPrompt?: BeforeInstallPromptEvent }
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__pwaPrompt = e as BeforeInstallPromptEvent
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
