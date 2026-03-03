// T033: Card atom component

import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ 
  children, 
  padding = 'md', 
  hover = false, 
  className = '', 
  ...props 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''
  
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border border-gray-200
        ${paddingClasses[padding]}
        ${hoverClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
