// Themes module

import { get, post, del } from '../network'
import type {
  PopularThemesParams,
  ThemesListResponse,
  ThemeDetail,
  RateThemeBody,
  RateThemeResponse,
  // AI generation types
  AIGenerateBody,
  AIGenerateResponse,
  AIStatusResponse,
  AIQuestionsResponse,
  AIDeleteResponse,
  // Manual theme types
  ManualCreateBody,
  ManualCreateResponse,
  ManualQuestionsResponse,
  ManualDeleteResponse,
  // Admin types
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

  // ============= AI Generation =============

  ai: {
    /**
     * Start AI theme generation
     */
    async generate(data: AIGenerateBody): Promise<AIGenerateResponse> {
      return post<AIGenerateResponse>('/themes/ai/generate', data)
    },

    /**
     * Get generation status
     */
    async getStatus(sessionId: string): Promise<AIStatusResponse> {
      return get<AIStatusResponse>(`/themes/ai/${sessionId}/status`)
    },

    /**
     * Get generated questions for preview
     */
    async getQuestions(sessionId: string): Promise<AIQuestionsResponse> {
      return get<AIQuestionsResponse>(`/themes/ai/${sessionId}/questions`)
    },

    /**
     * Cancel generation and delete all data
     */
    async cancel(sessionId: string): Promise<AIDeleteResponse> {
      return del<AIDeleteResponse>(`/themes/ai/${sessionId}`)
    },
  },

  // ============= Manual Theme Creation =============

  manual: {
    /**
     * Create theme manually (upload JSON with questions)
     * @deprecated Use WebSocket room:upload_theme instead
     */
    async create(data: ManualCreateBody): Promise<ManualCreateResponse> {
      return post<ManualCreateResponse>('/themes/manual/create', data)
    },

    /**
     * Get uploaded questions for preview
     */
    async getQuestions(sessionId: string): Promise<ManualQuestionsResponse> {
      return get<ManualQuestionsResponse>(`/themes/manual/${sessionId}/questions`)
    },

    /**
     * Cancel and delete manual session
     */
    async cancel(sessionId: string): Promise<ManualDeleteResponse> {
      return del<ManualDeleteResponse>(`/themes/manual/${sessionId}`)
    },
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
