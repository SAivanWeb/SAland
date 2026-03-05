// WebSocket client using Socket.IO

import { io, Socket } from 'socket.io-client'
import { ref, shallowRef } from 'vue'
import { getAccessToken } from './network'
import type {
  // Room types
  RoomState,
  RoomCreatePayload,
  RoomJoinPayload,
  RoomKickPayload,
  RoomPlayerJoinedEvent,
  RoomPlayerLeftEvent,
  RoomErrorEvent,
  RoomListItem,
  RoomUpdateParamsPayload,
  RoomParamsUpdatedEvent,
  RoomGenerateThemePayload,
  RoomThemeGenerationStartedEvent,
  RoomUploadThemePayload,
  RoomThemeUploadedEvent,
  RoomSelectThemePayload,
  RoomThemeSelectedEvent,
  RoomActivatedEvent,
  RoomDeactivatedEvent,
  RoomThemeDeletedEvent,
  RoomKickedEvent,
  RoomGetPromptPayload,
  RoomPromptEvent,
  RoomUploadThemeRawPayload,
  RoomThemeRawUploadedEvent,
  RoomThemeProgressEvent,
  // Game types
  GameStartedEvent,
  GameTurnEvent,
  GameSelectCellPayload,
  GameCellSelectedEvent,
  GameQuestionEvent,
  GameAnswerPayload,
  GameAnswerSubmittedEvent,
  GameAnswerResultEvent,
  GameStateEvent,
  GameEndedEvent,
  GamePlayerDisconnectedEvent,
  GamePlayerReconnectedEvent,
  GamePlayerForfeitedEvent,
  // Chat types
  ChatSendPayload,
  ChatMessage,
  ChatHistoryPayload,
  // Notification types
  FriendInvitePayload,
  FriendInviteSentEvent,
  FriendAcceptInvitePayload,
  FriendInviteAcceptedEvent,
  FriendRejectInvitePayload,
  RoomInvite,
  FriendRoomInviteEvent,
  NotificationEvent,
  FriendOnlineEvent,
  FriendOfflineEvent,
  // AI Generation types
  AIProgressEvent,
  AIReadyEvent,
  AIErrorEvent,
  // Other
  PongEvent,
  WsError,
} from './modules/types'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

type EventCallback<T> = (data: T) => void
type EventUnsubscribe = () => void

class WebSocketClient {
  private socket: Socket | null = null
  private eventHandlers: Map<string, Set<EventCallback<unknown>>> = new Map()

