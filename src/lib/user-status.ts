import type { ApiUser } from '@/services/api/types'

export function isUserAllowedToAccess(user?: ApiUser | null) {
  return !user?.status || user.status === 'Active'
}

export function getBlockedUserMessage(user?: ApiUser | null) {
  if (user?.status === 'Suspended') {
    return 'Akun kamu sedang ditangguhkan. Hubungi admin Migunani jika ini keliru.'
  }

  if (user?.status === 'Inactive') {
    return 'Akun kamu belum aktif. Hubungi admin Migunani untuk mengaktifkan akses.'
  }

  return 'Akun belum bisa mengakses Migunani.'
}
