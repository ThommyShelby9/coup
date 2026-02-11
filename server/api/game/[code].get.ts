import { Game } from '~/server/models/Game'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const code = getRouterParam(event, 'code')

    if (!code) {
      throw createError({
        statusCode: 400,
        message: 'Code de partie requis'
      })
    }

    // Trouver la partie
    const game = await Game.findOne({ code: code.toUpperCase() })

    if (!game) {
      throw createError({
        statusCode: 404,
        message: 'Partie non trouvée'
      })
    }

    // Récupérer l'utilisateur actuel (si authentifié)
    const authUser = getAuthUser(event)

    // Formater les données selon si l'utilisateur est dans la partie
    const isPlayerInGame = authUser
      ? game.players.some(p => p.userId.toString() === authUser.userId)
      : false

    // Si l'utilisateur est dans la partie, inclure ses cartes
    const formattedPlayers = game.players.map(p => {
      const isCurrentUser = authUser && p.userId.toString() === authUser.userId

      return {
        userId: p.userId.toString(), // Convertir en string
        username: p.username,
        avatar: p.avatar,
        isReady: p.isReady,
        isAlive: p.isAlive,
        coins: p.coins,
        cardCount: p.cards.length,
        // Seulement envoyer les cartes du joueur actuel
        cards: isCurrentUser ? p.cards : undefined,
        position: p.position
      }
    })

    return {
      game: {
        _id: game._id.toString(),
        id: game._id.toString(), // Pour compatibilité
        code: game.code,
        hostId: game.hostId.toString(), // Convertir en string
        phase: game.phase,
        turn: game.turn,
        currentPlayer: game.currentPlayer,
        players: formattedPlayers,
        settings: game.settings,
        lastAction: game.lastAction,
        actionHistory: game.actionHistory || [],
        isPlayerInGame
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la récupération de la partie:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération de la partie'
    })
  }
})
