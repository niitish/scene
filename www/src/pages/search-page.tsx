import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { fetcher, searchKey } from '@/api/client'
import type { ImageMeta, SimilarityListResponse } from '@/api/types'
import { ImageCard } from '@/components/image-card'
import { NeoButton } from '@/components/neo-button'
import { NeoInput } from '@/components/neo-input'
import { PageSizeSelect } from '@/components/page-size-select'
import { Pagination } from '@/components/pagination'
import type { OutletContext } from '@/outlet-context'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

export function SearchPage() {
  const { setPreview } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const rawSize = Number(searchParams.get('size') || 20)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize) ? rawSize : 20

  // Local input mirrors the URL query so the field stays in sync
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
      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6">
        Search by Text
      </h1>

      <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-white p-4 sm:p-5 mb-8">
        <p className="font-bold text-sm mb-3 text-gray-600">
          Search your images using natural language.
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
            size="sm"
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="w-full sm:w-auto sm:self-stretch sm:text-base"
          >
            Search
          </NeoButton>
        </div>
      </div>

      {urlQuery && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base sm:text-lg uppercase">Results for:</span>
            <span className="border border-black shadow-[2px_2px_0px_#1a1a1a] bg-yellow px-3 py-1 font-bold text-sm break-all">
              "{urlQuery}"
            </span>
            {data && <span className="font-bold text-gray-500 text-sm">({data.count} found)</span>}
          </div>
          <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
          Search failed: {error.message}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-yellow/60 p-8 sm:p-10 text-center">
          <p className="text-xl sm:text-2xl font-semibold">No results found</p>
          <p className="font-bold mt-2 text-sm">Try a different search query.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.items.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onViewSimilar={(id) => navigate(`/similar/${id}`)}
                onPreview={(img: ImageMeta) => setPreview(img)}
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
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-white p-8 sm:p-10 text-center">
          <p className="text-4xl sm:text-5xl mb-4">🔍</p>
          <p className="font-semibold text-lg sm:text-xl uppercase">
            Enter a query above to search
          </p>
        </div>
      )}
    </div>
  )
}
