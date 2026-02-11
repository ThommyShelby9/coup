import { io, Socket } from 'socket.io-client'
import type { Game, Action } from '~/types'

export const useSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  const connect = () => {
    if (socket.value?.connected) return

    // Se connecter au serveur Socket.io (port 3001)
    const socketUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : 'http://localhost:3001'

    socket.value = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('✅ Socket.io connected')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('❌ Socket.io disconnected')
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  const disconnect = () => {
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
  }

  // Game event listeners
  const onGameUpdate = (callback: (game: Game) => void) => {
    socket.value?.on('game-updated', callback)
  }

  const onPlayerJoined = (callback: (data: { player: any }) => void) => {
    socket.value?.on('player-joined', callback)
  }

  const onPlayerLeft = (callback: (data: { playerId: string }) => void) => {
    socket.value?.on('player-left', callback)
  }

  const onPlayerReadyChanged = (callback: (data: { playerId: string; isReady: boolean }) => void) => {
    socket.value?.on('player-ready-changed', callback)
  }

  const onGameStarted = (callback: (game: Game) => void) => {
    socket.value?.on('game-started', callback)
  }

  const onActionExecuted = (callback: (data: { game: Game; action: Action; needsResponse: boolean }) => void) => {
    socket.value?.on('action-executed', callback)
  }

  const onActionChallenged = (callback: (data: { game: Game; challengerId: string }) => void) => {
    socket.value?.on('action-challenged', callback)
  }

  const onActionBlocked = (callback: (data: { game: Game; blockerId: string; blockingRole: string }) => void) => {
    socket.value?.on('action-blocked', callback)
  }

  const onActionResolved = (callback: (game: Game) => void) => {
    socket.value?.on('action-resolved', callback)
  }

  const onGameEnded = (callback: (data: { game: Game; winner: any }) => void) => {
    socket.value?.on('game-ended', callback)
  }

  const onChatMessage = (callback: (data: { username: string; text: string; timestamp: Date }) => void) => {
    socket.value?.on('chat-message', callback)
  }

  // Game actions
  const joinGame = (gameCode: string) => {
    socket.value?.emit('join-game', gameCode)
  }

  const leaveGame = (gameCode: string) => {
    socket.value?.emit('leave-game', gameCode)
  }

  const toggleReady = (gameId: string, playerId: string) => {
    socket.value?.emit('player-ready', { gameId, playerId })
  }

  const startGame = (gameId: string) => {
    socket.value?.emit('start-game', gameId)
  }

  const executeAction = (data: {
    gameId: string
    actionType: string
    targetId?: string
    claimedRole?: string
  }) => {
    socket.value?.emit('execute-action', data)
  }

  const challengeAction = (gameId: string) => {
    socket.value?.emit('challenge-action', gameId)
  }

  const blockAction = (data: { gameId: string; blockingRole: string }) => {
    socket.value?.emit('block-action', data)
  }

  const acceptAction = (gameId: string) => {
    socket.value?.emit('accept-action', gameId)
  }

  const sendChatMessage = (gameCode: string, text: string) => {
    socket.value?.emit('chat-message', { gameCode, text })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    // Event listeners
    onGameUpdate,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerReadyChanged,
    onGameStarted,
    onActionExecuted,
    onActionChallenged,
    onActionBlocked,
    onActionResolved,
    onGameEnded,
    onChatMessage,
    // Actions
    joinGame,
    leaveGame,
    toggleReady,
    startGame,
    executeAction,
    challengeAction,
    blockAction,
    acceptAction,
    sendChatMessage
  }
}
