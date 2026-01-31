// WebSocket types

// ============= Common Types =============

export interface HexCell {
  q: number
  r: number
  owner_id: string | null
  player_index: number | null
  is_base: boolean
}

export interface HexCoord {
  q: number
  r: number
}

export interface GamePlayer {
  user_id: string
  name: string
  color: string
  player_index: number
  is_connected: boolean
  extra_time_remaining: number
  territories_count: number
  questions_answered: number
  correct_answers: number
}

export interface RoomPlayer {
  user_id: string
  name: string
  color: string
  is_ready: boolean
}

export interface PlayerAnswer {
  user_id: string
  player_index: number
  answer_index: number
  answered_at: number
  is_correct: boolean
  response_time: number
}

// ============= Room Types =============

export interface RoomState {
  id: string
  owner_id: string
  theme_id: string
  theme_name: string
  players_count: number
  time_per_question: number
  time_per_turn: number
  extra_time_per_turn: number
  game_timer: number | null
  is_private: boolean
  invite_code: string
  status: 'waiting' | 'ready'
  created_at: number
  players: RoomPlayer[]
}

export interface RoomCreatePayload {
  theme_id: string
  players_count: number
  time_per_question: number
  time_per_turn: number
  extra_time_per_turn: number
  game_timer?: number | null
  is_private: boolean
}

export interface RoomJoinPayload {
  room_id?: string
  invite_code?: string
}

export interface RoomKickPayload {
  user_id: string
}

export interface RoomPlayerJoinedEvent {
  player: RoomPlayer
  current_players: number
  status: 'waiting' | 'ready'
}

export interface RoomPlayerLeftEvent {
  user_id: string
  new_owner_id?: string
  kicked: boolean
  disconnected: boolean
}

export interface RoomPlayerReadyEvent {
  user_id: string
  is_ready: boolean
}

export interface RoomErrorEvent {
  code: string
  message: string
}

export interface RoomListItem {
  id: string
  owner_name: string
  theme_name: string
  players_count: number
  current_players: number
}

// ============= Game Types =============

export interface GameConfig {
  time_per_question: number
  time_per_turn: number
  extra_time_per_turn: number
  game_timer: number | null
}

export interface GameStartedEvent {
  game_id: string
  theme_name: string
  players: GamePlayer[]
  cells: HexCell[]
  config: GameConfig
  player_order: number[]
  game_timer_ends_at: number | null
}

export interface GameTurnEvent {
  turn_number: number
  current_player_index: number
  available_moves: HexCoord[]
  time_limit: number
  extra_time_remaining: number
  started_at: number
}

export interface GameSelectCellPayload {
  q: number
  r: number
}

export interface GameCellSelectedEvent {
  q: number
  r: number
}

export interface GameQuestionEvent {
  question_id: string
  question: string
  answers: string[]
  time_limit: number
  started_at: number
  target_cell: HexCoord
  is_battle: boolean
  defender_index: number | null
}

export interface GameAnswerPayload {
  answer_index: number
}

export interface GameAnswerSubmittedEvent {
  resolved: boolean
  waiting_for_opponent?: boolean
}

export type TurnResultType = 'solo_capture' | 'battle_won' | 'battle_lost' | 'battle_draw' | 'timeout' | 'skip'

export interface TurnResult {
  type: TurnResultType
  turn_number: number
  player_index: number
  cell: HexCoord | null
  question_id?: string
  player_answer?: PlayerAnswer
  defender_answer?: PlayerAnswer
  cell_captured: boolean
  cell_owner_changed_from: number | null
}

export interface GameAnswerResultEvent {
  turn_number: number
  result: TurnResult
  updated_cells: HexCell[]
  updated_players: GamePlayer[]
}

export type GamePhase = 'starting' | 'waiting_turn' | 'question_phase' | 'turn_result' | 'finished'

export interface TurnState {
  turn_number: number
  current_player_index: number
  available_moves: HexCoord[]
  time_limit: number
  extra_time_remaining: number
  started_at: number
}

