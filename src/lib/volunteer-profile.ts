import type { ApiUser } from '@/services/api'
import type { VolunteerProfile } from '@/types/migunani'

const emptyProfile: VolunteerProfile = {
  id: 'usr-volunteer',
  name: 'Relawan Migunani',
  university: 'Profil belum dilengkapi',
  major: 'Umum',
  city: 'Belum dilengkapi',
  avatarInitials: 'RM',
  totalHours: 0,
  completedEvents: 0,
  certificates: 0,
  savedEventIds: [],
  interests: [],
}

export function createVolunteerProfileFallback(user?: ApiUser | null): VolunteerProfile {
  if (!user) {
    return emptyProfile
  }

  const name = user.name?.trim() || emptyProfile.name

  return {
    ...emptyProfile,
    id: String(user.id),
    name,
    city: user.city?.trim() || emptyProfile.city,
    avatarInitials: user.avatarInitials?.trim() || getInitials(name),
  }
}

export function normalizeVolunteerProfile(
  profile: Partial<VolunteerProfile> | undefined,
  fallback: VolunteerProfile = emptyProfile,
): VolunteerProfile {
  return {
    id: profile?.id ?? fallback.id,
    name: profile?.name?.trim() || fallback.name,
    university: profile?.university?.trim() || fallback.university,
    major: profile?.major?.trim() || fallback.major,
    city: profile?.city?.trim() || fallback.city,
    avatarInitials:
      profile?.avatarInitials?.trim() ||
      fallback.avatarInitials ||
      getInitials(profile?.name ?? fallback.name),
    totalHours: normalizeNumber(profile?.totalHours, fallback.totalHours),
    completedEvents: normalizeNumber(profile?.completedEvents, fallback.completedEvents),
    certificates: normalizeNumber(profile?.certificates, fallback.certificates),
    savedEventIds: profile?.savedEventIds ?? fallback.savedEventIds,
    interests: profile?.interests ?? fallback.interests,
  }
}

export function getVolunteerActivity(totalHours: number) {
  const hours = normalizeNumber(totalHours, 0)

  if (hours >= 100) {
    return {
      level: 4,
      tierLabel: 'Impact Leader',
      currentLevelHours: 100,
      nextLevelHours: 150,
    }
  }

  if (hours >= 60) {
    return {
      level: 3,
      tierLabel: 'Gold Member',
      currentLevelHours: 60,
      nextLevelHours: 100,
    }
  }

  if (hours >= 25) {
    return {
      level: 2,
      tierLabel: 'Active Member',
      currentLevelHours: 25,
      nextLevelHours: 60,
    }
  }

  return {
    level: 1,
    tierLabel: 'Starter',
    currentLevelHours: 0,
    nextLevelHours: 25,
  }
}

export function getVolunteerProgressPercent(totalHours: number) {
  const hours = normalizeNumber(totalHours, 0)
  const activity = getVolunteerActivity(hours)
  const levelRange = activity.nextLevelHours - activity.currentLevelHours

  if (levelRange <= 0) {
    return 100
  }

  return Math.min(
    Math.max(((hours - activity.currentLevelHours) / levelRange) * 100, 0),
    100,
  )
}

function normalizeNumber(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Math.max(value ?? fallback, 0) : fallback
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || emptyProfile.avatarInitials
}
