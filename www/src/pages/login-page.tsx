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
  { color: 'bg-yellow', rotate: '-rotate-2', top: '8%', left: '5%', w: 'w-24', h: 'h-10' },
  { color: 'bg-pink', rotate: 'rotate-3', top: '15%', right: '8%', w: 'w-16', h: 'h-16' },
  { color: 'bg-cyan', rotate: '-rotate-1', bottom: '20%', left: '10%', w: 'w-20', h: 'h-8' },
  { color: 'bg-lime', rotate: 'rotate-2', bottom: '10%', right: '6%', w: 'w-14', h: 'h-14' },
  { color: 'bg-orange', rotate: '-rotate-3', top: '45%', left: '3%', w: 'w-10', h: 'h-10' },
  { color: 'bg-purple', rotate: 'rotate-1', top: '60%', right: '4%', w: 'w-12', h: 'h-6' },
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
          className={`absolute border-2 border-black ${b.color} ${b.rotate} ${b.w} ${b.h} opacity-70`}
          style={{ top: b.top, bottom: b.bottom, left: b.left, right: b.right }}
        />
      ))}

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-8">
          <div className="inline-block bg-yellow border-2 border-black shadow-[5px_5px_0px_#1a1a1a] px-4 py-1 mb-4 -rotate-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black">
              Image Gallery
            </span>
          </div>
          <h1 className="text-6xl font-bold uppercase tracking-tighter text-black leading-none">
            SCENE
          </h1>
          <p className="text-black/60 mt-3 font-semibold text-sm uppercase tracking-wide">
            Sign in to continue
          </p>
        </div>

        <div className="border-2 border-black shadow-[8px_8px_0px_#1a1a1a] bg-white p-8 flex flex-col gap-4">
          {error && (
            <div className="border-2 border-black bg-pink px-4 py-3 text-sm font-bold flex items-center gap-2">
              <span className="text-lg leading-none">!</span>
              {errorMessages[error] ?? 'Something went wrong. Please try again.'}
            </div>
          )}

          <a
            href={googleLoginUrl()}
            className="flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_#1a1a1a] bg-white text-black px-5 py-3.5 font-bold text-sm hover:bg-gray-50 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <a
            href={githubLoginUrl()}
            className="flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_#1a1a1a] bg-black text-white px-5 py-3.5 font-bold text-sm hover:bg-gray-900 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer"
          >
            <GitHubIcon />
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
