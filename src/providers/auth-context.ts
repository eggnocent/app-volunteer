import { createContext } from 'react'

import type {
  ApiLoginPayload,
  ApiRegisterPayload,
  ApiUser,
} from '@/services/api/types'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest' | 'error'

export type AuthContextValue = {
  user: ApiUser | null
  status: AuthStatus
  error: string | null
  login: (payload: ApiLoginPayload) => Promise<ApiUser>
  register: (payload: ApiRegisterPayload) => Promise<ApiUser>
  logout: () => Promise<void>
  refresh: () => Promise<ApiUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
