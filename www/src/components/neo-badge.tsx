import type { ReactNode } from 'react'

export type BadgeVariant = 'brutal-yellow' | 'brutal-black' | 'brutal-white'

export interface NeoBadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  'brutal-yellow': 'bg-brutal-yellow text-brutal-black',
  'brutal-black': 'bg-brutal-black text-white',
  'brutal-white': 'bg-white text-brutal-black',
}

export function NeoBadge({ children, variant = 'brutal-yellow', className = '' }: NeoBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center border-2 border-brutal-black
        font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-base
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  )
}
