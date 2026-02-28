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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-yellow">SCENE</h1>
          <p className="text-gray-400 mt-2 font-medium text-sm">Sign in to manage your images</p>
        </div>

        <div className="border border-black shadow-[6px_6px_0px_#1a1a1a] bg-gray-900 p-8 flex flex-col gap-4">
          {error && (
            <div className="border border-black bg-pink/70 px-4 py-3 text-sm font-bold">
              {errorMessages[error] ?? 'Something went wrong. Please try again.'}
            </div>
          )}

          <a
            href={googleLoginUrl()}
            className="flex items-center justify-center gap-3 border border-black shadow-[3px_3px_0px_#1a1a1a] bg-white text-black px-5 py-3 font-semibold text-sm hover:brightness-95 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <a
            href={githubLoginUrl()}
            className="flex items-center justify-center gap-3 border border-black shadow-[3px_3px_0px_#1a1a1a] bg-black text-white px-5 py-3 font-semibold text-sm hover:bg-gray-800 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75 cursor-pointer"
          >
            <GitHubIcon />
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
