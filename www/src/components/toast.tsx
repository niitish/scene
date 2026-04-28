import { useEffect } from 'react'
import { NeoCard } from '@/components/neo-card'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface Props {
  toasts: ToastMessage[]
  onRemove: (id: number) => void
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-brutal-yellow',
  error: 'bg-red-500 text-white',
  info: 'bg-brutal-stone',
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 5000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <NeoCard
      accent={typeStyles[toast.type]}
      shadow={4}
      className="px-5 py-3 font-bold text-xs uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-right duration-200"
    >
      <span className="text-lg">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="font-bold cursor-pointer hover:bg-black hover:text-white px-1 transition-colors"
      >
        ✕
      </button>
    </NeoCard>
  )
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 w-80 sm:w-96">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
