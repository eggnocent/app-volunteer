import { apiRequest } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type {
  ApiApplication,
  ApiCertificate,
  ApiEnvelope,
  ApiEvent,
  ApiOrganizerDashboard,
} from '@/services/api/types'
import type {
  ApplicationStatus,
  EventCategory,
  EventMode,
  VolunteerRole,
} from '@/types/migunani'

export type OrganizerEventPayload = {
  title: string
  categoryId: string
  category_id: string
  category: EventCategory
  mode: EventMode
  city: string
  location: string
  date: string
  startTime: string
  endTime: string
  quota: number
  description: string
  benefits: string[]
  skills: string[]
  roles: VolunteerRole[]
}

export async function getOrganizerDashboard(organizerId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiOrganizerDashboard>>(
      `/api/organizers/${organizerId}/dashboard`,
    ),
  )
}

export async function getOrganizerEvents(organizerId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent[]>>(
      `/api/organizers/${organizerId}/events`,
    ),
  )
}

export async function createOrganizerEvent(
  organizerId: string,
  payload: OrganizerEventPayload,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(`/api/organizers/${organizerId}/events`, {
      method: 'POST',
      body: payload,
    }),
  )
}

export async function getOrganizerEvent(organizerId: string, eventId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(
      `/api/organizers/${organizerId}/events/${eventId}`,
    ),
  )
}

export async function updateOrganizerEvent(
  organizerId: string,
  eventId: string,
  payload: Partial<OrganizerEventPayload>,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(
      `/api/organizers/${organizerId}/events/${eventId}`,
      {
        method: 'PATCH',
        body: payload,
      },
    ),
  )
}

export async function getOrganizerApplications(organizerId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication[]>>(
      `/api/organizers/${organizerId}/applications`,
    ),
  )
}

export async function getOrganizerApplication(
  organizerId: string,
  applicationId: string,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication>>(
      `/api/organizers/${organizerId}/applications/${applicationId}`,
    ),
  )
}

export async function updateApplicationStatus(
  organizerId: string,
  applicationId: string,
  status: ApplicationStatus,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication>>(
      `/api/organizers/${organizerId}/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        body: { status },
      },
    ),
  )
}

export async function checkInApplication(
  organizerId: string,
  applicationId: string,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication>>(
      `/api/organizers/${organizerId}/applications/${applicationId}/check-in`,
      {
        method: 'PATCH',
      },
    ),
  )
}

export async function getOrganizerCertificates(organizerId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate[]>>(
      `/api/organizers/${organizerId}/certificates`,
    ),
  )
}

export async function getOrganizerCertificate(
  organizerId: string,
  certificateId: string,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/organizers/${organizerId}/certificates/${certificateId}`,
    ),
  )
}

export async function issueCertificate(organizerId: string, applicationId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/organizers/${organizerId}/applications/${applicationId}/certificate`,
      {
        method: 'POST',
      },
    ),
  )
}

export async function revokeCertificate(
  organizerId: string,
  certificateId: string,
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/organizers/${organizerId}/certificates/${certificateId}/revoke`,
      {
        method: 'PATCH',
      },
    ),
  )
}

export async function createReplacementCertificate(
  organizerId: string,
  certificateId: string,
  payload: { reason?: string },
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/organizers/${organizerId}/certificates/${certificateId}/replacement`,
      {
        method: 'POST',
        body: payload,
      },
    ),
  )
}
