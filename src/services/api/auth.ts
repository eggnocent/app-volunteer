import { apiRequest, csrf } from '@/services/api/client'
import { unwrapData } from '@/services/api/adapters'
import type {
  ApiAuthResponse,
  ApiEnvelope,
  ApiLoginPayload,
  ApiRegisterPayload,
  ApiUser,
} from '@/services/api/types'

export async function login(payload: ApiLoginPayload) {
  await csrf()

  const response = unwrapData(
    await apiRequest<ApiEnvelope<ApiAuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: payload,
    }),
  )

  return { user: normalizeAuthUser(response) }
}

export async function register(payload: ApiRegisterPayload) {
  await csrf()

  const response = unwrapData(
    await apiRequest<ApiEnvelope<ApiAuthResponse>>('/api/auth/register', {
      method: 'POST',
      body: payload,
    }),
  )

  return { user: normalizeAuthUser(response) }
}

export async function me() {
  const payload = unwrapData(
    await apiRequest<ApiEnvelope<ApiUser | ApiAuthResponse>>('/api/auth/me'),
  )

  return normalizeAuthUser(payload)
}

export async function logout() {
  await apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  })
}

function normalizeAuthUser(value: unknown): ApiUser {
  const payload = unwrapNestedData(value)
  const user = isRecord(payload) && isRecord(payload.user)
    ? unwrapNestedData(payload.user)
    : payload

  if (!isRecord(user)) {
    return payload as ApiUser
  }

  const root = isRecord(payload) ? payload : {}
  const mergedUser: Record<string, unknown> = { ...user }
  const organizer = mergedUser.organizer ??
    mergedUser.organization ??
    root.organizer ??
    root.organization
  const organizers = mergedUser.organizers ?? root.organizers

  mergedUser.organizerId =
    mergedUser.organizerId ??
    mergedUser.organizer_id ??
    root.organizerId ??
    root.organizer_id ??
    getOrganizerId(organizer) ??
    getOrganizerId(organizers)
  mergedUser.organizer_id = mergedUser.organizer_id ?? root.organizer_id
  mergedUser.organizer = organizer ?? mergedUser.organizer
  mergedUser.organization = mergedUser.organization ?? root.organization
  mergedUser.organizers = organizers ?? mergedUser.organizers

  return mergedUser as ApiUser
}

function unwrapNestedData(value: unknown): unknown {
  if (isRecord(value) && 'data' in value) {
    return unwrapNestedData(value.data)
  }

  return value
}

function getOrganizerId(value: unknown) {
  const organizer = Array.isArray(value) ? value[0] : value
  const unwrappedOrganizer = unwrapNestedData(organizer)

  if (!isRecord(unwrappedOrganizer)) {
    return undefined
  }

  return unwrappedOrganizer.id
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
