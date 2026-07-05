import type { ApiErrorPayload } from '@/services/api/types'

const DEFAULT_API_BASE_URL = 'https://api.wishmeluck.web.id'

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const API_MODE = import.meta.env.VITE_API_MODE ?? 'fallback'

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipCsrf?: boolean
}

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message ?? `API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET'
  const headers = new Headers(options.headers)
  const { body, skipCsrf = false, ...requestOptions } = options

  headers.set('Accept', 'application/json')

  const init: RequestInit = {
    ...requestOptions,
    method,
    headers,
    credentials: 'include',
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(body)
  }

  if (requiresCsrf(method) && !skipCsrf) {
    headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN') ?? '')
  }

  const response = await fetch(toApiUrl(path), init)
  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(response.status, normalizeErrorPayload(payload))
  }

  return payload as T
}

export async function csrf() {
  await apiRequest<void>('/sanctum/csrf-cookie', {
    method: 'GET',
    skipCsrf: true,
  })
}

export function toApiUrl(path: string) {
  if (path.startsWith('http')) {
    return path
  }

  if (!API_BASE_URL) {
    return path.startsWith('/') ? path : `/${path}`
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function normalizeApiBaseUrl(value: string | undefined) {
  if (value === undefined) {
    if (isVercelAppHost()) {
      return ''
    }

    return DEFAULT_API_BASE_URL
  }

  const normalizedValue = value.trim()

  if (!normalizedValue || normalizedValue === '/') {
    return ''
  }

  return normalizedValue.replace(/\/$/, '')
}

function isVercelAppHost() {
  return (
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('.vercel.app')
  )
}

function requiresCsrf(method: string) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
}

function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return value ? decodeURIComponent(value) : null
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()

  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

function normalizeErrorPayload(payload: unknown): ApiErrorPayload | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  return payload as ApiErrorPayload
}
