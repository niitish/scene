import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const shadowClasses: Record<number, string> = {
  0: 'shadow-none',
  2: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  3: 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
  4: 'shadow-base',
  6: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  8: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
  12: 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
}

export interface NeoCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode
  className?: string
  /** background color class (e.g. bg-white, bg-brutal-yellow) */
  accent?: string
  /** shadow size in px (0, 2, 4, 6, 8, 12). default: 4 */
  shadow?: 0 | 2 | 3 | 4 | 6 | 8 | 12
  /** html element to render. default: div */
  as?: 'div' | 'section' | 'article'
  contentClassName?: string
}

export function NeoCard({
  children,
  className = '',
  accent = 'bg-white',
  shadow = 4,
  as: Component = 'div',
  contentClassName = '',
  ...rest
}: NeoCardProps) {
  const borderClass = 'border-2 border-brutal-black'
  const shadowClass = shadowClasses[shadow] || ''
  const baseClasses = 'rounded-base transition-all'

  return (
    <Component
      className={`${baseClasses} ${borderClass} ${shadowClass} ${accent} ${className}`.trim()}
      {...rest}
    >
      <div className={`${contentClassName} h-full`}>{children}</div>
    </Component>
  )
}
