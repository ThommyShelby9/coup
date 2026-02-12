import type { Game } from '~/types'

/**
 * Composable pour gérer les événements Socket.io du jeu
 * Simplifie l'enregistrement et le désenregistrement des listeners
 */
export const useGameEventHandlers = (
  gameCode: string,
  onGameUpdate: () => void
) => {
  const socket = useSocketService()
  const socketUnsubscribers: Array<() => void> = []

  /**
   * Configurer tous les listeners Socket.io
   */
  const setupListeners = () => {
    // Événements de lobby
    socketUnsubscribers.push(
      socket.onPlayerJoined(() => {
        console.log('Player joined, reloading game state...')
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onPlayerLeft(() => {
        console.log('Player left, reloading game state...')
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onPlayerReadyChanged((data) => {
        console.log('Player ready changed:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onGameStarted(() => {
        console.log('Game started!')
        onGameUpdate()
      })
    )

    // Événements de jeu
    socketUnsubscribers.push(
      socket.onActionExecuted((data) => {
        console.log('Action executed:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onActionChallenged((data) => {
        console.log('Action challenged:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onActionBlocked((data) => {
        console.log('Action blocked:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onActionResolved((data) => {
        console.log('Action resolved:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onChallengeResolved((data) => {
        console.log('Challenge resolved:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onBlockDeclared((data) => {
        console.log('Block declared:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onGameEnded((data) => {
        console.log('Game ended:', data)
        onGameUpdate()
      })
    )

    // Événements de connexion
    socketUnsubscribers.push(
      socket.onPlayerDisconnected((data) => {
        console.log('Player disconnected:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onPlayerReconnected((data) => {
        console.log('Player reconnected:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onPlayerReplacedByBot((data) => {
        console.log('Player replaced by bot:', data)
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onTurnTimeout((data) => {
        console.log('Turn timeout:', data)
      })
    )

    socketUnsubscribers.push(
      socket.onGameStateSync((gameData) => {
        console.log('Game state synced')
        onGameUpdate()
      })
    )

    socketUnsubscribers.push(
      socket.onChatMessage((data) => {
        console.log('Chat message received:', data)
      })
    )
  }

  /**
   * Nettoyer tous les listeners
   */
  const cleanup = () => {
    socketUnsubscribers.forEach(unsub => unsub())
    socketUnsubscribers.length = 0
    socket.leaveGame(gameCode)
  }

  return {
    setupListeners,
    cleanup
  }
}
