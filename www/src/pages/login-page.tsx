import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { githubLoginUrl, googleLoginUrl } from '@/api/client'
import { useAuth } from '@/auth-context'
import { GitHubIcon, GoogleIcon } from '@/components/icons'

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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 overflow-hidden relative">
      {ACCENT_BLOCKS.map((b, i) => (
        <div
          key={i}
          className={`absolute border-2 border-black ${b.color} ${b.rotate} ${b.w} ${b.h} opacity-60`}
          style={{ top: b.top, bottom: b.bottom, left: b.left, right: b.right }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-black text-yellow font-extrabold text-xs uppercase tracking-widest px-3 py-1.5 border-2 border-black -rotate-1 shadow-[3px_3px_0px_#f0d84a]">
              Image Gallery
            </div>
          </div>
          <h1 className="text-7xl font-black uppercase tracking-tighter text-black leading-none">
            SCENE
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-0.5 w-8 bg-black" />
            <p className="text-black/50 font-bold text-xs uppercase tracking-widest">
              Sign in to continue
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-cyan border-2 border-black" />
          <div className="relative border-2 border-black bg-white p-8 flex flex-col gap-4">
            {error && (
              <div className="border-2 border-black bg-pink px-4 py-3 text-sm font-bold flex items-center gap-2">
                <span className="text-base leading-none shrink-0">⚠</span>
                <span>{errorMessages[error] ?? 'Something went wrong. Please try again.'}</span>
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-widest text-black/40 text-center">
              Choose a provider
            </p>

            <a
              href={googleLoginUrl()}
              className="flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_#1a1a1a] bg-white text-black px-5 py-3.5 font-extrabold text-sm uppercase tracking-wide hover:bg-yellow hover:shadow-[2px_2px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer"
            >
              <GoogleIcon />
              Continue with Google
            </a>

            <a
              href={githubLoginUrl()}
              className="flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_#1a1a1a] bg-black text-white px-5 py-3.5 font-extrabold text-sm uppercase tracking-wide hover:bg-gray-800 hover:shadow-[2px_2px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer"
            >
              <GitHubIcon />
              Continue with GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
