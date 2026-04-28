import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ColorVariant =
  | 'yellow'
  | 'pink'
  | 'cyan'
  | 'lime'
  | 'orange'
  | 'white'
  | 'black'
  | 'brutal-yellow'
  | 'brutal-white'
  | 'brutal-black'

type Size = 'xs' | 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: ColorVariant
  size?: Size
  display?: boolean
  fullWidth?: boolean
  disabled?: boolean
  children: ReactNode
  className?: string
}

type Props = BaseProps &
  (
    | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: never })
    | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string })
  )

const variantClasses: Record<ColorVariant, string> = {
  yellow: 'bg-yellow text-gray-800',
  pink: 'bg-pink text-gray-800',
  cyan: 'bg-cyan text-gray-800',
  lime: 'bg-lime text-gray-800',
  orange: 'bg-orange text-white',
  white: 'bg-white text-gray-800 hover:bg-gray-50',
  black: 'bg-gray-800 text-white hover:bg-gray-700',
  'brutal-yellow': 'bg-brutal-yellow text-brutal-black',
  'brutal-white': 'bg-white text-brutal-black hover:bg-gray-100',
  'brutal-black': 'bg-brutal-black text-white hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-1 text-[11px] font-bold',
  sm: 'px-3 py-1.5 text-xs font-bold',
  md: 'px-5 py-2.5 text-sm font-bold',
  lg: 'px-7 py-3.5 text-base font-bold',
}

const displaySizeClasses = 'px-6 py-4 font-extrabold text-sm uppercase tracking-widest'

const baseClasses =
  'inline-flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-base border-2 border-brutal-black shadow-base active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:active:shadow-base disabled:active:translate-x-0 disabled:active:translate-y-0'

export function NeoButton({
  variant = 'yellow',
  size = 'md',
  display = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  href,
  ...props
}: Props) {
  const isAnchor = typeof href === 'string'
  const colorClasses = variantClasses[variant]
  const sizeClass = display ? displaySizeClasses : sizeClasses[size]

  const classes = [baseClasses, colorClasses, sizeClass, fullWidth && 'w-full', className]
    .filter(Boolean)
    .join(' ')

  if (isAnchor) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled}
        style={disabled ? { pointerEvents: 'none' } : undefined}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
