import { useNavigate } from 'react-router'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-8 left-10 text-5xl font-extrabold text-gray-800/20 rotate-[-15deg]">
          SCENE
        </span>
        <span className="absolute bottom-16 right-12 text-4xl font-extrabold text-gray-800/20 rotate-12">
          404
        </span>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-gray-800/20 rotate-12" />
        <div className="absolute bottom-1/3 left-1/5 w-20 h-20 border-2 border-gray-800/20 rotate-[-8deg]" />
      </div>

      <div className="relative w-full max-w-lg">
        <NeoCard
          variant="layered"
          accent="bg-yellow"
          offset={2.5}
          offsetAccent="bg-pink"
          contentClassName="py-10 px-6 text-center"
        >
          <NeoBadge accent="bg-gray-800" className="text-yellow mb-6 shadow-[2px_2px_0px_#f472a8]">
            Error
          </NeoBadge>

          <div className="font-extrabold text-[7rem] leading-none tracking-tighter text-gray-800 mb-1 font-mono">
            404
          </div>

          <div className="border-t-2 border-gray-800 my-5" />

          <h1 className="text-gray-800 text-xl font-bold uppercase tracking-tight mb-2">
            Page not found
          </h1>
          <p className="text-sm font-medium text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
            This page doesn't exist. Maybe it was deleted, or you followed a bad link.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <NeoButton variant="white" display onClick={() => navigate(-1)}>
              ← Go back
            </NeoButton>
            <NeoButton variant="black" display onClick={() => navigate('/', { replace: true })}>
              Go home →
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  )
}
