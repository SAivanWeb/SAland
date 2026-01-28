// Themes module types

export interface Theme {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  likes: number
  dislikes: number
  players_count: number
  created_at: number
}

export interface ThemeDetail {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  likes: number
  dislikes: number
  players_count: number
  created_at: number
}

export interface PopularThemesParams {
  limit?: number
  query?: string
}

export interface ThemesListResponse {
  themes: Theme[]
  total: number
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
