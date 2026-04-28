import { useNavigate } from 'react-router'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 text-8xl font-black uppercase tracking-tighter text-brutal-black">
          PAGE
        </div>
        <div className="absolute bottom-10 right-10 text-8xl font-black uppercase tracking-tighter text-brutal-black">
          NOT FOUND
        </div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] border-10 border-brutal-black rotate-12" />
      </div>

      <div className="relative w-full max-w-xl">
        <NeoCard shadow={12} accent="bg-white" contentClassName="py-12 px-8 text-center">
          <NeoBadge className="mb-8">ERROR 404</NeoBadge>

          <div className="font-black text-[8rem] sm:text-[10rem] leading-none tracking-tighter text-brutal-black mb-4">
            404
          </div>

          <div className="border-t-[3px] border-brutal-black my-8 w-24 mx-auto" />

          <h1 className="text-brutal-black text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-4">
            PAGE NOT FOUND
          </h1>
          <p className="text-sm font-bold text-gray-400 mb-10 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
            The page you are looking for does not exist. Check the URL or go back home.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <NeoButton
              variant="brutal-white"
              display
              className="px-10"
              onClick={() => navigate(-1)}
            >
              ← GO BACK
            </NeoButton>
            <NeoButton
              variant="brutal-black"
              display
              className="px-10"
              onClick={() => navigate('/', { replace: true })}
            >
              GO HOME →
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  )
}
