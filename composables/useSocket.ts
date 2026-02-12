import { io, Socket } from 'socket.io-client'
import type { Game, Action } from '~/types'

export const useSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  const connect = () => {
    if (socket.value?.connected) return

    // Se connecter au serveur Socket.io (meme origine que Nuxt)
    const socketUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'

    socket.value = io(socketUrl, {
      transports: ['polling'],
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

  // Game event listeners - retournent une fonction de cleanup
  const onGameUpdate = (callback: (game: Game) => void) => {
    socket.value?.on('game-updated', callback)
    return () => {
      socket.value?.off('game-updated', callback)
    }
  }

  const onPlayerJoined = (callback: (data: { player: any }) => void) => {
    socket.value?.on('player-joined', callback)
    return () => {
      socket.value?.off('player-joined', callback)
    }
  }

  const onPlayerLeft = (callback: (data: { playerId: string }) => void) => {
    socket.value?.on('player-left', callback)
    return () => {
      socket.value?.off('player-left', callback)
    }
  }

  const onPlayerReadyChanged = (callback: (data: { playerId: string; isReady: boolean }) => void) => {
    socket.value?.on('player-ready-changed', callback)
    return () => {
      socket.value?.off('player-ready-changed', callback)
    }
  }

  const onGameStarted = (callback: (game: Game) => void) => {
    socket.value?.on('game-started', callback)
    return () => {
      socket.value?.off('game-started', callback)
    }
  }

  const onActionExecuted = (callback: (data: { game: Game; action: Action; needsResponse: boolean }) => void) => {
    socket.value?.on('action-executed', callback)
    return () => {
      socket.value?.off('action-executed', callback)
    }
  }

  const onActionChallenged = (callback: (data: { game: Game; challengerId: string }) => void) => {
    socket.value?.on('action-challenged', callback)
    return () => {
      socket.value?.off('action-challenged', callback)
    }
  }

  const onActionBlocked = (callback: (data: { game: Game; blockerId: string; blockingRole: string }) => void) => {
    socket.value?.on('action-blocked', callback)
    return () => {
      socket.value?.off('action-blocked', callback)
    }
  }

  const onActionResolved = (callback: (game: Game) => void) => {
    socket.value?.on('action-resolved', callback)
    return () => {
      socket.value?.off('action-resolved', callback)
    }
  }

  const onGameEnded = (callback: (data: { game: Game; winner: any }) => void) => {
    socket.value?.on('game-ended', callback)
    return () => {
      socket.value?.off('game-ended', callback)
    }
  }

  const onChatMessage = (callback: (data: { username: string; text: string; timestamp: Date }) => void) => {
    socket.value?.on('chat-message', callback)
    return () => {
      socket.value?.off('chat-message', callback)
    }
  }

  const onChallengeResolved = (callback: (data: any) => void) => {
    socket.value?.on('challenge-resolved', callback)
    return () => {
      socket.value?.off('challenge-resolved', callback)
    }
  }

  const onBlockDeclared = (callback: (data: any) => void) => {
    socket.value?.on('block-declared', callback)
    return () => {
      socket.value?.off('block-declared', callback)
    }
  }

  const onPlayerDisconnected = (callback: (data: { playerName: string }) => void) => {
    socket.value?.on('player-disconnected', callback)
    return () => {
      socket.value?.off('player-disconnected', callback)
    }
  }

  const onPlayerReconnected = (callback: (data: { playerName: string }) => void) => {
    socket.value?.on('player-reconnected', callback)
    return () => {
      socket.value?.off('player-reconnected', callback)
    }
  }

  const onPlayerReplacedByBot = (callback: (data: { botName: string }) => void) => {
    socket.value?.on('player-replaced-by-bot', callback)
    return () => {
      socket.value?.off('player-replaced-by-bot', callback)
    }
  }

  const onTurnTimeout = (callback: (data: { message: string }) => void) => {
    socket.value?.on('turn-timeout', callback)
    return () => {
      socket.value?.off('turn-timeout', callback)
    }
  }

  const onGameStateSync = (callback: (gameData: Game) => void) => {
    socket.value?.on('game-state-sync', callback)
    return () => {
      socket.value?.off('game-state-sync', callback)
    }
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
    onChallengeResolved,
    onBlockDeclared,
    onPlayerDisconnected,
    onPlayerReconnected,
    onPlayerReplacedByBot,
    onTurnTimeout,
    onGameStateSync,
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
