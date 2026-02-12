import { emitToGame } from '~/server/socket-instance'
import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
import { TurnTimer } from '~/server/services/TurnTimer'
import { Game } from '~/server/models/Game'

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)
    const { gameId } = await readBody(event)

    if (!gameId) {
      throw createError({
        statusCode: 400,
        message: 'ID de partie requis'
      })
    }

    // Contester l'action
    const result = await GameService.challengeAction(gameId, authUser.userId)

    console.log(`[CHALLENGE] ${authUser.username} challenged action`)

    // Récupérer le code de la partie
    const game = await Game.findById(gameId)

    // Restart the turn timer for the next player
    if (game && game.phase === 'playing') {
      const timePerTurn = game.settings?.timePerTurn || 30
      TurnTimer.startTimer(gameId, game.code, timePerTurn)
    } else if (game) {
      TurnTimer.clearTimer(gameId)
    }

    // Broadcast via Socket.IO
    if (game) {
      await emitToGame(game.code, 'challenge-resolved', {
        game: result,
        challengerId: authUser.userId,
        challengerName: authUser.username,
        revealedCard: result.revealedCard,
        challengeSuccess: result.challengeSuccess,
        eliminatedPlayer: result.eliminatedPlayer
      })
    }

    return {
      game: result
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la contestation:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la contestation'
    })
  }
})
