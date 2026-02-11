import { emitToGame } from '~/server/socket-instance'
import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
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

    // Résoudre l'action
    const result = await GameService.resolveAction(gameId)

    console.log(`[RESOLVE] Action resolved by ${authUser.username}`)

    // Récupérer le code de la partie
    const game = await Game.findById(gameId)

    // Broadcast via Socket.IO
    if (game) {
      await emitToGame(game.code, 'action-resolved', {
        game: result
      })
    }

    return {
      game: result
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la résolution:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la résolution'
    })
  }
})
