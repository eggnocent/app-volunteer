import { useCallback, useMemo, useState } from 'react'

import { AuthContext } from '@/providers/auth-context'
import { authApi } from '@/services/api'
import type { AuthContextValue, AuthStatus } from '@/providers/auth-context'
import type {
  ApiLoginPayload,
  ApiRegisterPayload,
  ApiUser,
} from '@/services/api/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch (refreshError) {
      setUser(null)
      setStatus('guest')
      setError(getErrorMessage(refreshError))
      return null
    }
  }, [])

  const login = useCallback(async (payload: ApiLoginPayload) => {
    setStatus('loading')
    setError(null)

    try {
      const response = await authApi.login(payload)
      setUser(response.user)
      setStatus('authenticated')
      return response.user
    } catch (loginError) {
      setUser(null)
      setStatus('error')
      setError(getErrorMessage(loginError))
      throw loginError
    }
  }, [])

  const register = useCallback(async (payload: ApiRegisterPayload) => {
    setStatus('loading')
    setError(null)

    try {
      const response = await authApi.register(payload)
      setUser(response.user)
      setStatus('authenticated')
      return response.user
    } catch (registerError) {
      setUser(null)
      setStatus('error')
      setError(getErrorMessage(registerError))
      throw registerError
    }
  }, [])

  const logout = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('guest')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      refresh,
    }),
    [error, login, logout, refresh, register, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan autentikasi.'
}
