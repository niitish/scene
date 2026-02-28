import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  accent?: string
}

export function NeoCard({ children, className = '', accent = 'bg-white' }: Props) {
  return (
    <div
      className={`
        border border-black
        shadow-[4px_4px_0px_#1a1a1a]
        ${accent}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
