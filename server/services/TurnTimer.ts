import { GameService } from './GameService'
import { emitToGame } from '~/server/socket-instance'
import { Game } from '~/server/models/Game'

const timers: Map<string, ReturnType<typeof setTimeout>> = new Map()

export class TurnTimer {
  /**
   * Start (or restart) the turn timer for a game.
   * When the timer expires, the current player's turn is skipped.
   */
  static startTimer(gameId: string, gameCode: string, timePerTurn: number) {
    // Clear any existing timer for this game
    TurnTimer.clearTimer(gameId)

    console.log(`[TIMER] Starting ${timePerTurn}s timer for game ${gameCode} (${gameId})`)

    // Emit turn-started so clients can show a countdown
    emitToGame(gameCode, 'turn-started', { timePerTurn })

    const timeout = setTimeout(async () => {
      timers.delete(gameId)

      try {
        // Re-fetch game to check current state
        const game = await Game.findById(gameId)
        if (!game || game.phase !== 'playing') {
          console.log(`[TIMER] Game ${gameId} no longer playing, skipping timeout`)
          return
        }

        // If there's an unresolved action pending, don't skip — the timer
        // for the response window is separate from the turn timer
        if (game.lastAction && !game.lastAction.resolved) {
          console.log(`[TIMER] Unresolved action pending for game ${gameId}, auto-resolving`)
          // Auto-resolve the pending action (accept it), then restart timer
          try {
            const resolvedGame = await GameService.resolveAction(gameId)
            await emitToGame(gameCode, 'action-resolved', { game: resolvedGame })
            await emitToGame(gameCode, 'game-state-sync', resolvedGame)

            if (resolvedGame.phase === 'playing') {
              TurnTimer.startTimer(gameId, gameCode, timePerTurn)
            }
          } catch (resolveErr) {
            console.error(`[TIMER] Error auto-resolving action:`, resolveErr)
          }
          return
        }

        const currentPlayer = game.players[game.currentPlayer]
        const playerName = currentPlayer?.username || 'Joueur inconnu'

        console.log(`[TIMER] Timeout for ${playerName} in game ${gameCode}`)

        // Skip the turn
        const updatedGame = await GameService.skipTurn(gameId)

        // Notify all clients
        await emitToGame(gameCode, 'turn-timeout', {
          playerId: currentPlayer?.userId?.toString(),
          autoAction: 'skip',
          message: `${playerName} n'a pas joué à temps — tour passé`
        })

        // Sync the new game state
        await emitToGame(gameCode, 'game-state-sync', updatedGame)

        // If the game is still playing, start the timer for the next player
        if (updatedGame.phase === 'playing') {
          TurnTimer.startTimer(gameId, gameCode, timePerTurn)
        } else {
          // Game ended — notify
          const winner = updatedGame.players.find((p: any) => p.isAlive)
          if (winner) {
            await emitToGame(gameCode, 'game-ended', {
              game: updatedGame,
              winner,
              stats: {
                turns: updatedGame.turn,
                bluffs: 0,
                duration: '0'
              }
            })
          }
        }
      } catch (error) {
        console.error(`[TIMER] Error handling timeout for game ${gameId}:`, error)
      }
    }, timePerTurn * 1000)

    timers.set(gameId, timeout)
  }

  /**
   * Clear the timer for a specific game
   */
  static clearTimer(gameId: string) {
    const existing = timers.get(gameId)
    if (existing) {
      clearTimeout(existing)
      timers.delete(gameId)
      console.log(`[TIMER] Cleared timer for game ${gameId}`)
    }
  }

  /**
   * Clear all timers (server shutdown cleanup)
   */
  static clearAll() {
    for (const [gameId, timeout] of timers) {
      clearTimeout(timeout)
    }
    timers.clear()
    console.log('[TIMER] All timers cleared')
  }
}
