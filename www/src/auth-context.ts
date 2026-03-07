import { createContext } from 'react'
import type { UserResponse } from '@/api/types'

export interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  logout: () => Promise<void>
  mutate: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
