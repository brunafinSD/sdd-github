// T037: Container layout component

import { ReactNode, HTMLAttributes } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Container({ 
  children, 
  maxWidth = 'lg', 
  className = '', 
  ...props 
}: ContainerProps) {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  }
  
  return (
    <div
      className={`
        container mx-auto px-4 py-6
        ${maxWidths[maxWidth]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
