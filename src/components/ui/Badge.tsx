// T034: Badge atom component

import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children,
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-brand-gray-dark',
    success: 'bg-brand-green/20 text-brand-green',
    warning: 'bg-brand-yellow/20 text-brand-yellow',
    danger: 'bg-brand-red/20 text-brand-red',
    info: 'bg-brand-blue/10 text-brand-blue'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  }
  
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}
