import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { fetcher, similarKey, thumbUrl } from '@/api/client'
import type { ImageMeta, SimilarityListResponse } from '@/api/types'
import { ImageCard } from '@/components/image-card'
import { NeoButton } from '@/components/neo-button'
import { PageSizeSelect } from '@/components/page-size-select'
import { Pagination } from '@/components/pagination'
import type { OutletContext } from '@/outlet-context'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

export function SimilarPage() {
  const { imageId } = useParams<{ imageId: string }>()
  const { setPreview } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const rawSize = Number(searchParams.get('size') || 20)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize) ? rawSize : 20

  function setPage(p: number) {
    setSearchParams(
      (prev) => {
        prev.set('page', String(p))
        return prev
      },
      { replace: true }
    )
  }
  function setPageSize(s: number) {
    setSearchParams(
      (prev) => {
        prev.set('size', String(s))
        prev.set('page', '1')
        return prev
      },
      { replace: true }
    )
  }

  const { data, error, isLoading } = useSWR<SimilarityListResponse>(
    imageId ? similarKey(imageId, page, pageSize) : null,
    fetcher
  )

  const hasMore = data ? data.items.length === pageSize : false

  if (!imageId) {
    return (
      <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-pink/70 p-6 font-bold">
        No image ID provided.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <NeoButton variant="white" size="sm" onClick={() => navigate(-1)}>
          ← Back
        </NeoButton>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Similar</h1>
      </div>

      <div className="border border-black shadow-[3px_3px_0px_#1a1a1a] bg-white p-3 sm:p-4 mb-6 flex items-center gap-3 sm:gap-4">
        <img
          src={thumbUrl(imageId)}
          alt="Source image"
          className="w-14 h-14 sm:w-20 sm:h-20 object-cover border border-black flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-black text-sm uppercase">Source Image</p>
          <p className="font-mono text-xs text-gray-500 break-all">{imageId}</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-gray-200 animate-pulse"
              style={{ aspectRatio: '4/3' }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-pink/70 p-4 sm:p-6 font-bold text-sm">
          {error.message}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-yellow/60 p-8 sm:p-10 text-center">
          <p className="text-xl sm:text-2xl font-semibold">No similar images found</p>
          <p className="font-bold mt-2 text-sm">
            Try uploading more images or wait for embeddings to process.
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="font-bold text-gray-600 text-sm">
              {data.count} similar image{data.count !== 1 ? 's' : ''} found
            </span>
            <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {data.items.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onPreview={(img: ImageMeta) => setPreview(img)}
                onViewSimilar={(id) => navigate(`/similar/${id}`)}
              />
            ))}
          </div>
          {(data.items.length === pageSize || page > 1) && (
            <Pagination
              page={page}
              hasMore={hasMore}
              onPrev={() => setPage(Math.max(1, page - 1))}
              onNext={() => setPage(page + 1)}
            />
          )}
        </>
      )}
    </div>
  )
}
