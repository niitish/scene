import type { ReactNode } from 'react'
import useSWR from 'swr'
import { fetcher, meKey, logout as apiLogout } from '@/api/client'
import type { UserResponse } from '@/api/types'
import { AuthContext } from '@/auth-context'

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
