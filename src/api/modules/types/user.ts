// User module types

import type { UserStats } from './common'

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
  stats: {
    games_played: number
    games_won: number
    win_rate: number
    total_territories_captured: number
    total_questions_answered: number
    total_correct_answers: number
  }
}

export interface PublicUserProfile {
  id: string
  name: string
  created_at: string
  stats: UserStats
}

export interface Friend {
  id: string
  name: string
  stats: {
    games_played: number
    games_won: number
  }
  added_at: number
}

export interface FriendRequest {
  id: string
  from_user: {
    id: string
    name: string
  }
  created_at: string
}

export interface InitResponse {
  user: {
    id: string
    email: string
    name: string
    created_at: string
  }
  pending_requests_count: number
  active_game_id: string
  active_room_id: string
}

export interface UpdateProfileRequest {
  name?: string
}

export interface UpdateProfileResponse {
  id: string
  email: string
  name: string
  created_at: string
}

export interface SearchUsersParams {
  query: string
  limit?: number
  offset?: number
}

export interface SearchUserResult {
  id: string
  name: string
}

export interface SearchUsersResponse {
  users: SearchUserResult[]
  total: number
}
