interface Props {
  value: number
  options: number[]
  onChange: (size: number) => void
}

export function PageSizeSelect({ value, options, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">
        Per page
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-800 bg-white px-2 py-1 text-xs font-bold uppercase cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
