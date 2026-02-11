import { Game } from '~/server/models/Game'
import { requireAuth } from '~/server/utils/auth'
import { emitToGame } from '~/server/utils/socket'

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)
    console.log('Ready toggle - User:', authUser.username)

    const { gameId } = await readBody(event)
    console.log('Ready toggle - GameId:', gameId)

    if (!gameId) {
      console.error('Error: No gameId provided')
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de partie requis'
      })
    }

    const game = await Game.findById(gameId)
    console.log('Ready toggle - Game found:', game ? game.code : 'NOT FOUND')

    if (!game) {
      console.error('Error: Game not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Partie non trouvée'
      })
    }

    if (game.phase !== 'lobby') {
      console.error('Error: Game not in lobby phase')
      throw createError({
        statusCode: 400,
        statusMessage: 'La partie a déjà commencé'
      })
    }

    // Trouver le joueur
    const player = game.players.find(
      p => p.userId.toString() === authUser.userId
    )
    console.log('Ready toggle - Player found:', player ? player.username : 'NOT FOUND')

    if (!player) {
      console.error('Error: Player not in game')
      throw createError({
        statusCode: 404,
        statusMessage: 'Vous n\'êtes pas dans cette partie'
      })
    }

    // Basculer l'état ready
    player.isReady = !player.isReady
    console.log('Ready toggle - New state:', player.isReady)

    await game.save()
    console.log('Ready toggle - Game saved successfully')

    // Notifier via Socket.io
    emitToGame(game.code, 'player-ready-changed', {
      playerId: authUser.userId,
      isReady: player.isReady
    })

    return {
      game: {
        id: game._id,
        code: game.code,
        players: game.players.map(p => ({
          userId: p.userId,
          username: p.username,
          isReady: p.isReady,
          avatar: p.avatar
        }))
      }
    }
  } catch (error: any) {
    console.error('ERROR in ready endpoint:', error)

    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors du marquage ready:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})
