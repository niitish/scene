import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { fetcher, searchKey } from '@/api/client'
import type { ImageMeta, SimilarityListResponse } from '@/api/types'
import { ImageCard } from '@/components/image-card'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import { NeoInput } from '@/components/neo-input'
import { PageSizeSelect } from '@/components/page-size-select'
import { Pagination } from '@/components/pagination'
import type { OutletContext } from '@/outlet-context'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function SearchPage() {
  const { setPreview } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const rawSize = Number(searchParams.get('size') || 20)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize) ? rawSize : 20

  const [inputValue, setInputValue] = useState(urlQuery)
  useEffect(() => {
    setInputValue(urlQuery)
  }, [urlQuery])

  function handleSearch() {
    const q = inputValue.trim()
    if (!q) return
    setSearchParams(
      (prev) => {
        prev.set('q', q)
        prev.set('page', '1')
        return prev
      },
      { replace: true }
    )
  }

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
    searchKey(urlQuery, page, pageSize),
    fetcher
  )

  const hasMore = data ? data.items.length === pageSize : false

  return (
    <div>
      <div className="mb-8">
        <NeoBadge accent="bg-yellow" rotate={-1} className="mb-3">
          Semantic Search
        </NeoBadge>
        <h1 className="text-gray-800 text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-none">
          Search
        </h1>
      </div>

      <NeoCard
        variant="layered"
        accent="bg-white"
        offset={2.5}
        className="mb-8"
        contentClassName="p-5 sm:p-6"
      >
        <p className="font-bold text-xs uppercase tracking-widest text-gray-600 mb-4">
          Describe what you're looking for
        </p>
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-3">
          <NeoInput
            placeholder="e.g. sunset over mountains, a red car..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="w-full"
          />
          <NeoButton
            variant="yellow"
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="w-full sm:w-auto sm:self-stretch sm:text-base"
          >
            Search
          </NeoButton>
        </div>
      </NeoCard>

      {urlQuery && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-500">Results for:</span>
            <NeoBadge accent="bg-lime" variant="flat" className="border!">
              "{urlQuery}"
            </NeoBadge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
            {data && (
              <NeoBadge accent="bg-lime" variant="flat">
                {data.count} image{data.count !== 1 ? 's' : ''}
              </NeoBadge>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <NeoCard accent="bg-cyan" className="p-5 sm:p-6 font-bold text-sm">
          <span className="uppercase tracking-wide">Loading...</span>
        </NeoCard>
      )}

      {error && (
        <NeoCard accent="bg-pink" className="p-5 sm:p-6 font-bold text-sm">
          <span className="uppercase tracking-wide text-base block mb-1">Search failed</span>
          {error.message}
        </NeoCard>
      )}

      {data && data.items.length === 0 && (
        <NeoCard
          variant="layered"
          accent="bg-white"
          offset={2.5}
          offsetAccent="bg-yellow"
          className="max-w-md mx-auto mt-12"
          contentClassName="py-10 px-6 text-center"
        >
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">
            No results found
          </p>
          <div className="border-t-2 border-gray-800 my-4" />
          <p className="font-bold text-sm text-gray-600">Try a different search query.</p>
        </NeoCard>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {data.items.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onViewSimilar={(id) => navigate(`/similar/${id}`)}
                onPreview={(img: ImageMeta) => setPreview(img)}
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

      {!urlQuery && (
        <NeoCard
          variant="layered"
          accent="bg-yellow"
          offset={2.5}
          offsetAccent="bg-cyan"
          className="max-w-md mx-auto mt-12"
          contentClassName="py-10 px-6 text-center"
        >
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">
            Enter a query above
          </p>
          <div className="border-t-2 border-gray-800 my-4" />
          <p className="font-bold text-sm text-gray-600">
            Use natural language to find images in your collection.
          </p>
        </NeoCard>
      )}
    </div>
  )
}
