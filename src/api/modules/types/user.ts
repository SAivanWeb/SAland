// User module types

import type { PublicUserStats } from './common'

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
}

export interface PublicUserProfile {
  id: string
  name: string
  stats: PublicUserStats
}

export interface Friend {
  user_id: string
  name: string
  is_online: boolean
  added_at: string
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
  user: UserProfile
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
