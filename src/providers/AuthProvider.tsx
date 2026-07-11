import { useCallback, useEffect, useMemo, useState } from 'react'

import { AuthContext } from '@/providers/auth-context'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth-token'
import { getBlockedUserMessage, isUserAllowedToAccess } from '@/lib/user-status'
import { authApi } from '@/services/api'
import { setUnauthorizedHandler } from '@/services/api/client'
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

    if (!getStoredToken()) {
      setUser(null)
      setStatus('guest')
      return null
    }

    try {
      const currentUser = await authApi.me()

      if (!isUserAllowedToAccess(currentUser)) {
        clearStoredToken()
        await authApi.logout().catch(() => undefined)
        setUser(null)
        setStatus('guest')
        setError(getBlockedUserMessage(currentUser))
        return null
      }

      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch (refreshError) {
      clearStoredToken()
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
      setStoredToken(response.token)
      const currentUser = await authApi.me().catch(() => response.user)

      if (!isUserAllowedToAccess(currentUser)) {
        clearStoredToken()
        await authApi.logout().catch(() => undefined)
        setUser(null)
        setStatus('error')
        setError(getBlockedUserMessage(currentUser))
        throw new Error(getBlockedUserMessage(currentUser))
      }

      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch (loginError) {
      clearStoredToken()
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
      setStoredToken(response.token)
      const currentUser = await authApi.me().catch(() => response.user)

      if (!isUserAllowedToAccess(currentUser)) {
        clearStoredToken()
        await authApi.logout().catch(() => undefined)
        setUser(null)
        setStatus('error')
        setError(getBlockedUserMessage(currentUser))
        throw new Error(getBlockedUserMessage(currentUser))
      }

      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch (registerError) {
      clearStoredToken()
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
      clearStoredToken()
      setUser(null)
      setStatus('guest')
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('guest')
      setError(null)
    })

    return () => setUnauthorizedHandler(null)
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
