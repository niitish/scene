import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'yellow' | 'pink' | 'cyan' | 'lime' | 'orange' | 'white' | 'black'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  yellow: 'bg-yellow text-black hover:brightness-95',
  pink: 'bg-pink text-black hover:brightness-95',
  cyan: 'bg-cyan text-black hover:brightness-95',
  lime: 'bg-lime text-black hover:brightness-95',
  orange: 'bg-orange text-white hover:brightness-95',
  white: 'bg-white text-black hover:bg-gray-50',
  black: 'bg-black text-white hover:bg-gray-800',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm font-semibold',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-7 py-3.5 text-base font-semibold',
}

export function NeoButton({
  variant = 'yellow',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        border border-black
        shadow-[3px_3px_0px_#1a1a1a]
        active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-75
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:shadow-[3px_3px_0px_#1a1a1a] disabled:active:translate-x-0 disabled:active:translate-y-0
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
