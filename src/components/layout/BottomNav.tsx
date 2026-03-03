// T086: BottomNav — navegação principal da app (mobile PWA)

import { NavLink } from 'react-router-dom'
import { HomeIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { to: '/',                      label: 'Início',       Icon: HomeIcon,                     end: true },
  { to: '/history/transactions',  label: 'Histórico',    Icon: ClockIcon,                    end: false },
  { to: '/cash/adjust',           label: 'Ajustar Caixa', Icon: AdjustmentsHorizontalIcon,   end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <ul className="flex">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs transition-colors w-full ${
                  isActive ? 'text-brand-blue font-semibold' : 'text-gray-500 hover:text-brand-blue'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

