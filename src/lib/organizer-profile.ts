import type { ApiOrganizer, ApiUser } from '@/services/api/types'
import type { Organizer } from '@/types/migunani'

type OrganizerVerificationSource = Partial<Organizer> & {
  isVerified?: unknown
  is_verified?: unknown
  verifiedAt?: string | null
  verified_at?: string | null
  verificationStatus?: string | null
  verification_status?: string | null
}

export function getSessionOrganizerId(user?: ApiUser | null) {
  return user?.organizerId ??
    user?.organizer_id ??
    getSessionOrganizer(user)?.id
}

export function getSessionOrganizer(user?: ApiUser | null) {
  return user?.organizer ?? user?.organization ?? user?.organizers?.[0]
}

export function createOrganizerFallback(user?: ApiUser | null): Organizer {
  const organizer = getSessionOrganizer(user)

  return {
    id: getSessionOrganizerId(user) ?? 'organizer-pending',
    name: organizer?.name ?? user?.name ?? 'Organizer Migunani',
    type: organizer?.type ?? 'Organizer',
    city: organizer?.city ?? user?.city ?? 'Belum diisi',
    verified: getOrganizerVerified(organizer),
    logoInitial: organizer?.logoInitial ?? getInitial(organizer?.name ?? user?.name),
    rating: organizer?.rating ?? 0,
    totalEvents: organizer?.totalEvents ?? 0,
    responseTime: organizer?.responseTime ?? 'baru',
  }
}

export function getOrganizerVerified(
  organizer?: ApiOrganizer | OrganizerVerificationSource | null,
) {
  if (!organizer) {
    return false
  }

  if (toBoolean(organizer.verified)) {
    return true
  }

  if (toBoolean(organizer.isVerified) || toBoolean(organizer.is_verified)) {
    return true
  }

  if (organizer.verifiedAt || organizer.verified_at) {
    return true
  }

  const status = (organizer.verificationStatus ?? organizer.verification_status)
    ?.toString()
    .trim()
    .toLowerCase()

  return status === 'verified' || status === 'approved' || status === 'active'
}

function getInitial(name?: string) {
  const initial = name?.trim().charAt(0).toUpperCase()

  return initial || 'O'
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'verified', 'approved', 'active'].includes(
      value.trim().toLowerCase(),
    )
  }

  return false
}
