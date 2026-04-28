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
      <div className="flex items-start justify-between mb-8 gap-6 flex-wrap border-b-2 border-brutal-black pb-8">
        <div>
          <NeoBadge className="mb-4">SEMANTIC SEARCH</NeoBadge>
          <h1 className="text-brutal-black text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none">
            SEARCH
          </h1>
        </div>
      </div>

      <NeoCard shadow={4} className="mb-12" contentClassName="p-6 sm:p-10">
        <p className="font-bold text-sm uppercase tracking-widest text-brutal-black mb-6">
          DESCRIBE WHAT YOU'RE LOOKING FOR
        </p>
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-4">
          <NeoInput
            placeholder="e.g. brutalist concrete structure, yellow accents..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="w-full flex-1"
          />
          <NeoButton
            variant="brutal-yellow"
            display
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="w-full sm:w-auto sm:self-stretch px-12"
          >
            SEARCH
          </NeoButton>
        </div>
      </NeoCard>

      {urlQuery && (
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b-2 border-brutal-black pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              RESULTS FOR:
            </span>
            <NeoBadge variant="brutal-yellow">"{urlQuery}"</NeoBadge>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
            {data && (
              <NeoBadge variant="brutal-white">
                {data.count} IMAGE{data.count !== 1 ? 'S' : ''}
              </NeoBadge>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="border-2 border-brutal-black bg-white shadow-base rounded-base p-6 sm:p-8 font-bold text-sm uppercase tracking-widest text-brutal-black mb-12 animate-pulse">
          SEARCHING IMAGES...
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
          <p className="text-6xl mb-6">🔍</p>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter text-brutal-black mb-4">
            NO MATCHES
          </h2>
          <div className="border-t-2 border-brutal-black my-6 w-16 mx-auto" />
          <p className="font-bold text-sm sm:text-base text-gray-600 uppercase tracking-widest">
            Try using different words to search.
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
        <NeoCard shadow={8} className="max-w-xl mx-auto mt-16 text-center" contentClassName="p-10">
          <p className="text-6xl mb-6">👁️</p>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter text-brutal-black mb-4">
            READY TO SEARCH
          </h2>
          <div className="border-t-2 border-brutal-black my-6 w-16 mx-auto" />
          <p className="font-bold text-sm sm:text-base text-gray-600 uppercase tracking-widest">
            Type anything to search your image collection.
          </p>
        </NeoCard>
      )}
    </div>
  )
}
