// Admin module types

import type { UserStats } from './common'

export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'blocked'
export type ReportStatus = 'pending' | 'resolved'

// ============= Users =============

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  blocked_at: number | null
  block_reason: string | null
  created_at: number
  reports_count: number
}

export interface AdminUserDetail extends AdminUser {
  stats: UserStats | null
}

export interface AdminUsersParams {
  q?: string
  page?: number
  size?: number
}

export interface AdminUsersPagination {
  page: number
  size: number
  total_elements: number
  total_pages: number
}

export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: AdminUsersPagination
}

export interface AdminEditUserRequest {
  name?: string
  email?: string
}

export interface AdminEditUserResponse {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  created_at: number
}

export interface AdminSetUserStatusRequest {
  status: UserStatus
  reason?: string
}

export interface AdminSetUserStatusResponse {
  id: string
  status: UserStatus
  blocked_at: number | null
  block_reason: string | null
}

// ============= Reports =============

export interface AdminReport {
  id: string
  reason: string
  status: ReportStatus
  resolved_at: number | null
  resolved_comment: string | null
  created_at: number
  reporter: {
    id: string
    name: string
    email: string
  }
  reported_user: {
    id: string
    name: string
    email: string
    status: UserStatus
  }
  resolver: {
    id: string
    name: string
  } | null
}

export interface AdminReportsParams {
  q?: string
  status?: ReportStatus
  page?: number
  size?: number
}

export interface AdminReportsPagination {
  page: number
  size: number
  total_elements: number
  total_pages: number
}

export interface AdminReportsResponse {
  reports: AdminReport[]
  pagination: AdminReportsPagination
}

export interface AdminResolveReportRequest {
  comment?: string
  block_user?: boolean
  block_reason?: string
}

export interface AdminResolveReportResponse {
  success: true
}

// ============= Themes =============

export interface AdminTheme {
  id: string
  name: string
  questions_count: number
  check: boolean
}

export interface AdminThemeQuestion {
  id: string
  question: string
  answers: string[]
  correct_answer: number
}

export interface AdminThemeDetail {
  id: string
  name: string
  questions: AdminThemeQuestion[]
}

export interface AdminThemesParams {
  q?: string
  page?: number
  size?: number
}

export interface AdminThemesPagination {
  page: number
  size: number
  total: number
  total_pages: number
}

export interface AdminThemesResponse {
  themes: AdminTheme[]
  pagination: AdminThemesPagination
}

export interface AdminCheckThemeRequest {
  check: boolean
}

export interface AdminCheckThemeResponse {
  id: string
  name: string
  check: boolean
}

// ============= Games =============

export interface AdminGame {
  id: string
  theme_name: string
  players_count: number
}

export interface AdminGamesParams {
  q?: string
  page?: number
  size?: number
}

export interface AdminGamesPagination {
  page: number
  size: number
  total: number
  total_pages: number
}

export interface AdminGamesResponse {
  games: AdminGame[]
  pagination: AdminGamesPagination
}
