import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const shadowClasses: Record<number, string> = {
  2: 'shadow-[2px_2px_0px_#1f2937]',
  3: 'shadow-[3px_3px_0px_#1f2937]',
  4: 'shadow-[4px_4px_0px_#1f2937]',
  6: 'shadow-[6px_6px_0px_#1f2937]',
}

const offsetClasses: Record<number, string> = {
  2: 'translate-x-2 translate-y-2',
  2.5: 'translate-x-2.5 translate-y-2.5',
}

export interface NeoCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode
  className?: string
  /** background color class (e.g. bg-white, bg-cyan, bg-pink) */
  accent?: string
  /** 'flat' = single div; 'layered' = offset bg + foreground */
  variant?: 'flat' | 'layered'
  /** shadow size in px (2, 3, 4, 6). default: 4 for flat, none for layered */
  shadow?: 2 | 3 | 4 | 6
  /** border width: 1 or 2. default: 1 for flat, 2 for layered */
  border?: 1 | 2
  /** for layered: offset translate (2, 2.5, 3). default: 2 */
  offset?: 2 | 2.5
  /** for layered: offset background color. 'black' | 'accent'. or use offsetAccent for custom. */
  offsetColor?: 'black' | 'accent'
  /** for layered: custom offset background class (e.g. bg-pink). overrides offsetColor when set. */
  offsetAccent?: string
  /** html element to render. default: div */
  as?: 'div' | 'section' | 'article'
  /** for layered: extra classes on the inner content div */
  contentClassName?: string
}

export function NeoCard({
  children,
  className = '',
  accent = 'bg-white',
  variant = 'flat',
  shadow,
  border,
  offset = 2,
  offsetColor = 'black',
  offsetAccent,
  as: Component = 'div',
  contentClassName = '',
  ...rest
}: NeoCardProps) {
  const effectiveShadow = shadow ?? (variant === 'flat' ? 4 : undefined)
  const effectiveBorder = border ?? (variant === 'flat' ? 1 : 2)
  const borderClass = effectiveBorder === 1 ? 'border border-gray-800' : 'border-2 border-gray-800'
  const shadowClass = effectiveShadow ? shadowClasses[effectiveShadow] : ''

  if (variant === 'flat') {
    return (
      <Component
        className={`${borderClass} ${shadowClass} ${accent} ${className}`.trim()}
        {...rest}
      >
        {children}
      </Component>
    )
  }

  const offsetBg = offsetAccent ?? (offsetColor === 'black' ? 'bg-gray-800' : accent)
  const offsetTranslate = offsetClasses[offset]

  return (
    <div className={`relative ${className}`.trim()} {...rest}>
      <div
        className={`absolute inset-0 ${offsetTranslate} ${offsetBg} border-2 border-gray-800`}
        aria-hidden
      />
      <Component className={`relative ${borderClass} ${accent} ${contentClassName}`.trim()}>
        {children}
      </Component>
    </div>
  )
}
