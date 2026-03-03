// T095: ToastContainer — renderiza os toasts ativos no canto da tela

import { useToastStore, type ToastVariant } from '@/store/toastStore'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

const variantStyles: Record<ToastVariant, { bg: string; icon: typeof CheckCircleIcon }> = {
  success: { bg: 'bg-brand-green',  icon: CheckCircleIcon },
  error:   { bg: 'bg-brand-red',    icon: XCircleIcon },
  info:    { bg: 'bg-brand-blue',   icon: InformationCircleIcon },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none"
    >
      {toasts.map(t => {
        const { bg, icon: Icon } = variantStyles[t.variant]
        return (
          <div
            key={t.id}
            className={`${bg} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right`}
            role="alert"
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fechar notificação"
              className="text-white/70 hover:text-white transition-colors shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
