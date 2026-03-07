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
          border border-gray-800
          shadow-[3px_3px_0px_#1f2937]
          px-3 py-2.5
          bg-white
          text-sm font-medium
          focus:outline-none focus:shadow-[4px_4px_0px_#1f2937]
          transition-shadow duration-75
          placeholder:text-muted
          ${className}
        `}
      />
    </div>
  )
}
