// Admin module

import { get, del, request } from '../network'
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
      return request<AdminEditUserResponse>(`/admin/users/${userId}`, { method: 'PATCH', body: data })
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
    async setStatus(userId: string, data: AdminSetUserStatusRequest): Promise<AdminSetUserStatusResponse> {
      return request<AdminSetUserStatusResponse>(`/admin/users/${userId}/status`, { method: 'PATCH', body: data })
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
    async resolve(reportId: string, data?: AdminResolveReportRequest): Promise<AdminResolveReportResponse> {
      return request<AdminResolveReportResponse>(`/admin/reports/${reportId}/resolve`, { method: 'PATCH', body: data })
    },
  },
}
