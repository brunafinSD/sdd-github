// CurrencyInput: input formatado em Real brasileiro (R$ 90,00)
// Armazena em centavos (Money), exibe formatado com Intl.NumberFormat pt-BR

import { InputHTMLAttributes, forwardRef, useCallback } from 'react'
import type { Money } from '@/types/money'

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string
  value: Money
  onChange: (value: Money) => void
  error?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, value, onChange, error, className = '', id, ...props }, ref) => {
    const inputId = id || `currency-${Math.random().toString(36).substr(2, 9)}`

    // Exibe formatado: 9000 cents → "90,00"
    const displayValue = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Extrai apenas dígitos e reconstrói o valor em centavos
        const digits = e.target.value.replace(/\D/g, '')
        const cents = parseInt(digits || '0', 10) as Money
        onChange(cents)
      },
      [onChange]
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-brand-gray-dark mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
            R$
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={`
              w-full pl-9 pr-3 py-2
              border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-brand-red' : 'border-gray-300'}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-brand-red" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
