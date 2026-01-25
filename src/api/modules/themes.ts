// Themes module

import { get, post } from '../network'
import type {
  PopularThemesParams,
  ThemesListResponse,
  SearchThemesParams,
  ThemeDetail,
  RateThemeBody,
  RateThemeResponse,
} from './types'

export const themes = {
  /**
   * Get popular themes
   */
  async popular(params?: PopularThemesParams): Promise<ThemesListResponse> {
    return get<ThemesListResponse>('/themes/popular', { params })
  },

  /**
   * Search themes
   */
  async search(params: SearchThemesParams): Promise<ThemesListResponse> {
    return get<ThemesListResponse>('/themes/search', { params })
  },

  /**
   * Get theme details
   */
  async getById(themeId: string): Promise<ThemeDetail> {
    return get<ThemeDetail>(`/themes/${themeId}`)
  },

  /**
   * Rate a theme
   */
  async rate(themeId: string, data: RateThemeBody): Promise<RateThemeResponse> {
    return post<RateThemeResponse>(`/themes/${themeId}/rate`, data)
  },
}
