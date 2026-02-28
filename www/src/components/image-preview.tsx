import { useEffect } from 'react'
import { imageUrl } from '@/api/client'
import type { ImageMeta } from '@/api/types'
import { NeoButton } from '@/components/neo-button'
import { NeoTag } from '@/components/neo-tag'

interface Props {
  image: ImageMeta | null
  onClose: () => void
  onViewSimilar?: (id: string) => void
}

export function ImagePreview({ image, onClose, onViewSimilar }: Props) {
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
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-white border border-black shadow-[6px_6px_0px_#1a1a1a] w-full sm:max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-yellow/60 flex-shrink-0">
          <h2 className="font-semibold text-sm truncate pr-3">{image.name}</h2>
          <NeoButton variant="black" size="sm" onClick={onClose}>
            ✕
          </NeoButton>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center min-h-0">
          <img
            src={imageUrl(image.id)}
            alt={image.name}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(92dvh - 110px)' }}
          />
        </div>

        <div className="border-t border-black px-4 py-3 shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 flex-1">
              {image.tags.map((tag) => (
                <NeoTag key={tag} label={tag} />
              ))}
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            {onViewSimilar && (
              <NeoButton
                variant="cyan"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  onViewSimilar(image.id)
                  onClose()
                }}
              >
                Find Similar
              </NeoButton>
            )}
            <a
              href={imageUrl(image.id)}
              download={image.name}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none text-center border border-black shadow-[3px_3px_0px_#1a1a1a] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75 px-3 py-1.5 text-sm font-medium bg-lime/80 cursor-pointer"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
