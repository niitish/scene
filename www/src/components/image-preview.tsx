import { useEffect } from 'react'
import { imageUrl } from '@/api/client'
import type { ImageMeta } from '@/api/types'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import { NeoTag } from '@/components/neo-tag'

interface Props {
  image: ImageMeta | null
  onClose: () => void
  onViewSimilar?: (id: string) => void
  onTagClick?: (tag: string) => void
}

export function ImagePreview({ image, onClose, onViewSimilar, onTagClick }: Props) {
  useEffect(() => {
    if (!image) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <NeoCard
        shadow={12}
        className="w-full sm:max-w-5xl max-h-[95dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[3px] border-brutal-black px-5 py-4 bg-brutal-yellow shrink-0">
          <h2 className="font-bold text-sm uppercase tracking-widest truncate pr-3">
            {image.name}
          </h2>
          <button
            onClick={onClose}
            className="text-xl hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-brutal-stone flex items-center justify-center min-h-0 border-b-[3px] border-brutal-black">
          <img
            src={imageUrl(image.id)}
            alt={image.name}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(95dvh - 150px)' }}
          />
        </div>

        <div className="bg-white px-5 py-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 flex-1">
              {image.tags.map((tag) => (
                <NeoTag
                  key={tag}
                  label={tag}
                  onClick={onTagClick ? () => onTagClick(tag) : undefined}
                />
              ))}
            </div>
          )}
          <div className="flex gap-4 w-full sm:w-auto sm:ml-auto">
            {onViewSimilar && (
              <NeoButton
                variant="brutal-yellow"
                className="flex-1 sm:flex-none px-8 py-2 text-xs uppercase tracking-widest shadow-[4px_4px_0px_var(--color-brutal-black)]"
                onClick={() => {
                  onViewSimilar(image.id)
                  onClose()
                }}
              >
                FIND SIMILAR
              </NeoButton>
            )}
            <NeoButton
              href={imageUrl(image.id)}
              download={image.name}
              target="_blank"
              rel="noreferrer"
              variant="brutal-white"
              className="flex-1 sm:flex-none px-8 py-2 text-xs uppercase tracking-widest shadow-[4px_4px_0px_var(--color-brutal-black)]"
            >
              DOWNLOAD
            </NeoButton>
          </div>
        </div>
      </NeoCard>
    </div>
  )
}
