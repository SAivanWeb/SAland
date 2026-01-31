// Auth module types

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  user: AuthUser
  access_token: string
}

export interface RefreshResponse {
  access_token: string
}

export interface LogoutResponse {
  message: string
}
