import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { fetcher, similarKey, thumbUrl } from '@/api/client'
import type { ImageMeta, SimilarityListResponse } from '@/api/types'
import { ImageCard } from '@/components/image-card'
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
      <div className="relative max-w-md">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black border-2 border-black" />
        <div className="relative border-2 border-black bg-pink p-6 font-bold">
          No image ID provided.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-8">
        <div className="absolute inset-0 translate-x-3 translate-y-3 bg-pink border-2 border-black" />
        <div className="relative border-2 border-black bg-white overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-4 sm:gap-5 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-black text-white shrink-0 hover:bg-pink hover:text-black transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <span className="text-lg sm:text-xl font-black group-hover:-translate-x-0.5 transition-transform">
                  ←
                </span>
              </button>
              <div className="border-2 border-black overflow-hidden shadow-[3px_3px_0px_#1a1a1a] shrink-0">
                <img
                  src={thumbUrl(imageId)}
                  alt="Source"
                  className="w-14 h-14 sm:w-20 sm:h-20 object-cover block"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter leading-tight">
                Similar images
              </h1>
              <p
                className="font-mono text-xs text-black/40 mt-1 truncate sm:break-all"
                title={imageId}
              >
                {imageId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border-2 border-black shadow-[4px_4px_0px_#1a1a1a] bg-gray-200 animate-pulse"
              style={{ aspectRatio: '4/3' }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black border-2 border-black" />
          <div className="relative border-2 border-black bg-pink p-5 sm:p-6 font-bold text-sm">
            <span className="font-extrabold uppercase tracking-wide text-base block mb-1">
              Failed to load
            </span>
            {error.message}
          </div>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="relative max-w-md mt-4">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-pink border-2 border-black" />
          <div className="relative border-2 border-black bg-white p-10 text-center">
            <p className="text-5xl mb-4">🔎</p>
            <p className="text-xl font-extrabold uppercase tracking-tight mb-2">
              No similar images found
            </p>
            <div className="border-t-2 border-black my-4" />
            <p className="font-bold text-sm text-black/60 leading-relaxed">
              Try uploading more images or wait for embeddings to process.
            </p>
          </div>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="relative inline-block">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black" />
              <span className="relative border-2 border-black bg-pink px-3 py-1.5 font-extrabold text-sm block">
                {data.count} similar image{data.count !== 1 ? 's' : ''} found
              </span>
            </div>
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
