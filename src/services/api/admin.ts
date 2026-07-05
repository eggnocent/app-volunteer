import { apiRequest } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type {
  ApiAdminDashboard,
  ApiEnvelope,
  ApiEvent,
  ApiOrganizer,
} from '@/services/api/types'
import type { EventStatus, PlatformUser, UserStatus } from '@/types/migunani'

export async function getAdminDashboard() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiAdminDashboard>>('/api/admin/dashboard'),
  )
}

export async function getAdminUsers() {
  return unwrapData(await apiRequest<ApiEnvelope<PlatformUser[]>>('/api/admin/users'))
}

export async function getAdminEvents() {
  return unwrapData(await apiRequest<ApiEnvelope<ApiEvent[]>>('/api/admin/events'))
}

export async function getAdminOrganizers() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiOrganizer[]>>('/api/admin/organizers'),
  )
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return unwrapData(
    await apiRequest<ApiEnvelope<PlatformUser>>(
      `/api/admin/users/${toAdminUserRouteId(userId)}/status`,
      {
        method: 'PATCH',
        body: { status },
      },
    ),
  )
}

export async function updateOrganizerVerification(
  organizerId: string,
  verified: boolean,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiOrganizer>>(
      `/api/admin/organizers/${organizerId}/verification`,
      {
        method: 'PATCH',
        body: { verified },
      },
    ),
  )
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(`/api/admin/events/${eventId}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  )
}

function toAdminUserRouteId(userId: string) {
  return userId.match(/^usr-\d+$/) ? userId.replace('usr-', '') : userId
}
