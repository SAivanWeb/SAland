// User module

import { get, put } from '../network'
import type {
  InitResponse,
  UserProfile,
  PublicUserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from './types'

export const user = {
  /**
   * Get initial user data (profile, friends, stats)
   */
  async init(): Promise<InitResponse> {
    return get<InitResponse>('/user/init')
  },

  /**
   * Get current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    return get<UserProfile>('/user/profile')
  },

  /**
   * Get another user's public profile
   */
  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    return get<PublicUserProfile>(`/user/profile/${userId}`)
  },

  /**
   * Update current user's profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return put<UpdateProfileResponse>('/user/profile', data)
  },

  /**
   * Search users by name
   */
  async search(params: SearchUsersParams): Promise<SearchUsersResponse> {
    return get<SearchUsersResponse>('/user/search', { params })
  },
}
