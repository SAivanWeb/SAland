// Common API types

/**
 * Общий формат ответа от API
 */
export interface ApiResponse<T> {
  status: boolean
  code: number
  data: T
}

export interface ApiError {
  status: boolean
  code: number
  message: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  total: number
  items: T[]
}

export interface UserStats {
  games_played: number
  games_won: number
  win_rate: number
  total_territories_captured: number
  total_questions_answered: number
  total_correct_answers: number
}

export interface PublicUserStats {
  games_played: number
  games_won: number
}
