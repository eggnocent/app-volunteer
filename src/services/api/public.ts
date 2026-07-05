import { apiRequest } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type {
  ApiCategory,
  ApiCertificate,
  ApiEnvelope,
  ApiEvent,
  ApiHome,
  ApiOrganizer,
} from '@/services/api/types'

export function getHealth() {
  return apiRequest<ApiEnvelope<{ ok: boolean; service: string }>>('/api/health')
}

export async function getHome() {
  return unwrapData(await apiRequest<ApiEnvelope<ApiHome>>('/api/home'))
}

export async function getCategories() {
  return unwrapData(await apiRequest<ApiEnvelope<ApiCategory[]>>('/api/categories'))
}

export async function getOrganizers() {
  return unwrapData(await apiRequest<ApiEnvelope<ApiOrganizer[]>>('/api/organizers'))
}

export async function getOrganizer(id: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiOrganizer>>(`/api/organizers/${id}`),
  )
}

export async function getEvents() {
  return unwrapData(await apiRequest<ApiEnvelope<ApiEvent[]>>('/api/events'))
}

export async function getEvent(idOrSlug: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiEvent>>(`/api/events/${idOrSlug}`),
  )
}

export async function verifyCertificate(credentialId: string) {
  return unwrapData(
    await apiRequest<ApiEnvelope<ApiCertificate>>(
      `/api/certificates/verify/${credentialId}`,
    ),
  )
}
