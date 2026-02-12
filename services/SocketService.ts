import { io, Socket } from 'socket.io-client'
import type { Game, Player, Action, CardType } from '~/types'

// ==================== EVENT TYPES ====================

export interface PlayerJoinedEvent {
  socketId: string
  username: string
  userId: string
}

export interface PlayerLeftEvent {
  socketId: string
  userId: string
}

export interface PlayerReadyChangedEvent {
  playerId: string
  username: string
  isReady: boolean
}

export interface GameStartedEvent {
  gameCode: string
  timestamp: Date
}

export interface ActionExecutedEvent {
  game: Game
  action: Action
  needsResponse: boolean
  canBeBlocked: boolean
  canBeChallenged: boolean
  blockingRoles: CardType[]
}

export interface ActionChallengedEvent {
  challengerId: string
  challengerName: string
  timestamp: Date
}

export interface ActionBlockedEvent {
  blockerId: string
  blockerName: string
  blockingRole: CardType
  timestamp: Date
}

export interface ActionAcceptedEvent {
  playerId: string
  timestamp: Date
}

export interface ActionResolvedEvent {
  game: Game
}

export interface ChallengeResolvedEvent {
  game: Game
  challengeSuccess: boolean
  challengerId: string
  challengerName: string
  revealedCard?: { type: CardType }
  eliminatedPlayer?: string
}

export interface BlockDeclaredEvent {
  game: Game
  blockerId: string
  blockerName: string
  blockingRole: CardType
}

export interface CardRevealedEvent {
  playerId: string
  cardType: CardType
  timestamp: Date
}

export interface CardLostEvent {
  playerId: string
  cardType: CardType
  timestamp: Date
}

export interface GameEndedEvent {
  winnerId: string
  winnerName: string
  timestamp: Date
}

export interface ChatMessageEvent {
  username: string
  userId: string
  text: string
  timestamp: Date
}

export interface UserTypingEvent {
  username: string
  userId: string
}

export interface UserStoppedTypingEvent {
  userId: string
}

export interface PlayerDisconnectedEvent {
  playerId: string
  playerName: string
}

export interface PlayerReconnectedEvent {
  playerId: string
  playerName: string
}

export interface PlayerReplacedByBotEvent {
  playerId: string
  botName: string
}

export interface TurnStartedEvent {
  timePerTurn: number
}

export interface TurnTimeoutEvent {
  playerId: string
  autoAction: string
  message: string
}

export interface GameStateSyncEvent {
  game: Game
}

// ==================== SOCKET SERVICE SINGLETON ====================

class SocketService {
  private socket: Socket | null = null
  private connected = false
  private currentGameCode: string | null = null
  private listeners: Map<string, Function[]> = new Map()

