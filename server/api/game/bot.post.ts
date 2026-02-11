import { getSocketIO } from '~/server/socket-instance'
import { Game } from '~/server/models/Game'
import { requireAuth } from '~/server/utils/auth'
import mongoose from 'mongoose'

// Noms de bots prédéfinis
const BOT_NAMES = [
  'Bot_Duke',
  'Bot_Assassin',
  'Bot_Captain',
  'Bot_Ambassador',
  'Bot_Contessa',
  'Bot_Bluffeur',
  'Bot_Stratège',
  'Bot_Rusé',
  'Bot_Audacieux',
  'Bot_Prudent'
]

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification (seul l'hôte peut ajouter un bot)
    const authUser = await requireAuth(event)
    console.log('[BOT] User authenticated:', authUser.username)

    // Récupérer le body
    const body = await readBody(event)
    const { gameId, difficulty = 'medium' } = body

    if (!gameId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'L\'ID de la partie est requis'
      })
    }

    // Trouver la partie
    const game = await Game.findById(gameId)
    console.log('[BOT] Game found:', game ? game.code : 'NOT FOUND')

    if (!game) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Partie non trouvée'
      })
    }

    // Vérifier que l'utilisateur est l'hôte
    if (game.hostId.toString() !== authUser.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Seul l\'hôte peut ajouter des bots'
      })
    }

    // Vérifier que la partie est en phase lobby
    if (game.phase !== 'lobby') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Impossible d\'ajouter un bot après le début de la partie'
      })
    }

    // Vérifier que la partie n'est pas pleine
    if (game.players.length >= game.settings.maxPlayers) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La partie est pleine'
      })
    }

    // Générer un nom unique pour le bot
    const existingBotNames = game.players
      .map(p => p.username)
      .filter(name => name.startsWith('Bot_'))

    let botName = BOT_NAMES.find(name => !existingBotNames.includes(name))

    // Si tous les noms prédéfinis sont pris, générer un nom avec numéro
    if (!botName) {
      botName = `Bot_${game.players.length + 1}`
    }

    // Créer un ID unique pour le bot (utiliser un ObjectId mongoose)
    const botId = new mongoose.Types.ObjectId()

    // Ajouter le bot à la partie
    game.players.push({
      userId: botId,
      username: botName,
      cards: [],
      coins: 2,
      isAlive: true,
      position: game.players.length,
      avatar: 'bot-avatar.png',
      isReady: true, // Les bots sont toujours prêts
      isConnected: true
    })

    await game.save()
    console.log('[BOT] Bot added successfully:', botName)

    // BROADCAST en temps réel
    const io = getSocketIO()
    if (io) {
      console.log(`[BOT] 📡 Broadcasting bot added to game ${game.code}`)
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

    return {
      success: true,
      bot: {
        userId: botId,
        username: botName,
        difficulty
      },
      game: {
        _id: game._id,
        code: game.code,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers
      }
    }
  } catch (error: any) {
    console.error('[BOT] ERROR:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur lors de l\'ajout du bot'
    })
  }
})
