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

  return unwrapData(
    await apiRequest<ApiEnvelope<ApiAuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: payload,
    }),
  )
}

export async function register(payload: ApiRegisterPayload) {
  await csrf()

  return unwrapData(
    await apiRequest<ApiEnvelope<ApiAuthResponse>>('/api/auth/register', {
      method: 'POST',
      body: payload,
    }),
  )
}

export async function me() {
  const payload = unwrapData(
    await apiRequest<ApiEnvelope<ApiUser | ApiAuthResponse>>('/api/auth/me'),
  )

  return isAuthResponse(payload) ? payload.user : payload
}

export async function logout() {
  await apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  })
}

function isAuthResponse(value: ApiUser | ApiAuthResponse): value is ApiAuthResponse {
  return typeof value === 'object' && value !== null && 'user' in value
}
