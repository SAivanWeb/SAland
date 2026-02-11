// Themes module

import { get, post } from '../network'
import type {
  PopularThemesParams,
  ThemesListResponse,
  ThemeDetail,
  RateThemeBody,
  RateThemeResponse,
  AdminCreateBody,
  AdminCreateResponse,
} from './types'

export const themes = {
  /**
   * Get popular themes with pagination, search and filters
   */
  async popular(params?: PopularThemesParams): Promise<ThemesListResponse> {
    return get<ThemesListResponse>('/themes/popular', { params })
  },

  /**
   * Get theme details
   */
  async getById(themeId: string): Promise<ThemeDetail> {
    return get<ThemeDetail>(`/themes/${themeId}`)
  },

  /**
   * Rate a permanent theme after game
   */
  async rate(themeId: string, data: RateThemeBody): Promise<RateThemeResponse> {
    return post<RateThemeResponse>(`/themes/${themeId}/rate`, data)
  },

  // ============= Admin =============

  admin: {
    /**
     * Create theme as admin (saves directly to PostgreSQL)
     * Requires admin role
     */
    async create(data: AdminCreateBody): Promise<AdminCreateResponse> {
      return post<AdminCreateResponse>('/themes/admin/create', data)
    },
  },
}