export interface GameStateEvent {
  phase: GamePhase
  players: GamePlayer[]
  cells: HexCell[]
  current_turn: TurnState | null
  game_timer_ends_at: number | null
}

export type GameEndReason = 'conquest' | 'last_standing' | 'game_timer' | 'forfeit'

export interface FinalStanding {
  player_index: number
  user_id: string
  name: string
  place: number
  territories: number
  questions_answered: number
  correct_answers: number
}

export interface GameEndedEvent {
  end_reason: GameEndReason
  winner_index: number | null
  winner_name: string | null
  final_standings: FinalStanding[]
  game_duration: number
}

export interface GamePlayerDisconnectedEvent {
  user_id: string
  player_index: number
  name: string
}

export interface GamePlayerReconnectedEvent {
  user_id: string
  player_index: number
  name: string
}

// ============= Chat Types =============

export interface ChatSendPayload {
  room_id?: string
  game_id?: string
  content: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'system'
  user_id: string | null
  user_name: string | null
  content: string
  room_id?: string
  game_id?: string
  system_type?: 'player_joined' | 'player_left' | 'player_kicked'
    | 'game_starting' | 'game_started' | 'game_ended'
    | 'player_disconnected' | 'player_reconnected' | 'player_forfeited'
  timestamp: number
}

export interface ChatHistoryPayload {
  room_id?: string
  game_id?: string
  limit?: number
}

export interface ChatSystemMessage {
  content: string
  timestamp: number
}

// ============= Notification Types =============

export interface FriendInvitePayload {
  friend_user_id: string
}

export interface FriendInviteSentEvent {
  success: true
  invite_id: string
}

export interface FriendAcceptInvitePayload {
  invite_id: string
}

export interface FriendInviteAcceptedEvent {
  success: true
  room_id: string
}

export interface FriendRejectInvitePayload {
  invite_id: string
}

export interface RoomInvite {
  id: string
  from_user_id: string
  from_user_name: string
  to_user_id: string
  room_id: string
  room_name: string
  theme_name: string
  players_count: number
  current_players: number
  created_at: number
  expires_at: number
}

export interface FriendRoomInviteEvent {
  invite_id: string
  from_user_id: string
  from_user_name: string
  room_id: string
  theme_name: string
  players_count: number
  current_players: number
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'game_invite'
  | 'game_invite_accepted'
  | 'game_invite_rejected'
  | 'game_invite_expired'

export interface NotificationEvent {
  id: string
  type: NotificationType
  from_user_id: string
  from_user_name: string
  to_user_id: string
  data?: {
    request_id?: string
    invite_id?: string
    room_id?: string
    room_name?: string
    theme_name?: string
    players_count?: number
    current_players?: number
    expires_at?: number
  }
  timestamp: number
}

export interface FriendOnlineEvent {
  user_id: string
  name: string | null
  timestamp: number
}

export interface FriendOfflineEvent {
  user_id: string
  name: string | null
  timestamp: number
}

// ============= Main Gateway Types =============

export interface PongEvent {
  timestamp: number
}

// ============= Error Codes =============

export type WsErrorCode =
  | 'UNAUTHORIZED'
  | 'USER_NOT_FOUND'
  | 'THEME_NOT_FOUND'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'ALREADY_IN_ROOM'
  | 'NOT_IN_ROOM'
  | 'NOT_OWNER'
  | 'NOT_ALL_READY'
  | 'GAME_NOT_FOUND'
  | 'NOT_IN_GAME'
  | 'NOT_YOUR_TURN'
  | 'INVALID_MOVE'
  | 'NOT_FRIENDS'
  | 'USER_BUSY'
  | 'USER_OFFLINE'
  | 'INVITE_NOT_FOUND'
  | 'INVITE_EXPIRED'
  | 'INVITE_EXISTS'

export interface WsError {
  code: WsErrorCode
  message: string
}
