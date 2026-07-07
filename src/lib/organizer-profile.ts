import type { ApiUser } from '@/services/api'
import type { Organizer } from '@/types/migunani'

export function getSessionOrganizerId(user?: ApiUser | null) {
  return user?.organizerId ?? user?.organizer?.id
}

export function createOrganizerFallback(user?: ApiUser | null): Organizer {
  const organizer = user?.organizer

  return {
    id: getSessionOrganizerId(user) ?? 'organizer-pending',
    name: organizer?.name ?? user?.name ?? 'Organizer Migunani',
    type: organizer?.type ?? 'Organizer',
    city: organizer?.city ?? user?.city ?? 'Belum diisi',
    verified: Boolean(organizer?.verified),
    logoInitial: organizer?.logoInitial ?? getInitial(organizer?.name ?? user?.name),
    rating: organizer?.rating ?? 0,
    totalEvents: organizer?.totalEvents ?? 0,
    responseTime: organizer?.responseTime ?? 'baru',
  }
}

function getInitial(name?: string) {
  const initial = name?.trim().charAt(0).toUpperCase()

  return initial || 'O'
}
