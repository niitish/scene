import { useEffect } from 'react'

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
  success: 'bg-lime/90',
  error: 'bg-pink/90',
  info: 'bg-cyan/80',
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div
      className={`
        border border-black shadow-[3px_3px_0px_#1a1a1a]
        px-4 py-3 font-medium text-sm flex items-center gap-3
        ${typeStyles[toast.type]}
      `}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="font-semibold cursor-pointer opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 w-72 sm:w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
