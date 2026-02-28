interface Props {
  label: string
  onRemove?: () => void
}

const colors = [
  'bg-yellow/70',
  'bg-pink/60',
  'bg-cyan/60',
  'bg-lime/70',
  'bg-orange/60',
  'bg-purple/60',
]

function tagColor(label: string) {
  let hash = 0
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function NeoTag({ label, onRemove }: Props) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        border border-black/60
        px-2 py-0.5
        text-xs font-medium tracking-wide
        ${tagColor(label)}
      `}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 font-semibold hover:text-red-600 cursor-pointer leading-none opacity-60 hover:opacity-100"
          aria-label={`Remove tag ${label}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
