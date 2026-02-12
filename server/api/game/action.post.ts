import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
import { TurnTimer } from '~/server/services/TurnTimer'
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

    // Restart the turn timer only if the action was fully resolved (no challenge/block pending)
    if (game && !result.needsResponse) {
      if (game.phase === 'playing') {
        const timePerTurn = game.settings?.timePerTurn || 30
        TurnTimer.startTimer(gameId, game.code, timePerTurn)
      } else if (game.phase === 'ended') {
        TurnTimer.clearTimer(gameId)
      }
    }
    // If the action needs response (challenge/block window), the timer keeps running
    // and will auto-resolve when it expires (handled in TurnTimer)

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
