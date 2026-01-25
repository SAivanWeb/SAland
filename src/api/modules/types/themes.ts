// Themes module types

export interface Theme {
  id: string
  name: string
  description: string
  questions_count: number
  games_played: number
  likes_count: number
  dislikes_count: number
  author_name: string
  created_at: string
}

export interface ThemeDetail extends Theme {
  difficulty_ratings: {
    easy: number
    medium: number
    hard: number
  }
  author_id: string
  user_rating?: 'like' | 'dislike' | null
}

export type ThemeSortBy = 'popular' | 'newest' | 'most_played'

export interface PopularThemesParams {
  limit?: number
  offset?: number
  sort_by?: ThemeSortBy
}

export interface ThemesListResponse {
  themes: Theme[]
  total: number
}

export interface SearchThemesParams {
  query: string
  limit?: number
  offset?: number
}

export type ThemeRating = 'like' | 'dislike'
export type DifficultyRating = 'easy' | 'medium' | 'hard'

export interface RateThemeBody {
  rating: ThemeRating
  difficulty_rating?: DifficultyRating
  game_id?: string
}

export interface RateThemeResponse {
  message: string
}
