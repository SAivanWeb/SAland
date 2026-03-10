// Network layer for API requests

import type { ApiResponse } from './modules/types'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  params?: QueryParams
  headers?: Record<string, string>
  withAuth?: boolean
}

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
  if (token) {
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token')
  }
  return accessToken
}

function buildUrl(endpoint: string, params?: QueryParams): string {
  // Убираем trailing slash из BASE_URL и leading slash из endpoint
  const base = BASE_URL.replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${base}${path}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      setAccessToken(null)
      window.location.href = '/auth'
      return null
    }

    const json: ApiResponse<{ access_token: string }> = await response.json()

    if (json.status !== 'success') {
      setAccessToken(null)
      window.location.href = '/auth'
      return null
    }

    setAccessToken(json.data.access_token)
    return json.data.access_token
  } catch {
    setAccessToken(null)
    window.location.href = '/auth'
    return null
  }
}

async function ensureValidToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }
  return getAccessToken()
}

export class ApiRequestError extends Error {
  httpStatus: number

  constructor(httpStatus: number, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.httpStatus = httpStatus
  }
}

function redirectToError(): void {
  if (window.location.pathname !== '/error') {
    window.location.href = '/error'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T
  }

  const json: ApiResponse<T> = await response.json()

  if (!response.ok || json.status !== 'success') {
    const errorData = json as unknown as { message?: string; status: string }
    throw new ApiRequestError(
      response.status,
      errorData.message || 'Request failed',
    )
  }

  return json.data
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers = {}, withAuth = true } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (withAuth) {
    const token = await ensureValidToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const url = buildUrl(endpoint, params)

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(url, fetchOptions)
  } catch {
    redirectToError()
    throw new ApiRequestError(0, 'Network error')
  }

  if (response.status >= 500) {
    redirectToError()
    throw new ApiRequestError(response.status, 'Server error')
  }

  // Handle 401 - try to refresh token and retry
  if (response.status === 401 && withAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken()
    }

    const newToken = await refreshPromise
    refreshPromise = null

    if (newToken) {
      requestHeaders['Authorization'] = `Bearer ${newToken}`
      response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      })
    } else {
      throw new ApiRequestError(401, 'Unauthorized')
    }
  }

  return handleResponse<T>(response)
}

// Shorthand methods
export function get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

export function post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'POST', body })
}

export function put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'PUT', body })
}

export function del<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' })
}
