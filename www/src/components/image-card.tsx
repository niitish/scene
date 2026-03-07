import { useLayoutEffect, useRef, useState } from 'react'
import { thumbUrl } from '@/api/client'
import type { ImageMeta, ImageWithSimilarity } from '@/api/types'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import { NeoTag } from '@/components/neo-tag'

interface Props {
  image: ImageMeta | ImageWithSimilarity
  currentUserId?: string | null
  isAdmin?: boolean
  onEdit?: (image: ImageMeta) => void
  onDelete?: (id: string) => void
  onViewSimilar?: (id: string) => void
  onPreview?: (image: ImageMeta) => void
  onTagClick?: (tag: string) => void
}

function isSimilar(img: ImageMeta | ImageWithSimilarity): img is ImageWithSimilarity {
  return 'similarity' in img
}

function TagRow({ tags, onTagClick }: { tags: string[]; onTagClick?: (tag: string) => void }) {
  const measureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const measureEl = measureRef.current
      if (!container || !measureEl || tags.length === 0) return

      const containerWidth = container.clientWidth
      const children = Array.from(measureEl.querySelectorAll<HTMLElement>('[data-tag]'))
      const overflowEl = measureEl.querySelector<HTMLElement>('[data-overflow]')
      const overflowWidth = overflowEl ? overflowEl.offsetWidth + 4 : 0

      let used = 0
      let count = 0
      for (let i = 0; i < children.length; i++) {
        const childWidth = children[i].offsetWidth + 4
        const remaining = tags.length - (i + 1)
        const needsOverflow = remaining > 0
        if (used + childWidth + (needsOverflow ? overflowWidth : 0) <= containerWidth) {
          used += childWidth
          count = i + 1
        } else {
          break
        }
      }
      setVisibleCount(count)
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [tags])

  if (tags.length === 0) return null

  const hidden = tags.length - visibleCount

  return (
    <div ref={containerRef} className="relative">
      {/* invisible measurement layer */}
      <div
        ref={measureRef}
        className="flex gap-1 invisible absolute inset-0 w-full overflow-hidden pointer-events-none"
        aria-hidden
      >
        {tags.map((tag) => (
          <span key={tag} data-tag className="shrink-0">
            <NeoTag label={tag} onClick={onTagClick ? () => onTagClick(tag) : undefined} />
          </span>
        ))}
        <span data-overflow className="shrink-0 text-xs text-muted self-center whitespace-nowrap">
          +00
        </span>
      </div>
      {/* visible layer */}
      <div className="flex gap-1">
        {tags.slice(0, visibleCount).map((tag) => (
          <span key={tag} className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <NeoTag label={tag} onClick={onTagClick ? () => onTagClick(tag) : undefined} />
          </span>
        ))}
        {hidden > 0 && (
          <span className="shrink-0 text-xs text-muted self-center whitespace-nowrap">
            +{hidden}
          </span>
        )}
      </div>
    </div>
  )
}

export function ImageCard({
  image,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  onViewSimilar,
  onPreview,
  onTagClick,
}: Props) {
  const [imgError, setImgError] = useState(false)
  const isOwner = isAdmin || (currentUserId != null && image.uploaded_by === currentUserId)

  return (
    <NeoCard accent="bg-white" className="flex flex-col group">
      <div
        className="relative overflow-hidden border-b border-gray-800 bg-gray-100 cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={() => onPreview?.(image)}
      >
        {!imgError ? (
          <img
            src={thumbUrl(image.id)}
            alt={image.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            fetchPriority="low"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">
            🖼️
          </div>
        )}
        {isSimilar(image) && (
          <div className="absolute top-2 right-2 bg-lime/90 border border-gray-800 px-2 py-0.5 text-xs font-semibold">
            {(image.similarity * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-sm truncate text-gray-800" title={image.name}>
          {image.name}
        </p>

        <TagRow tags={image.tags} onTagClick={onTagClick} />

        <p className="text-xs text-muted font-mono mt-auto">
          {new Date(image.created_at).toLocaleDateString()}
        </p>

        <div className="flex gap-1.5 mt-auto">
          {onViewSimilar && (
            <NeoButton
              variant="cyan"
              size="xs"
              className="flex-1"
              onClick={() => onViewSimilar(image.id)}
            >
              Similar
            </NeoButton>
          )}
          {onEdit && isOwner && (
            <NeoButton variant="yellow" size="xs" className="flex-1" onClick={() => onEdit(image)}>
              Edit
            </NeoButton>
          )}
          {onDelete && isOwner && (
            <NeoButton
              variant="pink"
              size="xs"
              className="flex-1"
              onClick={() => onDelete(image.id)}
            >
              Delete
            </NeoButton>
          )}
        </div>
      </div>
    </NeoCard>
  )
}
