import { Navigate } from 'react-router'
import { NeoCard } from '@/components/neo-card'
import { useAuth } from '@/use-auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <NeoCard accent="bg-pink" className="px-8 py-6">
          <p className="font-bold uppercase tracking-wide text-gray-800 text-sm">Loading...</p>
        </NeoCard>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
