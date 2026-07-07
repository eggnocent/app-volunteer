import type { ApiUser } from '@/services/api'
import type { Organizer } from '@/types/migunani'

export function createOrganizerFallback(user?: ApiUser | null): Organizer {
  return {
    id: user?.organizerId ?? 'organizer-pending',
    name: user?.name ?? 'Organizer Migunani',
    type: 'Organizer',
    city: user?.city ?? 'Belum diisi',
    verified: false,
    logoInitial: getInitial(user?.name),
    rating: 0,
    totalEvents: 0,
    responseTime: 'baru',
  }
}

function getInitial(name?: string) {
  const initial = name?.trim().charAt(0).toUpperCase()

  return initial || 'O'
}
