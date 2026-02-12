import { emitToGame } from '~/server/socket-instance'
import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
import { TurnTimer } from '~/server/services/TurnTimer'
import { Game } from '~/server/models/Game'
import type { CardType } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)
    const { gameId, blockingRole } = await readBody(event)

    if (!gameId || !blockingRole) {
      throw createError({
        statusCode: 400,
        message: 'Paramètres manquants'
      })
    }

    // Bloquer l'action
    const result = await GameService.blockAction(
      gameId,
      authUser.userId,
      blockingRole as CardType
    )

    console.log(`[BLOCK] ${authUser.username} blocked with ${blockingRole}`)

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
      await emitToGame(game.code, 'block-declared', {
        game: result,
        blockerId: authUser.userId,
        blockerName: authUser.username,
        blockingRole
      })
    }

    return {
      game: result
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors du blocage:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors du blocage'
    })
  }
})
