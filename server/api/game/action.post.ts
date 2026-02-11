import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
import { Game } from '~/server/models/Game'
import { emitToGame } from '~/server/socket-instance'
import type { ActionType, CardType } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)
    const { gameId, actionType, targetId, claimedRole } = await readBody(event)

    if (!gameId || !actionType) {
      throw createError({
        statusCode: 400,
        message: 'Paramètres manquants'
      })
    }

    // Exécuter l'action
    const result = await GameService.executeAction(
      gameId,
      authUser.userId,
      actionType as ActionType,
      targetId,
      claimedRole as CardType
    )

    console.log(`[ACTION] ${authUser.username} executed ${actionType}`)

    // Récupérer le game complet pour le code
    const game = await Game.findById(gameId)

    // Broadcast via Socket.IO aux autres joueurs
    if (game) {
      await emitToGame(game.code, 'action-executed', {
        game: result.game,
        action: result.action,
        needsResponse: result.needsResponse,
        canBeBlocked: result.canBeBlocked,
        canBeChallenged: result.canBeChallenged,
        blockingRoles: result.blockingRoles || []
      })
    }

    return {
      game: result.game,
      action: result.action,
      needsResponse: result.needsResponse,
      canBeBlocked: result.canBeBlocked,
      canBeChallenged: result.canBeChallenged,
      blockingRoles: result.blockingRoles
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de l\'exécution de l\'action:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de l\'exécution de l\'action'
    })
  }
})
