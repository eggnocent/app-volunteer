import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { isUserAllowedToAccess } from '@/lib/user-status'
import { useAuth } from '@/providers/useAuth'
import type { UserRole } from '@/types/migunani'
import type { ReactNode } from 'react'

type ProtectedRouteProps = {
  roles: UserRole[]
  loginPath: string
  children: ReactNode
}

export function ProtectedRoute({
  roles,
  loginPath,
  children,
}: ProtectedRouteProps) {
  const { logout, user, status, refresh } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') {
      void refresh()
    }
  }, [refresh, status])

  useEffect(() => {
    if (user && !isUserAllowedToAccess(user)) {
      void logout()
    }
  }, [logout, user])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-bold text-foreground">
            Memeriksa sesi...
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Menghubungkan akun dengan dashboard Migunani.
          </p>
        </div>
      </div>
    )
  }

  if (!user || status === 'guest' || status === 'error') {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)

    return <Navigate to={`${loginPath}?next=${next}`} replace />
  }

  if (!isUserAllowedToAccess(user)) {
    return <Navigate to={loginPath} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return children
}

function getRoleHome(role: UserRole) {
  if (role === 'admin') {
    return '/portal/dashboard'
  }

  if (role === 'organizer') {
    return '/organizer/dashboard'
  }

  return '/volunteer/dashboard'
}
