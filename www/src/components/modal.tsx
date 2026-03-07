import { useEffect, type ReactNode } from 'react'
import { NeoButton } from '@/components/neo-button'
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
        accent="bg-white"
        shadow={6}
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 bg-yellow/60 sticky top-0">
          <h2 className="font-bold text-sm uppercase tracking-wide">{title}</h2>
          <NeoButton variant="black" size="sm" onClick={onClose}>
            ✕
          </NeoButton>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </NeoCard>
    </div>
  )
}
