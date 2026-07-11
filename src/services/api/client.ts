import { clearStoredToken, getStoredToken } from '@/lib/auth-token'
import type { ApiErrorPayload } from '@/services/api/types'

const DEFAULT_API_BASE_URL = 'https://api.wishmeluck.web.id'

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const API_MODE = import.meta.env.VITE_API_MODE ?? 'fallback'

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
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

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

function buildRequestInit(options: ApiRequestOptions) {
  const method = options.method?.toUpperCase() ?? 'GET'
  const headers = new Headers(options.headers)
  const { body, ...requestOptions } = options

  headers.set('Accept', 'application/json')

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const init: RequestInit = { ...requestOptions, method, headers }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(body)
  }

  return { init, hadToken: Boolean(token) }
}

function handleUnauthorized(status: number, hadToken: boolean) {
  if (status === 401 && hadToken) {
    clearStoredToken()
    unauthorizedHandler?.()
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { init, hadToken } = buildRequestInit(options)

  const response = await fetch(toApiUrl(path), init)
  const payload = await parseResponse(response)

  if (!response.ok) {
    handleUnauthorized(response.status, hadToken)
    throw new ApiError(response.status, normalizeErrorPayload(payload))
  }

  return payload as T
}

export async function apiRequestBlob(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Blob> {
  const { init, hadToken } = buildRequestInit(options)

  const response = await fetch(toApiUrl(path), init)

  if (!response.ok) {
    handleUnauthorized(response.status, hadToken)
    const payload = await parseResponse(response)
    throw new ApiError(response.status, normalizeErrorPayload(payload))
  }

  return response.blob()
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
