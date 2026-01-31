// Friends module types

import type { Friend, FriendRequest } from './user'

export type FriendsListResponse = Friend[]

export type FriendRequestsResponse = FriendRequest[]

export interface SendFriendRequestBody {
  user_id: string
}

export interface SendFriendRequestResponse {
  request_id: string
  message: string
}

export interface AcceptFriendRequestBody {
  request_id: string
}

export interface AcceptFriendRequestResponse {
  message: string
}

export interface RejectFriendRequestBody {
  request_id: string
}

export interface RejectFriendRequestResponse {
  message: string
}

export interface RemoveFriendResponse {
  message: string
}
