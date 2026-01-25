// Common API types

export interface ApiError {
  status: number
  message: string
  code?: string
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
  total_questions: number
  correct_answers: number
}

export interface PublicUserStats {
  games_played: number
  games_won: number
}
