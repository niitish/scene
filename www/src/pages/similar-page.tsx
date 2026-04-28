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
      <div className="border-2 border-brutal-black bg-brutal-yellow shadow-base rounded-base p-6 sm:p-8 font-bold text-sm text-brutal-black uppercase tracking-widest">
        CRITICAL ERROR: NO IMAGE IDENTIFIER PROVIDED.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-12 gap-6 flex-wrap border-b-2 border-brutal-black pb-8">
        <div>
          <NeoBadge className="mb-4">IMAGE ANALYSIS</NeoBadge>
          <h1 className="text-brutal-black text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            SIMILAR
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-12 h-12 border-2 border-brutal-black bg-brutal-black text-white shrink-0 hover:bg-brutal-yellow hover:text-brutal-black transition-colors cursor-pointer rounded-base"
              aria-label="Go back"
            >
              <span className="text-xl font-bold group-hover:-translate-x-1 transition-transform">
                ←
              </span>
            </button>
            <div className="border-2 border-brutal-black bg-brutal-stone p-1 shadow-base rounded-base">
              <img
                src={thumbUrl(imageId)}
                alt="Source"
                className="w-16 h-16 sm:w-24 sm:h-24 object-cover block grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                SOURCE_ID
              </span>
              <p className="font-mono text-xs text-brutal-black truncate max-w-[120px] sm:max-w-[240px] font-bold">
                {imageId}
              </p>
            </div>
          </div>
        </div>
        {data && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mt-2 sm:mt-0">
            <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
            <NeoBadge variant="brutal-white">
              {data.count} MATCH{data.count !== 1 ? 'ES' : ''} FOUND
            </NeoBadge>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="border-2 border-brutal-black bg-white shadow-base rounded-base p-6 sm:p-8 font-bold text-sm uppercase tracking-widest text-brutal-black mb-12 animate-pulse">
          SEARCHING FOR SIMILAR IMAGES...
        </div>
      )}

      {error && (
        <div className="border-2 border-brutal-black bg-red-500 shadow-base rounded-base p-6 sm:p-8 font-bold text-sm text-white mb-12">
          <span className="uppercase tracking-widest text-base block mb-2">SEARCH FAILED</span>
          {error.message}
        </div>
      )}

      {data && data.items.length === 0 && (
        <NeoCard shadow={4} className="max-w-xl mx-auto mt-16 text-center" contentClassName="p-10">
          <p className="text-6xl mb-6">🔎</p>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter text-brutal-black mb-4">
            NO MATCHES
          </h2>
          <div className="border-t-2 border-brutal-black my-6 w-16 mx-auto" />
          <p className="font-bold text-sm sm:text-base text-gray-600 uppercase tracking-widest">
            No similar images found in your collection.
          </p>
        </NeoCard>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
