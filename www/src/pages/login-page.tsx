import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { githubLoginUrl, googleLoginUrl } from '@/api/client'
import { useAuth } from '@/use-auth'
import { GitHubIcon, GoogleIcon } from '@/components/icons'
import { NeoButton } from '@/components/neo-button'
import { NeoBadge } from '@/components/neo-badge'
import { NeoCard } from '@/components/neo-card'

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
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <NeoCard shadow={4} className="w-full max-w-md" contentClassName="p-8 sm:p-12">
        <div className="mb-12">
          <Link to="/" className="block w-fit mb-4">
            <h1 className="text-brutal-black text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none">
              SCENE
            </h1>
          </Link>
          <NeoBadge variant="brutal-black" className="text-brutal-yellow! text-sm! sm:text-base!">
            LOG IN
          </NeoBadge>
        </div>

        {error && (
          <div className="mb-8 border-2 border-brutal-black bg-brutal-yellow px-5 py-4 text-sm sm:text-base font-bold uppercase tracking-tight text-brutal-black flex items-start gap-3 rounded-base shadow-base">
            <span className="text-xl leading-none mt-0.5">⚠</span>
            <span>{errorMessages[error] ?? 'Something went wrong. Please try again.'}</span>
          </div>
        )}

        <div className="space-y-4">
          <NeoButton
            href={googleLoginUrl()}
            variant="brutal-white"
            display
            fullWidth
            className="gap-3 justify-center"
          >
            <GoogleIcon />
            CONTINUE WITH GOOGLE
          </NeoButton>

          <NeoButton
            href={githubLoginUrl()}
            variant="brutal-black"
            display
            fullWidth
            className="gap-3 justify-center"
          >
            <GitHubIcon />
            CONTINUE WITH GITHUB
          </NeoButton>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-brutal-black">
          <p className="text-brutal-black font-bold text-xs uppercase tracking-widest text-center">
            CHOOSE A PROVIDER
          </p>
        </div>
      </NeoCard>
    </div>
  )
}
