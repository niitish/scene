import type { ReactNode } from 'react'

export interface NeoBadgeProps {
  children: ReactNode
  accent?: string
  variant?: 'default' | 'flat'
  rotate?: -1 | 0 | 1
  className?: string
}

const rotateClasses: Record<number, string> = {
  [-1]: '-rotate-1',
  0: '',
  1: 'rotate-1',
}

export function NeoBadge({
  children,
  accent = 'bg-cyan',
  variant = 'default',
  rotate = 0,
  className = '',
}: NeoBadgeProps) {
  return (
    <span
      className={`
        inline-block border-2 border-gray-800
        font-bold text-xs uppercase tracking-widest px-3 py-1.5
        ${variant === 'default' ? 'shadow-[2px_2px_0px_#1f2937]' : ''}
        ${accent}
        ${rotateClasses[rotate]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  )
}
