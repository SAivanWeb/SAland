// User module types

import type { UserStats } from './common'

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: number
  stats: UserStats
}

export interface PublicUserProfile {
  id: string
  name: string
  created_at: number
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
  created_at: number
}

export interface InitResponse {
  user: {
    id: string
    email: string
    name: string
    created_at: number
    role: string
  }
  pending_requests_count: number
  active_game_id: string | null
  active_room_id: string | null
}

export interface UpdateProfileRequest {
  name?: string
}

export interface UpdateProfileResponse {
  id: string
  email: string
  name: string
  created_at: number
  stats: UserStats
}

export interface SearchUsersParams {
  query: string
  limit?: number
  offset?: number
}

export interface SearchUserResult {
  id: string
  name: string
  stats: {
    games_played: number
    games_won: number
  }
}

export interface SearchUsersResponse {
  users: SearchUserResult[]
  total: number
}

export interface ReportUserRequest {
  reported_user_id: string
  reason: string
}

export interface ReportUserResponse {
  report_id: string
}
