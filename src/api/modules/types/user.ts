// User module types

import type { UserStats, PublicUserStats } from './common'

export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
  stats: UserStats
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
  from_user_id: string
  from_user_name: string
  created_at: string
}

export interface InitResponse {
  user: UserProfile
  friends: Friend[]
  pending_requests_count: FriendRequest[]
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
