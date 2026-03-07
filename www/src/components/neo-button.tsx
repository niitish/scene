import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ColorVariant = 'yellow' | 'pink' | 'cyan' | 'lime' | 'orange' | 'white' | 'black'

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
  yellow: 'bg-yellow text-gray-800 hover:brightness-95',
  pink: 'bg-pink text-gray-800 hover:brightness-95',
  cyan: 'bg-cyan text-gray-800 hover:brightness-95',
  lime: 'bg-lime text-gray-800 hover:brightness-95',
  orange: 'bg-orange text-white hover:brightness-95',
  white: 'bg-white text-gray-800 hover:bg-gray-50',
  black: 'bg-gray-800 text-white hover:bg-gray-700',
}

const displayVariantClasses: Record<ColorVariant, string> = {
  yellow: 'bg-yellow text-gray-800 hover:brightness-95',
  pink: 'bg-pink text-gray-800 hover:brightness-95',
  cyan: 'bg-cyan text-gray-800 hover:brightness-95',
  lime: 'bg-lime text-gray-800 hover:brightness-95',
  orange: 'bg-orange text-white hover:brightness-95',
  white: 'bg-white text-gray-800 hover:bg-yellow',
  black: 'bg-gray-800 text-white hover:bg-gray-700',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-1 text-[11px] font-semibold',
  sm: 'px-3 py-1.5 text-sm font-semibold',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-7 py-3.5 text-base font-semibold',
}

const displaySizeClasses = 'px-5 py-3.5 font-bold text-sm uppercase tracking-wide'

const baseClasses =
  'inline-flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

const defaultButtonClasses =
  'border border-gray-800 shadow-[3px_3px_0px_#1f2937] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:active:shadow-[3px_3px_0px_#1f2937] disabled:active:translate-x-0 disabled:active:translate-y-0'

const displayButtonClasses =
  'border-2 border-gray-800 shadow-[4px_4px_0px_#1f2937] hover:shadow-[2px_2px_0px_#1f2937] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:hover:shadow-[4px_4px_0px_#1f2937] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:active:translate-x-0 disabled:active:translate-y-0'

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
  const colorClasses = display ? displayVariantClasses[variant] : variantClasses[variant]
  const sizeClass = display ? displaySizeClasses : sizeClasses[size]
  const shadowClasses = display ? displayButtonClasses : defaultButtonClasses

  const classes = [
    baseClasses,
    shadowClasses,
    colorClasses,
    sizeClass,
    fullWidth && 'w-full',
    className,
  ]
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
