import type {
  AdminStat,
  Category,
  Certificate,
  Organizer,
  PlatformUser,
  VolunteerApplication,
  VolunteerEvent,
} from '@/types/migunani'
import type {
  ApiAdminDashboard,
  ApiApplication,
  ApiCategory,
  ApiCertificate,
  ApiEvent,
  ApiHome,
  ApiOrganizer,
  ApiVolunteerDashboard,
} from '@/services/api/types'
import { getOrganizerVerified } from '@/lib/organizer-profile'

export function unwrapData<T>(payload: { data: T } | T): T {
  if (isObject(payload) && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    bgColor: category.bgColor,
  }
}

export function mapOrganizer(organizer: ApiOrganizer): Organizer {
  return {
    id: organizer.id,
    name: organizer.name ?? 'Organizer Migunani',
    type: organizer.type ?? 'Organizer',
    city: organizer.city ?? 'Belum diisi',
    verified: getOrganizerVerified(organizer),
    logoInitial: organizer.logoInitial ?? organizer.logo_initial ?? getInitial(organizer.name),
    rating: organizer.rating ?? 0,
    totalEvents: organizer.totalEvents ?? organizer.total_events ?? 0,
    responseTime: organizer.responseTime ?? organizer.response_time ?? 'baru',
  }
}

export function mapEvent(event: ApiEvent): VolunteerEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category,
    organizerId: event.organizerId,
    location: event.location,
    city: event.city,
    mode: event.mode,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    durationHours: event.durationHours,
    quota: event.quota,
    registered: event.registered,
    status: event.status,
    image: event.image,
    shortDescription: event.shortDescription,
    description: event.description,
    benefits: event.benefits ?? [],
    skills: event.skills ?? [],
    roles: event.roles ?? [],
    impactTarget: event.impactTarget,
    tags: event.tags ?? [],
    featured: event.featured,
  }
}

export function mapApplication(application: ApiApplication): VolunteerApplication {
  return {
    id: application.id,
    eventId: application.eventId,
    role: application.role,
    status: application.status,
    submittedAt: application.submittedAt,
    motivation: application.motivation,
    availability: application.availability ?? [],
    checkedInAt: application.checkedInAt ?? application.checked_in_at,
  }
}

export function mapCertificate(certificate: ApiCertificate): Certificate {
  return {
    id: certificate.id,
    eventId: certificate.eventId,
    issuedAt: certificate.issuedAt,
    credentialId: certificate.credentialId,
    hours: certificate.hours,
  }
}

export function mapHome(home: ApiHome) {
  return {
    stats: home.stats,
    categories: home.categories.map(mapCategory),
    featuredEvents: home.featuredEvents.map(mapEvent),
  }
}

export function mapVolunteerDashboard(dashboard: ApiVolunteerDashboard) {
  return {
    profile: dashboard.profile,
    applications: dashboard.applications.map(mapApplication),
    certificates: dashboard.certificates.map(mapCertificate),
    savedEvents: dashboard.savedEvents.map(mapEvent),
  }
}

export function mapAdminStats(dashboard: ApiAdminDashboard): AdminStat[] {
  return dashboard.stats.map((stat) => ({
    id: stat.id,
    label: stat.label,
    value: stat.value,
    helper: stat.helper,
  }))
}

export function mapPlatformUser(user: PlatformUser): PlatformUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    city: user.city,
    joinedAt: user.joinedAt,
    avatarInitials: user.avatarInitials,
  }
}

export async function withApiFallback<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  label = 'api call',
): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[api:fallback] ${label}`, error)
    }

    return fallbackValue
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getInitial(name?: string) {
  const initial = name?.trim().charAt(0).toUpperCase()

  return initial || 'O'
}
