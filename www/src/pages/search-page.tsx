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
        <div className="inline-block border-2 border-black bg-yellow font-extrabold text-xs uppercase tracking-widest px-3 py-1 mb-3 shadow-[2px_2px_0px_#1a1a1a] -rotate-1">
          Semantic Search
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Search
        </h1>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-black border-2 border-black" />
        <div className="relative border-2 border-black bg-white p-5 sm:p-6">
          <p className="font-extrabold text-xs uppercase tracking-widest text-black/40 mb-4">
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
        </div>
      </div>

      {urlQuery && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm uppercase tracking-widest text-black/50">
              Results for:
            </span>
            <div className="relative inline-block">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black" />
              <span className="relative border-2 border-black bg-yellow px-3 py-1 font-extrabold text-sm block">
                "{urlQuery}"
              </span>
            </div>
            {data && <span className="font-bold text-black/50 text-sm">— {data.count} found</span>}
          </div>
          <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              Search failed
            </span>
            {error.message}
          </div>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="relative max-w-md mx-auto mt-8">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-yellow border-2 border-black" />
          <div className="relative border-2 border-black bg-white p-10 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-extrabold uppercase tracking-tight mb-2">No results found</p>
            <div className="border-t-2 border-black my-4" />
            <p className="font-bold text-sm text-black/60">Try a different search query.</p>
          </div>
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
        <div className="relative max-w-md mx-auto mt-4">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-yellow border-2 border-black" />
          <div className="relative border-2 border-black bg-white p-10 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-extrabold text-lg sm:text-xl uppercase tracking-tight mb-2">
              Enter a query above
            </p>
            <div className="border-t-2 border-black my-4" />
            <p className="font-bold text-sm text-black/50">
              Use natural language to find images in your collection.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
