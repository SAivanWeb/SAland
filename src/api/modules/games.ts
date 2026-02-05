// Games module

import { post } from '../network'
import type { RateTempThemeBody, RateTempThemeResponse } from './types'

export const games = {
  /**
   * Rate a temporary theme after game ends
   */
  async rateTempTheme(gameId: string, data: RateTempThemeBody): Promise<RateTempThemeResponse> {
    return post<RateTempThemeResponse>(`/games/${gameId}/rate-temp-theme`, data)
  },
}
