// Admin module

import { get, del, post, request } from '../network'
import type {
  AdminUsersParams,
  AdminUsersResponse,
  AdminUserDetail,
  AdminEditUserRequest,
  AdminEditUserResponse,
  AdminSetUserStatusRequest,
  AdminSetUserStatusResponse,
  AdminReportsParams,
  AdminReportsResponse,
  AdminResolveReportRequest,
  AdminResolveReportResponse,
  AdminThemesParams,
  AdminThemesResponse,
  AdminThemeDetail,
  AdminCheckThemeRequest,
  AdminCheckThemeResponse,
  AdminGamesParams,
  AdminGamesResponse,
  AdminCreateBody,
  AdminCreateResponse,
} from './types'

export const admin = {
  users: {
    /**
     * Get list of users with pagination and search
     * Requires admin role
     */
    async list(params?: AdminUsersParams): Promise<AdminUsersResponse> {
      return get<AdminUsersResponse>('/admin/users', { params })
    },

    /**
     * Get detailed user info
     * Requires admin role
     */
    async getById(userId: string): Promise<AdminUserDetail> {
      return get<AdminUserDetail>(`/admin/users/${userId}`)
    },

    /**
     * Edit user name/email
     * Requires admin role
     */
    async edit(userId: string, data: AdminEditUserRequest): Promise<AdminEditUserResponse> {
      return request<AdminEditUserResponse>(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: data,
      })
    },

    /**
     * Delete user (cannot delete own account)
     * Requires admin role
     */
    async delete(userId: string): Promise<void> {
      return del<void>(`/admin/users/${userId}`)
    },

    /**
     * Block or unblock user (cannot change own status)
     * Requires admin role
     */
    async setStatus(
      userId: string,
      data: AdminSetUserStatusRequest,
    ): Promise<AdminSetUserStatusResponse> {
      return request<AdminSetUserStatusResponse>(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: data,
      })
    },
  },

  reports: {
    /**
     * Get list of reports with pagination and filters
     * Requires admin role
     */
    async list(params?: AdminReportsParams): Promise<AdminReportsResponse> {
      return get<AdminReportsResponse>('/admin/reports', { params })
    },

    /**
     * Resolve a report, optionally blocking the reported user
     * Requires admin role
     */
    async resolve(
      reportId: string,
      data?: AdminResolveReportRequest,
    ): Promise<AdminResolveReportResponse> {
      return request<AdminResolveReportResponse>(`/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        body: data,
      })
    },
  },

  themes: {
    /**
     * Get list of all permanent themes with search and pagination
     * Requires admin role
     */
    async list(params?: AdminThemesParams): Promise<AdminThemesResponse> {
      return get<AdminThemesResponse>('/admin/themes', { params })
    },

    /**
     * Get theme by ID with full question list
     * Requires admin role
     */
    async getById(themeId: string): Promise<AdminThemeDetail> {
      return get<AdminThemeDetail>(`/admin/themes/${themeId}`)
    },

    /**
     * Delete theme with all its questions
     * Requires admin role
     */
    async delete(themeId: string): Promise<void> {
      return del<void>(`/admin/themes/${themeId}`)
    },

    /**
     * Set or unset theme check flag
     * Requires admin role
     */
    async setCheck(
      themeId: string,
      data: AdminCheckThemeRequest,
    ): Promise<AdminCheckThemeResponse> {
      return request<AdminCheckThemeResponse>(`/admin/themes/${themeId}/check`, {
        method: 'PATCH',
        body: data,
      })
    },

    /**
     * Create theme as admin (saves directly to PostgreSQL)
     * Requires admin role
     */
    async create(data: AdminCreateBody): Promise<AdminCreateResponse> {
      return post<AdminCreateResponse>('/themes/admin/create', data)
    },
  },

  games: {
    /**
     * Get list of active games (currently running, stored in Redis)
     * Requires admin role
     */
    async list(params?: AdminGamesParams): Promise<AdminGamesResponse> {
      return get<AdminGamesResponse>('/admin/games', { params })
    },

    /**
     * Force delete an active game. Players receive game:ended event.
     * Requires admin role
     */
    async delete(gameId: string): Promise<void> {
      return del<void>(`/admin/games/${gameId}`)
    },
  },
}