  public isConnected = ref(false)
  public connectionError = shallowRef<Error | null>(null)

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const token = getAccessToken()
      if (!token) {
        const error = new Error('No access token available')
        this.connectionError.value = error
        reject(error)
        return
      }

      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        console.log('[WS] Connected successfully')
        this.isConnected.value = true
        this.connectionError.value = null
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('[WS] Connection error:', error)
        this.isConnected.value = false
        this.connectionError.value = error
        reject(error)
      })

      this.socket.on('disconnect', () => {
        this.isConnected.value = false
      })

      // Re-emit all registered events to internal handlers
      this.socket.onAny((event, data) => {
        console.log('[WS] Event received:', event, data)
        const handlers = this.eventHandlers.get(event)
        if (handlers) {
          handlers.forEach(handler => handler(data))
        }
      })
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
    }
  }

  /**
   * Reconnect with new token
   */
  async reconnect(): Promise<void> {
    this.disconnect()
    await this.connect()
  }

  /**
   * Subscribe to an event
   */
  private on<T>(event: string, callback: EventCallback<T>): EventUnsubscribe {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(callback as EventCallback<unknown>)

    return () => {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        handlers.delete(callback as EventCallback<unknown>)
      }
    }
  }

  /**
   * Emit an event and optionally wait for response
   */
  private emit<T = void>(event: string, data?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      if (data !== undefined) {
        this.socket.emit(event, data, (response: T) => resolve(response))
      } else {
        this.socket.emit(event, (response: T) => resolve(response))
      }
    })
  }

  /**
   * Emit an event without waiting for response
   */
  private emitOnly(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit:', event)
      return
    }

    if (data !== undefined) {
      this.socket.emit(event, data)
    } else {
      this.socket.emit(event)
    }
  }

  // ============= Room Methods =============

  rooms = {
    /**
     * Create a new room
     */
    create: (payload?: RoomCreatePayload): void => {
      this.emitOnly('room:create', payload ?? {})
    },

    /**
     * Join a room by ID or invite code
     */
    join: (payload: RoomJoinPayload): void => {
      this.emitOnly('room:join', payload)
    },

    /**
     * Leave current room
     */
    leave: (): void => {
      this.emitOnly('room:leave')
    },

    /**
     * Kick a player (owner only)
     */
    kick: (payload: RoomKickPayload): void => {
      this.emitOnly('room:kick', payload)
    },

    /**
     * Start the game (owner only)
     */
    start: (): void => {
      this.emitOnly('room:start')
    },

    /**
     * Update room params (owner only, INACTIVE rooms only)
     */
    updateParams: (payload: RoomUpdateParamsPayload): void => {
      this.emitOnly('room:update_params', payload)
    },

    /**
     * Generate theme via AI (owner only, INACTIVE rooms only)
     */
    generateTheme: (payload: RoomGenerateThemePayload): void => {
      this.emitOnly('room:generate_theme', payload)
    },

    /**
     * Upload theme from JSON (owner only, INACTIVE rooms only)
     */
    uploadTheme: (payload: RoomUploadThemePayload): void => {
      this.emitOnly('room:upload_theme', payload)
    },

    /**
     * Select existing theme from PostgreSQL (owner only, INACTIVE rooms only)
     */
    selectTheme: (payload: RoomSelectThemePayload): void => {
      console.log('select_theme:', payload)
      this.emitOnly('room:select_theme', payload)
    },

    /**
     * Activate room (owner only, INACTIVE rooms with theme only)
     */
    activate: (): void => {
      this.emitOnly('room:activate')
    },

    /**
     * Get prompt for manual AI generation (owner only, INACTIVE rooms only)
     */
    getPrompt: (payload: RoomGetPromptPayload): void => {
      this.emitOnly('room:get_prompt', payload)
    },

    /**
     * Upload raw AI text (owner only, INACTIVE rooms only). Supports accumulation.
     */
    uploadThemeRaw: (payload: RoomUploadThemeRawPayload): void => {
      this.emitOnly('room:upload_theme_raw', payload)
    },

    /**
     * Clear accumulated questions to start over (owner only, INACTIVE rooms only)
     */
    clearUploadedQuestions: (): void => {
      this.emitOnly('room:clear_uploaded_questions')
    },

    /**
     * Delete theme from room (owner only, INACTIVE rooms only)
     */
    deleteTheme: (): void => {
      this.emitOnly('room:delete_theme')
    },

    /**
     * Deactivate room (owner only, WAITING rooms only)
     */
    deactivate: (): void => {
      this.emitOnly('room:deactivate')
    },

    /**
     * Get current room state (for reconnection)
     */
    getState: (): void => {
      this.emitOnly('room:get_state')
    },

    /**
     * Subscribe to lobby updates
     */
    subscribeLobby: (): void => {
      this.emitOnly('rooms:subscribe')
    },

    /**
     * Unsubscribe from lobby updates
     */
    unsubscribeLobby: (): void => {
      this.emitOnly('rooms:unsubscribe')
    },

    // Event listeners
    onCreated: (callback: EventCallback<RoomState>): EventUnsubscribe => {
      return this.on('room:created', callback)
    },

    onState: (callback: EventCallback<RoomState>): EventUnsubscribe => {
      return this.on('room:state', callback)
    },

    onPlayerJoined: (callback: EventCallback<RoomPlayerJoinedEvent>): EventUnsubscribe => {
      return this.on('room:player_joined', callback)
    },

    onPlayerLeft: (callback: EventCallback<RoomPlayerLeftEvent>): EventUnsubscribe => {
      return this.on('room:player_left', callback)
    },

    onLeft: (callback: EventCallback<{ success: true }>): EventUnsubscribe => {
      return this.on('room:left', callback)
    },

    onKickSuccess: (callback: EventCallback<{ success: true }>): EventUnsubscribe => {
      return this.on('room:kick_success', callback)
    },

    onError: (callback: EventCallback<RoomErrorEvent>): EventUnsubscribe => {
      return this.on('room:error', callback)
    },

    onList: (callback: EventCallback<RoomListItem[]>): EventUnsubscribe => {
      return this.on('rooms:list', callback)
    },

    onUnsubscribed: (callback: EventCallback<{ success: true }>): EventUnsubscribe => {
      return this.on('rooms:unsubscribed', callback)
    },

    onParamsUpdated: (callback: EventCallback<RoomParamsUpdatedEvent>): EventUnsubscribe => {
      return this.on('room:params_updated', callback)
    },

    onThemeGenerationStarted: (callback: EventCallback<RoomThemeGenerationStartedEvent>): EventUnsubscribe => {
      return this.on('room:theme_generation_started', callback)
    },

    onThemeUploaded: (callback: EventCallback<RoomThemeUploadedEvent>): EventUnsubscribe => {
      return this.on('room:theme_uploaded', callback)
    },

    onThemeSelected: (callback: EventCallback<RoomThemeSelectedEvent>): EventUnsubscribe => {
      return this.on('room:theme_selected', callback)
    },

    onActivated: (callback: EventCallback<RoomActivatedEvent>): EventUnsubscribe => {
      return this.on('room:activated', callback)
    },

    onDeactivated: (callback: EventCallback<RoomDeactivatedEvent>): EventUnsubscribe => {
      return this.on('room:deactivated', callback)
    },

    onThemeDeleted: (callback: EventCallback<RoomThemeDeletedEvent>): EventUnsubscribe => {
      return this.on('room:theme_deleted', callback)
    },

    onKicked: (callback: EventCallback<RoomKickedEvent>): EventUnsubscribe => {
      return this.on('room:kicked', callback)
    },

    onPrompt: (callback: EventCallback<RoomPromptEvent>): EventUnsubscribe => {
      return this.on('room:prompt', callback)
    },

    onThemeRawUploaded: (callback: EventCallback<RoomThemeRawUploadedEvent>): EventUnsubscribe => {
      return this.on('room:theme_raw_uploaded', callback)
    },

    onThemeProgress: (callback: EventCallback<RoomThemeProgressEvent>): EventUnsubscribe => {
      return this.on('room:theme_progress', callback)
    },
  }

  // ============= Game Methods =============

  game = {
    /**
     * Select a cell to capture/attack
     */
    selectCell: (payload: GameSelectCellPayload): void => {
      this.emitOnly('game:select_cell', payload)
    },

    /**
     * Submit an answer
     */
    answer: (payload: GameAnswerPayload): void => {
      this.emitOnly('game:answer', payload)
    },

    /**
     * Forfeit the game
     */
    forfeit: (): void => {
      this.emitOnly('game:forfeit')
    },

    /**
     * Reconnect to active game
     */
    reconnect: (): void => {
      this.emitOnly('game:reconnect')
    },

    /**
     * Request current game state
     */
    requestState: (): void => {
      this.emitOnly('game:state')
    },

    // Event listeners
    onStarting: (callback: EventCallback<{ room: RoomState }>): EventUnsubscribe => {
      return this.on('game:starting', callback)
    },

    onStarted: (callback: EventCallback<GameStartedEvent>): EventUnsubscribe => {
      return this.on('game:started', callback)
    },

    onTurn: (callback: EventCallback<GameTurnEvent>): EventUnsubscribe => {
      return this.on('game:turn', callback)
    },

    onCellSelected: (callback: EventCallback<GameCellSelectedEvent>): EventUnsubscribe => {
      return this.on('game:cell_selected', callback)
    },

    onQuestion: (callback: EventCallback<GameQuestionEvent>): EventUnsubscribe => {
      return this.on('game:question', callback)
    },

    onAnswerSubmitted: (callback: EventCallback<GameAnswerSubmittedEvent>): EventUnsubscribe => {
      return this.on('game:answer_submitted', callback)
    },

    onAnswerResult: (callback: EventCallback<GameAnswerResultEvent>): EventUnsubscribe => {
      return this.on('game:answer_result', callback)
    },

    onState: (callback: EventCallback<GameStateEvent>): EventUnsubscribe => {
      return this.on('game:state', callback)
    },

    onForfeited: (callback: EventCallback<{ success: true }>): EventUnsubscribe => {
      return this.on('game:forfeited', callback)
    },

    onEnded: (callback: EventCallback<GameEndedEvent>): EventUnsubscribe => {
      return this.on('game:ended', callback)
    },

    onPlayerDisconnected: (callback: EventCallback<GamePlayerDisconnectedEvent>): EventUnsubscribe => {
      return this.on('game:player_disconnected', callback)
    },

    onPlayerReconnected: (callback: EventCallback<GamePlayerReconnectedEvent>): EventUnsubscribe => {
      return this.on('game:player_reconnected', callback)
    },

    onPlayerForfeited: (callback: EventCallback<GamePlayerForfeitedEvent>): EventUnsubscribe => {
      return this.on('game:player_forfeited', callback)
    },

    onError: (callback: EventCallback<WsError>): EventUnsubscribe => {
      return this.on('game:error', callback)
    },
  }

  // ============= Chat Methods =============

  chat = {
    /**
     * Send a message
     */
    send: (payload: ChatSendPayload): void => {
      this.emitOnly('chat:send', payload)
    },

    /**
     * Request chat history
     */
    getHistory: (payload: ChatHistoryPayload): void => {
      this.emitOnly('chat:history', payload)
    },

    // Event listeners
    onSent: (callback: EventCallback<ChatMessage>): EventUnsubscribe => {
      return this.on('chat:sent', callback)
    },

    onMessage: (callback: EventCallback<ChatMessage>): EventUnsubscribe => {
      return this.on('chat:message', callback)
    },

    onHistory: (callback: EventCallback<ChatMessage[]>): EventUnsubscribe => {
      return this.on('chat:history', callback)
    },

    onError: (callback: EventCallback<WsError>): EventUnsubscribe => {
      return this.on('chat:error', callback)
    },
  }

  // ============= Notification Methods =============

  notifications = {
    /**
     * Invite a friend to current room
     */
    inviteToRoom: (payload: FriendInvitePayload): void => {
      this.emitOnly('friend:invite_to_room', payload)
    },

    /**
     * Accept a room invite
     */
    acceptInvite: (payload: FriendAcceptInvitePayload): void => {
      this.emitOnly('friend:accept_invite', payload)
    },

    /**
     * Reject a room invite
     */
    rejectInvite: (payload: FriendRejectInvitePayload): void => {
      this.emitOnly('friend:reject_invite', payload)
    },

    /**
     * Get list of active invites
     */
    getInvites: (): void => {
      this.emitOnly('friend:get_invites')
    },

    // Event listeners
    onInviteSent: (callback: EventCallback<FriendInviteSentEvent>): EventUnsubscribe => {
      return this.on('friend:invite_sent', callback)
    },

    onInviteAccepted: (callback: EventCallback<FriendInviteAcceptedEvent>): EventUnsubscribe => {
      return this.on('friend:invite_accepted', callback)
    },

    onInviteRejected: (callback: EventCallback<{ success: true }>): EventUnsubscribe => {
      return this.on('friend:invite_rejected', callback)
    },

    onInvitesList: (callback: EventCallback<RoomInvite[]>): EventUnsubscribe => {
      return this.on('friend:invites_list', callback)
    },

    onRoomInvite: (callback: EventCallback<FriendRoomInviteEvent>): EventUnsubscribe => {
      return this.on('friend:room_invite', callback)
    },

    onNotification: (callback: EventCallback<NotificationEvent>): EventUnsubscribe => {
      return this.on('notification', callback)
    },

    onFriendOnline: (callback: EventCallback<FriendOnlineEvent>): EventUnsubscribe => {
      return this.on('friend:online', callback)
    },

    onFriendOffline: (callback: EventCallback<FriendOfflineEvent>): EventUnsubscribe => {
      return this.on('friend:offline', callback)
    },

    onInviteError: (callback: EventCallback<WsError>): EventUnsubscribe => {
      return this.on('friend:invite_error', callback)
    },
  }

  // ============= AI Generation Events =============

  ai = {
    /**
     * Listen for generation progress (after each batch of 20 questions)
     */
    onProgress: (callback: EventCallback<AIProgressEvent>): EventUnsubscribe => {
      return this.on('ai:progress', callback)
    },

    /**
     * Listen for generation complete
     */
    onReady: (callback: EventCallback<AIReadyEvent>): EventUnsubscribe => {
      return this.on('ai:ready', callback)
    },

    /**
     * Listen for generation error
     */
    onError: (callback: EventCallback<AIErrorEvent>): EventUnsubscribe => {
      return this.on('ai:error', callback)
    },
  }

  // ============= Utility Methods =============

  /**
   * Send ping to check connection
   */
  ping(): void {
    this.emitOnly('ping')
  }

  /**
   * Listen for pong response
   */
  onPong(callback: EventCallback<PongEvent>): EventUnsubscribe {
    return this.on('pong', callback)
  }

  /**
   * Listen for any error
   */
  onError(callback: EventCallback<WsError>): EventUnsubscribe {
    return this.on('error', callback)
  }
}

// Singleton instance
export const ws = new WebSocketClient()

// Composable for Vue components
export function useWebSocket() {
  return ws
}
