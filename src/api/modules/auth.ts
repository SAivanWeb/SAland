// Auth module

import { post, setAccessToken } from '../network'
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshResponse,
  LogoutResponse,
} from './types'

export const auth = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/register', data, { withAuth: false })
    setAccessToken(response.access_token)
    return response
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/login', data, { withAuth: false })
    setAccessToken(response.access_token)
    return response
  },

  /**
   * Refresh access token using refresh token from cookie
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await post<RefreshResponse>('/auth/refresh', undefined, { withAuth: false })
    setAccessToken(response.access_token)
    return response
  },

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<LogoutResponse> {
    const response = await post<LogoutResponse>('/auth/logout', undefined, { withAuth: false })
    setAccessToken(null)
    return response
  },
}
