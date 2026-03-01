import { NeoButton } from '@/components/neo-button'

interface Props {
  page: number
  hasMore: boolean
  onPrev: () => void
  onNext: () => void
}

export function Pagination({ page, hasMore, onPrev, onNext }: Props) {
  return (
    <div className="flex items-stretch gap-2 justify-center py-6">
      <NeoButton
        variant="white"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
        className="flex-1 sm:flex-none"
      >
        ← Prev
      </NeoButton>
      <span className="border-2 border-black shadow-[3px_3px_0px_#000] px-3 font-bold bg-yellow flex items-center text-sm">
        Page {page}
      </span>
      <NeoButton
        variant="white"
        size="sm"
        onClick={onNext}
        disabled={!hasMore}
        className="flex-1 sm:flex-none"
      >
        Next →
      </NeoButton>
    </div>
  )
}
