import { apiRequest, apiRequestBlob } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type {
  ApiApplication,
  ApiCertificate,
  ApiEnvelope,
  ApiEvent,
  ApiVolunteerDashboard,
} from '@/services/api/types'
import type { VolunteerProfile, VolunteerRole } from '@/types/migunani'

export async function getProfile() {
  return unwrapData(await apiRequest<ApiEnvelope<VolunteerProfile>>('/api/profile'))
}

export async function getVolunteerDashboard() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiVolunteerDashboard>>('/api/volunteer/dashboard'),
  )
}

export async function getVolunteerApplications() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication[]>>('/api/volunteer/applications'),
  )
}

export async function cancelVolunteerApplication(applicationId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication>>(
      `/api/volunteer/applications/${applicationId}/cancel`,
      {
        method: 'PATCH',
      },
    ),
  )
}

export async function applyToEvent(
  eventId: string,
  payload: {
    role: VolunteerRole
    motivation: string
    availability: string[]
  },
) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiApplication>>(
      `/api/events/${eventId}/applications`,
      {
        method: 'POST',
        body: payload,
      },
    ),
  )
}

export async function getSavedEvents() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent[]>>('/api/volunteer/saved-events'),
  )
}

export async function saveEvent(eventId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(
      `/api/volunteer/saved-events/${eventId}`,
      {
        method: 'PUT',
      },
    ),
  )
}

export async function removeSavedEvent(eventId: string) {
  await apiRequest<void>(`/api/volunteer/saved-events/${eventId}`, {
    method: 'DELETE',
  })
}

export async function getVolunteerCertificates() {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate[]>>(
      '/api/volunteer/certificates',
    ),
  )
}

export async function getVolunteerCertificate(certificateId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/volunteer/certificates/${certificateId}`,
    ),
  )
}

export function getVolunteerCertificateDownloadUrl(certificateId: string) {
  return `/api/volunteer/certificates/${certificateId}/download`
}

export async function downloadVolunteerCertificate(certificateId: string) {
  return apiRequestBlob(getVolunteerCertificateDownloadUrl(certificateId))
}
