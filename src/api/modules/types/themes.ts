// Themes module types

export type Difficulty = 'easy' | 'medium' | 'hard'
export type ThemeRating = 'like' | 'dislike'
export type TempThemeRating = 'like' | 'dislike' | 'skip'
export type ThemeSortOption = 'popular' | 'recent' | 'played'

export interface ThemeCreator {
  user_id: string
  name: string
}

export interface Theme {
  id: string
  name: string
  description: string | null
  difficulty: Difficulty
  likes: number
  dislikes: number
  times_played: number
  questions_count: number
  created_by: ThemeCreator | null
  created_at: number
}

export interface ThemeDetail {
  id: string
  name: string
  description: string | null
  difficulty: Difficulty
  likes: number
  dislikes: number
  times_played: number
  questions_count: number
  created_by: ThemeCreator | null
  created_at: number
}

export interface PopularThemesParams {
  q?: string
  difficulty?: Difficulty
  sort?: ThemeSortOption
  page?: number
  size?: number
}

export interface ThemesPagination {
  page: number
  size: number
  total_pages: number
  total_items: number
}

export interface ThemesListResponse {
  themes: Theme[]
  pagination: ThemesPagination
}

export interface RateThemeBody {
  game_id: string
  rating: ThemeRating
  difficulty_rating: Difficulty
}

export interface RateThemeResponse {
  success: true
}

// ============= Temp Theme Rating =============

export interface RateTempThemeBody {
  rating: TempThemeRating
  difficulty_rating?: Difficulty
}

export interface RateTempThemeResponse {
  success: true
  theme_saved: boolean
  theme_id: string | null
}

// ============= AI Generation =============

export interface AIGenerateBody {
  name: string
}

export interface AIGenerateProgress {
  generated: number
  total: 80
}

export interface AIGenerateResponse {
  session_id: string
  status: 'generating'
  progress: AIGenerateProgress
}

export type AISessionStatus = 'generating' | 'ready' | 'error'

export interface AIStatusResponse {
  session_id: string
  status: AISessionStatus
  progress: AIGenerateProgress
  error: string | null
}

export interface AIQuestionPreview {
  question: string
  answers: string[]
}

export interface AIQuestionsResponse {
  name: string
  questions: AIQuestionPreview[]
}

export interface AIDeleteResponse {
  success: true
}

// ============= Manual Theme Creation =============

export interface ManualQuestionInput {
  question: string
  answers: string[]
  correct_answer: number
}

export interface ManualCreateBody {
  name: string
  questions: ManualQuestionInput[]
}

export interface ManualCreateResponse {
  session_id: string
  name: string
  questions_count: number
  status: 'ready'
}

export interface ManualQuestionsResponse {
  name: string
  questions: AIQuestionPreview[]
}

export interface ManualDeleteResponse {
  success: true
}

// ============= Admin Theme Creation =============

export interface AdminCreateBody {
  name: string
  description?: string
  difficulty: Difficulty
  questions: ManualQuestionInput[]
}

export interface AdminCreateResponse {
  theme_id: string
  name: string
  questions_count: number
}
