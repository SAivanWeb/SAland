// Network layer for API requests

import type { ApiError } from './modules/types'

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

    const data = await response.json()
    setAccessToken(data.access_token)
    window.location.href = '/games'
    return data.access_token
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

export class ApiRequestError extends Error implements ApiError {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Request failed'
    let code: string | undefined

    try {
      const errorData = await response.json()
      message = errorData.message || message
      code = errorData.code
    } catch {
      // Ignore JSON parse error
    }

    throw new ApiRequestError(response.status, message, code)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
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

  let response = await fetch(url, fetchOptions)

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
