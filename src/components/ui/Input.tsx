// T032: Input atom component

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
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
        
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 
            border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-brand-red' : 'border-gray-300'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-brand-red" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
