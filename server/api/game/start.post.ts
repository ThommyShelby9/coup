import { Game } from '~/server/models/Game'
import { requireAuth } from '~/server/utils/auth'
import { GameService } from '~/server/services/GameService'
import { TurnTimer } from '~/server/services/TurnTimer'
import { emitToGame } from '~/server/socket-instance'

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

    const game = await Game.findById(gameId)

    if (!game) {
      throw createError({
        statusCode: 404,
        message: 'Partie non trouvée'
      })
    }

    // Vérifier que c'est l'hôte qui démarre
    if (game.hostId.toString() !== authUser.userId) {
      throw createError({
        statusCode: 403,
        message: 'Seul l\'hôte peut démarrer la partie'
      })
    }

    // Démarrer la partie
    const startedGame = await GameService.startGame(gameId)

    console.log('[START] Game started successfully:', startedGame.code)

    // Start the turn timer
    const timePerTurn = startedGame.settings?.timePerTurn || 30
    TurnTimer.startTimer(startedGame._id.toString(), startedGame.code, timePerTurn)

    // Notifier tous les joueurs via Socket.io
    await emitToGame(startedGame.code, 'game-started', {
      gameId: startedGame._id.toString(),
      gameCode: startedGame.code
    })

    return {
      game: {
        id: startedGame._id,
        code: startedGame.code,
        phase: startedGame.phase,
        currentPlayer: startedGame.currentPlayer,
        turn: startedGame.turn,
        players: startedGame.players.map((p, index) => {
          const isCurrentUser = p.userId.toString() === authUser.userId

          return {
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            isAlive: p.isAlive,
            coins: p.coins,
            cardCount: p.cards.length,
            // Seulement envoyer les cartes du joueur actuel
            cards: isCurrentUser ? p.cards : undefined,
            position: p.position,
            isCurrentPlayer: index === startedGame.currentPlayer
          }
        })
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors du démarrage de la partie:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors du démarrage de la partie'
    })
  }
})
