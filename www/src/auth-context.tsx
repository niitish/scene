import { createContext, useContext, type ReactNode } from 'react'
import useSWR from 'swr'
import { fetcher, meKey, logout as apiLogout } from '@/api/client'
import type { UserResponse } from '@/api/types'

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  logout: () => Promise<void>
  mutate: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(meKey(), fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  })

  const user = error || !data ? null : data

  async function logout() {
    await apiLogout()
    await mutate(undefined, { revalidate: false })
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, logout, mutate }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
