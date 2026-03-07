import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { githubLoginUrl, googleLoginUrl } from '@/api/client'
import { useAuth } from '@/use-auth'
import { GitHubIcon, GoogleIcon } from '@/components/icons'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'

const errorMessages: Record<string, string> = {
  invalid_state: 'Login session expired. Please try again.',
  oauth_failed: 'OAuth login failed. Please try again.',
  access_denied: 'Access was denied.',
}

const ACCENT_BLOCKS = [
  { color: 'bg-yellow', rotate: '-rotate-2', top: '7%', left: '4%', w: 'w-28', h: 'h-10' },
  { color: 'bg-pink', rotate: 'rotate-3', top: '12%', right: '6%', w: 'w-16', h: 'h-16' },
  { color: 'bg-cyan', rotate: '-rotate-1', bottom: '22%', left: '7%', w: 'w-24', h: 'h-8' },
  { color: 'bg-lime', rotate: 'rotate-2', bottom: '8%', right: '5%', w: 'w-16', h: 'h-16' },
  { color: 'bg-orange', rotate: '-rotate-3', top: '48%', left: '2%', w: 'w-10', h: 'h-10' },
  { color: 'bg-purple', rotate: 'rotate-1', top: '62%', right: '3%', w: 'w-14', h: 'h-6' },
  { color: 'bg-yellow', rotate: 'rotate-6', bottom: '35%', right: '10%', w: 'w-8', h: 'h-8' },
  { color: 'bg-cyan', rotate: '-rotate-6', top: '30%', left: '14%', w: 'w-6', h: 'h-6' },
]

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!loading && user) {
      navigate('/gallery', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-4 overflow-hidden relative">
      {ACCENT_BLOCKS.map((b, i) => (
        <div
          key={i}
          className={`absolute border border-gray-800 ${b.color} ${b.rotate} ${b.w} ${b.h} shadow-[2px_2px_0px_rgba(31,41,55,0.3)]`}
          style={{ top: b.top, bottom: b.bottom, left: b.left, right: b.right }}
        />
      ))}

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <NeoBadge
              accent="bg-gray-800"
              rotate={-1}
              className="text-yellow shadow-[3px_3px_0px_#f0d84a]"
            >
              Image Gallery
            </NeoBadge>
          </div>
          <h1 className="text-gray-800 text-7xl font-extrabold uppercase tracking-tighter leading-none">
            SCENE
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-0.5 w-8 bg-gray-800" />
            <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">
              Sign in to continue
            </p>
          </div>
        </div>

        <NeoCard
          variant="layered"
          accent="bg-white"
          offset={2.5}
          offsetAccent="bg-cyan"
          contentClassName="p-8 flex flex-col gap-4"
        >
          {error && (
            <NeoCard
              variant="flat"
              accent="bg-pink"
              border={2}
              className="px-4 py-3 text-sm font-bold flex items-center gap-2"
            >
              <span className="text-base leading-none shrink-0">⚠</span>
              <span>{errorMessages[error] ?? 'Something went wrong. Please try again.'}</span>
            </NeoCard>
          )}

          <p className="text-xs font-bold uppercase tracking-widest text-gray-600 text-center">
            Choose a provider
          </p>

          <NeoButton href={googleLoginUrl()} variant="white" display fullWidth className="gap-3">
            <GoogleIcon />
            Continue with Google
          </NeoButton>

          <NeoButton href={githubLoginUrl()} variant="black" display fullWidth className="gap-3">
            <GitHubIcon />
            Continue with GitHub
          </NeoButton>
        </NeoCard>
      </div>
    </div>
  )
}
