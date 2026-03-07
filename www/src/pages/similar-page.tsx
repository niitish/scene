import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { fetcher, similarKey, thumbUrl } from '@/api/client'
import type { ImageMeta, SimilarityListResponse } from '@/api/types'
import { ImageCard } from '@/components/image-card'
import { NeoBadge } from '@/components/neo-badge'
import { NeoCard } from '@/components/neo-card'
import { PageSizeSelect } from '@/components/page-size-select'
import { Pagination } from '@/components/pagination'
import type { OutletContext } from '@/outlet-context'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

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
      <NeoCard accent="bg-pink" className="p-5 sm:p-6 font-bold text-sm">
        No image ID provided.
      </NeoCard>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <NeoBadge accent="bg-pink" rotate={-1} className="mb-3">
            Find Similar
          </NeoBadge>
          <h1 className="text-gray-800 text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-none">
            Similar
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-800 bg-gray-800 text-white shrink-0 hover:bg-pink hover:text-gray-800 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <span className="text-lg sm:text-xl font-extrabold group-hover:-translate-x-0.5 transition-transform">
                ←
              </span>
            </button>
            <NeoCard
              variant="flat"
              accent="bg-gray-100"
              border={2}
              shadow={2}
              className="overflow-hidden shrink-0"
            >
              <img
                src={thumbUrl(imageId)}
                alt="Source"
                className="w-14 h-14 sm:w-20 sm:h-20 object-cover block"
              />
            </NeoCard>
            <p
              className="font-mono text-xs text-gray-600 truncate sm:max-w-[200px]"
              title={imageId}
            >
              {imageId}
            </p>
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-3 mt-1">
            <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
            <NeoBadge accent="bg-pink" variant="flat">
              {data.count} similar image{data.count !== 1 ? 's' : ''} found
            </NeoBadge>
          </div>
        )}
      </div>

      {isLoading && (
        <NeoCard accent="bg-cyan" className="p-5 sm:p-6 font-bold text-sm">
          <span className="uppercase tracking-wide">Loading...</span>
        </NeoCard>
      )}

      {error && (
        <NeoCard accent="bg-pink" className="p-5 sm:p-6 font-bold text-sm">
          <span className="uppercase tracking-wide text-base block mb-1">Failed to load</span>
          {error.message}
        </NeoCard>
      )}

      {data && data.items.length === 0 && (
        <NeoCard
          variant="layered"
          accent="bg-yellow"
          offset={2.5}
          offsetAccent="bg-pink"
          className="max-w-md mx-auto mt-12"
          contentClassName="py-10 px-6 text-center"
        >
          <p className="text-5xl mb-4">🔎</p>
          <p className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">
            No similar images found
          </p>
          <div className="border-t-2 border-gray-800 my-4" />
          <p className="font-bold text-sm text-gray-600">
            Try uploading more images or wait for embeddings to process.
          </p>
        </NeoCard>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {data.items.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onPreview={(img: ImageMeta) => setPreview(img)}
                onViewSimilar={(id) => navigate(`/similar/${id}`)}
                onTagClick={(t) => navigate(`/gallery?tag=${encodeURIComponent(t)}`)}
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
