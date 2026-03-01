import { Navigate } from 'react-router'
import { useAuth } from '@/auth-context'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-gray-900 px-8 py-6">
          <p className="font-bold uppercase tracking-wide text-white text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
