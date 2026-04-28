import { useEffect, type ReactNode } from 'react'
import { NeoCard } from '@/components/neo-card'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <NeoCard
        shadow={4}
        className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-brutal-black px-5 py-4 bg-brutal-yellow sticky top-0 shrink-0">
          <h2 className="font-bold text-sm uppercase tracking-widest">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto bg-white">{children}</div>
      </NeoCard>
    </div>
  )
}
