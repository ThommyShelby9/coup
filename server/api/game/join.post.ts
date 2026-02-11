import { getSocketIO } from '~/server/socket-instance'
import { Game } from '~/server/models/Game'
import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const authUser = await requireAuth(event)
    console.log('User authenticated:', authUser.username)

    // Récupérer le body
    const body = await readBody(event)
    const { code } = body
    console.log('Join request for code:', code)

    if (!code) {
      console.error('Error: No code provided')
      throw createError({
        statusCode: 400,
        statusMessage: 'Le code de la partie est requis'
      })
    }

    // Trouver la partie
    const game = await Game.findOne({ code: code.toUpperCase() })
    console.log('Game found:', game ? game.code : 'NOT FOUND')

    if (!game) {
      console.error('Error: Game not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Partie non trouvée'
      })
    }

    // Vérifier que la partie est en phase lobby
    console.log('Game phase:', game.phase)
    if (game.phase !== 'lobby') {
      console.error('Error: Game already started')
      throw createError({
        statusCode: 400,
        statusMessage: 'Cette partie a déjà commencé'
      })
    }

    // Vérifier que la partie n'est pas pleine
    console.log('Players:', game.players.length, '/', game.settings.maxPlayers)
    if (game.players.length >= game.settings.maxPlayers) {
      console.error('Error: Game is full')
      throw createError({
        statusCode: 400,
        statusMessage: 'Cette partie est pleine'
      })
    }

    // Vérifier que le joueur n'est pas déjà dans la partie
    const alreadyInGame = game.players.some(
      p => p.userId.toString() === authUser.userId
    )
    console.log('Already in game:', alreadyInGame)

    // Si déjà dans la partie, simplement retourner la partie (au lieu d'erreur)
    if (!alreadyInGame) {
      // Récupérer les infos de l'utilisateur
      const user = await User.findById(authUser.userId)
      console.log('User found:', user ? user.username : 'NOT FOUND')

      if (!user) {
        console.error('Error: User not found')
        throw createError({
          statusCode: 404,
          statusMessage: 'Utilisateur non trouvé'
        })
      }

      // Ajouter le joueur à la partie
      game.players.push({
        userId: user._id,
        username: user.username,
        cards: [],
        coins: 2,
        isAlive: true,
        position: game.players.length,
        avatar: user.avatar,
        isReady: false
      })

      await game.save()
      console.log('Player added successfully to game:', game.code)

      // BROADCAST en temps réel
      const io = getSocketIO()
      if (io) {
        console.log(`[JOIN] 📡 Broadcasting player joined to game ${game.code}`)
        io.to(`game-${game.code}`).emit('player-joined-game', {
          game: {
            _id: game._id,
            code: game.code,
            playerCount: game.players.length,
            maxPlayers: game.settings.maxPlayers,
            players: game.players.map(p => ({
              userId: p.userId,
              username: p.username,
              avatar: p.avatar,
              isReady: p.isReady
            }))
          }
        })

        // Broadcast to lobby
        io.emit('game-updated', {
          code: game.code,
          playerCount: game.players.length,
          phase: game.phase
        })
      }
    } else {
      console.log('Player already in game, returning game state')
    }

    return {
      game: {
        _id: game._id,
        id: game._id, // Pour compatibilité
        code: game.code,
        hostId: game.hostId,
        phase: game.phase,
        players: game.players.map(p => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          isReady: p.isReady,
          isAlive: p.isAlive,
          coins: p.coins,
          cardCount: p.cards.length
        })),
        settings: game.settings
      }
    }
  } catch (error: any) {
    console.error('ERROR in join endpoint:', error)

    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la jonction à la partie:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur lors de la jonction à la partie'
    })
  }
})
