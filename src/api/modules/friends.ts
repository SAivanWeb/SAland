// Friends module

import { get, post, del } from '../network'
import type {
  FriendsListResponse,
  FriendRequestsResponse,
  SendFriendRequestBody,
  SendFriendRequestResponse,
  AcceptFriendRequestBody,
  AcceptFriendRequestResponse,
  RejectFriendRequestBody,
  RejectFriendRequestResponse,
  RemoveFriendResponse,
} from './types'

export const friends = {
  /**
   * Get list of friends
   */
  async list(): Promise<FriendsListResponse> {
    return get<FriendsListResponse>('/user/friends')
  },

  /**
   * Get incoming friend requests
   */
  async getRequests(): Promise<FriendRequestsResponse> {
    return get<FriendRequestsResponse>('/user/friends/requests')
  },

  /**
   * Send a friend request
   */
  async sendRequest(data: SendFriendRequestBody): Promise<SendFriendRequestResponse> {
    return post<SendFriendRequestResponse>('/user/friends/request', data)
  },

  /**
   * Accept a friend request
   */
  async acceptRequest(data: AcceptFriendRequestBody): Promise<AcceptFriendRequestResponse> {
    return post<AcceptFriendRequestResponse>('/user/friends/accept', data)
  },

  /**
   * Reject a friend request
   */
  async rejectRequest(data: RejectFriendRequestBody): Promise<RejectFriendRequestResponse> {
    return post<RejectFriendRequestResponse>('/user/friends/reject', data)
  },

  /**
   * Remove a friend
   */
  async remove(userId: string): Promise<RemoveFriendResponse> {
    return del<RemoveFriendResponse>(`/user/friends/${userId}`)
  },
}