  /**
   * Get Socket.io connection status
   */
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true
  }

  /**
   * Get current game code
   */
  getCurrentGameCode(): string | null {
    return this.currentGameCode
  }

  /**
   * Connect to Socket.io server with optional JWT token
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      // Si aucun token fourni, essayer de le récupérer depuis localStorage
      let authToken = token
      if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem('coup_token') || undefined
        if (authToken) {
          console.log('🔑 [SOCKET-CLIENT] Token retrieved from localStorage')
        }
      }

      // Connect to Socket.IO on same origin (integrated into Nuxt server)
      const socketUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'

      console.log(`🔌 [SOCKET-CLIENT] Connecting to ${socketUrl}`)

      this.socket = io(socketUrl, {
        auth: authToken ? { token: authToken } : {},
        path: '/socket.io/',
        transports: ['polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.socket.on('connect', () => {
        this.connected = true
        console.log('✅ Socket.io connected:', this.socket?.id)

        // Mettre à jour le token d'authentification si disponible
        if (typeof window !== 'undefined') {
          const latestToken = localStorage.getItem('coup_token')
          if (latestToken && this.socket) {
            this.socket.auth = { token: latestToken }
            console.log('🔄 [SOCKET-CLIENT] Token updated from localStorage')
          }
        }

        // Rejoin game room if we were in one
        if (this.currentGameCode) {
          this.joinGame(this.currentGameCode)
        }

        resolve()
      })

      this.socket.on('disconnect', () => {
        this.connected = false
        console.log('❌ Socket.io disconnected')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        reject(error)
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    })
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.currentGameCode = null
      this.listeners.clear()
    }
  }

  // ==================== EMIT METHODS ====================

  /**
   * Join a game room
   */
  joinGame(gameCode: string): void {
    this.currentGameCode = gameCode
    this.socket?.emit('join-game', gameCode)
    console.log(`🎮 Joining game: ${gameCode}`)
  }

  /**
   * Leave a game room
   */
  leaveGame(gameCode: string): void {
    this.socket?.emit('leave-game', gameCode)
    if (this.currentGameCode === gameCode) {
      this.currentGameCode = null
    }
    console.log(`👋 Leaving game: ${gameCode}`)
  }

  /**
   * Toggle player ready status
   */
  toggleReady(gameCode: string, isReady: boolean): void {
    this.socket?.emit('player-ready', { gameCode, isReady })
  }

  /**
   * Start game
   */
  startGame(gameCode: string): void {
    this.socket?.emit('start-game', gameCode)
  }

  /**
   * Execute an action
   */
  executeAction(data: {
    gameCode: string
    actionType: string
    targetId?: string
    claimedRole?: CardType
  }): void {
    this.socket?.emit('execute-action', data)
  }

  /**
   * Challenge an action
   */
  challengeAction(gameCode: string): void {
    this.socket?.emit('challenge-action', { gameCode })
  }

  /**
   * Block an action
   */
  blockAction(gameCode: string, blockingRole: CardType): void {
    this.socket?.emit('block-action', { gameCode, blockingRole })
  }

  /**
   * Accept an action (pass)
   */
  acceptAction(gameCode: string): void {
    this.socket?.emit('accept-action', { gameCode })
  }

  /**
   * Reveal a card (for challenge/block verification)
   */
  revealCard(gameCode: string, playerId: string, cardType: CardType): void {
    this.socket?.emit('card-revealed', { gameCode, playerId, cardType })
  }

  /**
   * Report card lost
   */
  loseCard(gameCode: string, playerId: string, cardType: CardType): void {
    this.socket?.emit('card-lost', { gameCode, playerId, cardType })
  }

  /**
   * Send chat message
   */
  sendChatMessage(gameCode: string, text: string): void {
    this.socket?.emit('chat-message', { gameCode, text })
  }

  /**
   * Start typing indicator
   */
  startTyping(gameCode: string): void {
    this.socket?.emit('typing-start', { gameCode })
  }

  /**
   * Stop typing indicator
   */
  stopTyping(gameCode: string): void {
    this.socket?.emit('typing-stop', { gameCode })
  }

  // ==================== LISTENER METHODS ====================

  /**
   * Generic event listener - Listen for any socket event
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback)
    this._trackListener(event, callback)
  }

  /**
   * Listen for player joined event
   */
  onPlayerJoined(callback: (data: PlayerJoinedEvent) => void): void {
    this.socket?.on('player-joined', callback)
    this._trackListener('player-joined', callback)
  }

  /**
   * Listen for player left event
   */
  onPlayerLeft(callback: (data: PlayerLeftEvent) => void): void {
    this.socket?.on('player-left', callback)
    this._trackListener('player-left', callback)
  }

  /**
   * Listen for player ready changed event
   */
  onPlayerReadyChanged(callback: (data: PlayerReadyChangedEvent) => void): void {
    this.socket?.on('player-ready-changed', callback)
    this._trackListener('player-ready-changed', callback)
  }

  /**
   * Listen for game started event
   */
  onGameStarted(callback: (data: GameStartedEvent) => void): void {
    this.socket?.on('game-started', callback)
    this._trackListener('game-started', callback)
  }

  /**
   * Listen for action executed event
   */
  onActionExecuted(callback: (data: ActionExecutedEvent) => void): void {
    this.socket?.on('action-executed', callback)
    this._trackListener('action-executed', callback)
  }

  /**
   * Listen for action challenged event
   */
  onActionChallenged(callback: (data: ActionChallengedEvent) => void): void {
    this.socket?.on('action-challenged', callback)
    this._trackListener('action-challenged', callback)
  }

  /**
   * Listen for action blocked event
   */
  onActionBlocked(callback: (data: ActionBlockedEvent) => void): void {
    this.socket?.on('action-blocked', callback)
    this._trackListener('action-blocked', callback)
  }

  /**
   * Listen for action accepted event
   */
  onActionAccepted(callback: (data: ActionAcceptedEvent) => void): void {
    this.socket?.on('action-accepted', callback)
    this._trackListener('action-accepted', callback)
  }

  /**
   * Listen for action resolved event
   */
  onActionResolved(callback: (data: ActionResolvedEvent) => void): void {
    this.socket?.on('action-resolved', callback)
    this._trackListener('action-resolved', callback)
  }

  /**
   * Listen for card revealed event
   */
  onCardRevealed(callback: (data: CardRevealedEvent) => void): void {
    this.socket?.on('card-revealed', callback)
    this._trackListener('card-revealed', callback)
  }

  /**
   * Listen for card lost event
   */
  onCardLost(callback: (data: CardLostEvent) => void): void {
    this.socket?.on('card-lost', callback)
    this._trackListener('card-lost', callback)
  }

  /**
   * Listen for game ended event
   */
  onGameEnded(callback: (data: GameEndedEvent) => void): void {
    this.socket?.on('game-ended', callback)
    this._trackListener('game-ended', callback)
  }

  /**
   * Listen for chat message event
   */
  onChatMessage(callback: (data: ChatMessageEvent) => void): void {
    this.socket?.on('chat-message', callback)
    this._trackListener('chat-message', callback)
  }

  /**
   * Listen for user typing event
   */
  onUserTyping(callback: (data: UserTypingEvent) => void): void {
    this.socket?.on('user-typing', callback)
    this._trackListener('user-typing', callback)
  }

  /**
   * Listen for user stopped typing event
   */
  onUserStoppedTyping(callback: (data: UserStoppedTypingEvent) => void): void {
    this.socket?.on('user-stopped-typing', callback)
    this._trackListener('user-stopped-typing', callback)
  }

  /**
   * Listen for challenge resolved event
   */
  onChallengeResolved(callback: (data: ChallengeResolvedEvent) => void): void {
    this.socket?.on('challenge-resolved', callback)
    this._trackListener('challenge-resolved', callback)
  }

  /**
   * Listen for block declared event
   */
  onBlockDeclared(callback: (data: BlockDeclaredEvent) => void): void {
    this.socket?.on('block-declared', callback)
    this._trackListener('block-declared', callback)
  }

  /**
   * Listen for player disconnected event
   */
  onPlayerDisconnected(callback: (data: PlayerDisconnectedEvent) => void): void {
    this.socket?.on('player-disconnected', callback)
    this._trackListener('player-disconnected', callback)
  }

  /**
   * Listen for player reconnected event
   */
  onPlayerReconnected(callback: (data: PlayerReconnectedEvent) => void): void {
    this.socket?.on('player-reconnected', callback)
    this._trackListener('player-reconnected', callback)
  }

  /**
   * Listen for player replaced by bot event
   */
  onPlayerReplacedByBot(callback: (data: PlayerReplacedByBotEvent) => void): void {
    this.socket?.on('player-replaced-by-bot', callback)
    this._trackListener('player-replaced-by-bot', callback)
  }

  /**
   * Listen for turn timeout event
   */
  onTurnTimeout(callback: (data: TurnTimeoutEvent) => void): void {
    this.socket?.on('turn-timeout', callback)
    this._trackListener('turn-timeout', callback)
  }

  /**
   * Listen for turn started event (timer reset)
   */
  onTurnStarted(callback: (data: TurnStartedEvent) => void): void {
    this.socket?.on('turn-started', callback)
    this._trackListener('turn-started', callback)
  }

  /**
   * Listen for game state sync event
   */
  onGameStateSync(callback: (data: Game) => void): void {
    this.socket?.on('game-state-sync', callback)
    this._trackListener('game-state-sync', callback)
  }

  /**
   * Request reconnection to a game
   */
  reconnectToGame(gameId: string): void {
    this.socket?.emit('reconnect-to-game', gameId)
  }

  // ==================== CLEANUP METHODS ====================

  /**
   * Remove a specific listener
   */
  off(event: string, callback: Function): void {
    this.socket?.off(event, callback as any)
    this._removeListener(event, callback)
  }

  /**
   * Remove all listeners for an event
   */
  offAll(event: string): void {
    this.socket?.off(event)
    this.listeners.delete(event)
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.socket?.removeAllListeners()
    this.listeners.clear()
  }

  // ==================== PRIVATE METHODS ====================

  private _trackListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  private _removeListener(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }
}

// Export singleton instance
export const socketService = new SocketService()
