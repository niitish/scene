import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function NeoInput({ label, className = '', id, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`
          border-2 border-brutal-black
          shadow-base
          px-3 py-2.5
          bg-white rounded-base
          text-sm font-bold
          focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-75
          placeholder:text-muted
          ${className}
        `}
      />
    </div>
  )
}
