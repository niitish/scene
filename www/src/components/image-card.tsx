import { useLayoutEffect, useRef, useState } from 'react'
import { thumbUrl } from '@/api/client'
import type { ImageMeta, ImageWithSimilarity } from '@/api/types'
import { NeoTag } from '@/components/neo-tag'

interface Props {
  image: ImageMeta | ImageWithSimilarity
  onEdit?: (image: ImageMeta) => void
  onDelete?: (id: string) => void
  onViewSimilar?: (id: string) => void
  onPreview?: (image: ImageMeta) => void
}

function isSimilar(img: ImageMeta | ImageWithSimilarity): img is ImageWithSimilarity {
  return 'similarity' in img
}

function TagRow({ tags }: { tags: string[] }) {
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
            <NeoTag label={tag} />
          </span>
        ))}
        <span
          data-overflow
          className="shrink-0 text-xs text-gray-400 self-center whitespace-nowrap"
        >
          +00
        </span>
      </div>
      {/* visible layer */}
      <div className="flex gap-1">
        {tags.slice(0, visibleCount).map((tag) => (
          <span key={tag} className="shrink-0">
            <NeoTag label={tag} />
          </span>
        ))}
        {hidden > 0 && (
          <span className="shrink-0 text-xs text-gray-400 self-center whitespace-nowrap">
            +{hidden}
          </span>
        )}
      </div>
    </div>
  )
}

export function ImageCard({ image, onEdit, onDelete, onViewSimilar, onPreview }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-white flex flex-col group">
      <div
        className="relative overflow-hidden border-b border-black bg-gray-100 cursor-pointer"
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
          <div className="absolute top-2 right-2 bg-lime/90 border border-black px-2 py-0.5 text-xs font-semibold">
            {(image.similarity * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-sm truncate text-gray-800" title={image.name}>
          {image.name}
        </p>

        <TagRow tags={image.tags} />

        <p className="text-xs text-gray-400 font-mono mt-auto">
          {new Date(image.created_at).toLocaleDateString()}
        </p>

        <div className="flex gap-1.5 mt-auto">
          {onViewSimilar && (
            <button
              onClick={() => onViewSimilar(image.id)}
              className="flex-1 border border-black shadow-[2px_2px_0px_#1a1a1a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-cyan/80 py-1 text-[11px] font-semibold cursor-pointer hover:brightness-95 transition-all duration-75"
            >
              Similar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(image)}
              className="flex-1 border border-black shadow-[2px_2px_0px_#1a1a1a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-yellow/80 py-1 text-[11px] font-semibold cursor-pointer hover:brightness-95 transition-all duration-75"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(image.id)}
              className="flex-1 border border-black shadow-[2px_2px_0px_#1a1a1a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-pink/70 py-1 text-[11px] font-semibold cursor-pointer hover:brightness-95 transition-all duration-75"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
