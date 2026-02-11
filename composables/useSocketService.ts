import { socketService } from '~/services/SocketService'
import type {
  PlayerJoinedEvent,
  PlayerLeftEvent,
  PlayerReadyChangedEvent,
  GameStartedEvent,
  ActionExecutedEvent,
  ActionChallengedEvent,
  ActionBlockedEvent,
  ActionAcceptedEvent,
  ActionResolvedEvent,
  CardRevealedEvent,
  CardLostEvent,
  GameEndedEvent,
  ChatMessageEvent,
  UserTypingEvent,
  UserStoppedTypingEvent
} from '~/services/SocketService'

/**
 * Composable wrapper for SocketService singleton
 * Provides Vue-friendly interface with automatic cleanup
 */
export const useSocketService = () => {
  const isConnected = ref(false)
  const currentGameCode = ref<string | null>(null)

  // Track connection status
  const updateConnectionStatus = () => {
    isConnected.value = socketService.isConnected()
    currentGameCode.value = socketService.getCurrentGameCode()
  }

  // Update status every second (client-side only)
  if (process.client) {
    const statusInterval = setInterval(updateConnectionStatus, 1000)

    // Cleanup on unmount
    onUnmounted(() => {
      clearInterval(statusInterval)
    })
  }

  // ==================== CONNECTION METHODS ====================

  const connect = async (token?: string) => {
    try {
      await socketService.connect(token)
      updateConnectionStatus()
      return true
    } catch (error) {
      console.error('Failed to connect:', error)
      return false
    }
  }

  const disconnect = () => {
    socketService.disconnect()
    updateConnectionStatus()
  }

  // ==================== GAME ROOM METHODS ====================

  const joinGame = (gameCode: string) => {
    socketService.joinGame(gameCode)
    updateConnectionStatus()
  }

  const leaveGame = (gameCode: string) => {
    socketService.leaveGame(gameCode)
    updateConnectionStatus()
  }

  // ==================== GAME ACTION METHODS ====================

  const toggleReady = (gameCode: string, isReady: boolean) => {
    socketService.toggleReady(gameCode, isReady)
  }

  const startGame = (gameCode: string) => {
    socketService.startGame(gameCode)
  }

  const executeAction = (data: {
    gameCode: string
    actionType: string
    targetId?: string
    claimedRole?: any
  }) => {
    socketService.executeAction(data)
  }

  const challengeAction = (gameCode: string) => {
    socketService.challengeAction(gameCode)
  }

  const blockAction = (gameCode: string, blockingRole: any) => {
    socketService.blockAction(gameCode, blockingRole)
  }

  const acceptAction = (gameCode: string) => {
    socketService.acceptAction(gameCode)
  }

  const revealCard = (gameCode: string, playerId: string, cardType: any) => {
    socketService.revealCard(gameCode, playerId, cardType)
  }

  const loseCard = (gameCode: string, playerId: string, cardType: any) => {
    socketService.loseCard(gameCode, playerId, cardType)
  }

  // ==================== CHAT METHODS ====================

  const sendChatMessage = (gameCode: string, text: string) => {
    socketService.sendChatMessage(gameCode, text)
  }

  const startTyping = (gameCode: string) => {
    socketService.startTyping(gameCode)
  }

  const stopTyping = (gameCode: string) => {
    socketService.stopTyping(gameCode)
  }

  // ==================== EVENT LISTENERS ====================

  const onPlayerJoined = (callback: (data: PlayerJoinedEvent) => void) => {
    socketService.onPlayerJoined(callback)
    return () => socketService.off('player-joined', callback)
  }

  const onPlayerLeft = (callback: (data: PlayerLeftEvent) => void) => {
    socketService.onPlayerLeft(callback)
    return () => socketService.off('player-left', callback)
  }

  const onPlayerReadyChanged = (callback: (data: PlayerReadyChangedEvent) => void) => {
    socketService.onPlayerReadyChanged(callback)
    return () => socketService.off('player-ready-changed', callback)
  }

  const onGameStarted = (callback: (data: GameStartedEvent) => void) => {
    socketService.onGameStarted(callback)
    return () => socketService.off('game-started', callback)
  }

  const onActionExecuted = (callback: (data: ActionExecutedEvent) => void) => {
    socketService.onActionExecuted(callback)
    return () => socketService.off('action-executed', callback)
  }

  const onActionChallenged = (callback: (data: ActionChallengedEvent) => void) => {
    socketService.onActionChallenged(callback)
    return () => socketService.off('action-challenged', callback)
  }

  const onActionBlocked = (callback: (data: ActionBlockedEvent) => void) => {
    socketService.onActionBlocked(callback)
    return () => socketService.off('action-blocked', callback)
  }

  const onActionAccepted = (callback: (data: ActionAcceptedEvent) => void) => {
    socketService.onActionAccepted(callback)
    return () => socketService.off('action-accepted', callback)
  }

  const onActionResolved = (callback: (data: ActionResolvedEvent) => void) => {
    socketService.onActionResolved(callback)
    return () => socketService.off('action-resolved', callback)
  }

  const onCardRevealed = (callback: (data: CardRevealedEvent) => void) => {
    socketService.onCardRevealed(callback)
    return () => socketService.off('card-revealed', callback)
  }

  const onCardLost = (callback: (data: CardLostEvent) => void) => {
    socketService.onCardLost(callback)
    return () => socketService.off('card-lost', callback)
  }

  const onGameEnded = (callback: (data: GameEndedEvent) => void) => {
    socketService.onGameEnded(callback)
    return () => socketService.off('game-ended', callback)
  }

  const onChatMessage = (callback: (data: ChatMessageEvent) => void) => {
    socketService.onChatMessage(callback)
    return () => socketService.off('chat-message', callback)
  }

  const onUserTyping = (callback: (data: UserTypingEvent) => void) => {
    socketService.onUserTyping(callback)
    return () => socketService.off('user-typing', callback)
  }

  const onUserStoppedTyping = (callback: (data: UserStoppedTypingEvent) => void) => {
    socketService.onUserStoppedTyping(callback)
    return () => socketService.off('user-stopped-typing', callback)
  }

  const onChallengeResolved = (callback: (data: any) => void) => {
    socketService.onChallengeResolved(callback)
    return () => socketService.off('challenge-resolved', callback)
  }

  const onBlockDeclared = (callback: (data: any) => void) => {
    socketService.onBlockDeclared(callback)
    return () => socketService.off('block-declared', callback)
  }

  const onPlayerDisconnected = (callback: (data: any) => void) => {
    socketService.onPlayerDisconnected(callback)
    return () => socketService.off('player-disconnected', callback)
  }

  const onPlayerReconnected = (callback: (data: any) => void) => {
    socketService.onPlayerReconnected(callback)
    return () => socketService.off('player-reconnected', callback)
  }

  const onPlayerReplacedByBot = (callback: (data: any) => void) => {
    socketService.onPlayerReplacedByBot(callback)
    return () => socketService.off('player-replaced-by-bot', callback)
  }

  const onTurnTimeout = (callback: (data: any) => void) => {
    socketService.onTurnTimeout(callback)
    return () => socketService.off('turn-timeout', callback)
  }

  const onGameStateSync = (callback: (data: any) => void) => {
    socketService.onGameStateSync(callback)
    return () => socketService.off('game-state-sync', callback)
  }

  // ==================== GENERIC EVENT LISTENER ====================

  /**
   * Generic event listener for any socket event
   * Useful for custom events like 'game-created', 'game-updated', etc.
   */
  const on = (event: string, callback: (data: any) => void) => {
    socketService.on(event, callback)
    return () => socketService.off(event, callback)
  }

  // ==================== CLEANUP ====================
  // (Cleanup is handled in the setInterval if block above)

  return {
    // State
    isConnected,
    currentGameCode,

    // Connection
    connect,
    disconnect,

    // Game room
    joinGame,
    leaveGame,

    // Game actions
    toggleReady,
    startGame,
    executeAction,
    challengeAction,
    blockAction,
    acceptAction,
    revealCard,
    loseCard,

    // Chat
    sendChatMessage,
    startTyping,
    stopTyping,

    // Event listeners
    on, // Generic listener for any event
    onPlayerJoined,
    onPlayerLeft,
    onPlayerReadyChanged,
    onGameStarted,
    onActionExecuted,
    onActionChallenged,
    onActionBlocked,
    onActionAccepted,
    onActionResolved,
    onCardRevealed,
    onCardLost,
    onGameEnded,
    onChatMessage,
    onUserTyping,
    onUserStoppedTyping,
    onChallengeResolved,
    onBlockDeclared,
    onPlayerDisconnected,
    onPlayerReconnected,
    onPlayerReplacedByBot,
    onTurnTimeout,
    onGameStateSync
  }
}
