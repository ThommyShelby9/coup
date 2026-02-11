import { getSocketIO } from '~/server/socket-instance'
import mongoose from 'mongoose'
import { Game } from '~/server/models/Game'
import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth'
import { generateGameCode, createDeck, shuffleDeck } from '~/server/utils/gameUtils'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const authUser = await requireAuth(event)

    // Récupérer le body
    const body = await readBody(event)
    const { maxPlayers = 6, timePerTurn = 30, allowSpectators = true } = body

    // Validation
    if (maxPlayers < 2 || maxPlayers > 6) {
      throw createError({
        statusCode: 400,
        message: 'Le nombre de joueurs doit être entre 2 et 6'
      })
    }

    if (timePerTurn < 15 || timePerTurn > 60) {
      throw createError({
        statusCode: 400,
        message: 'Le temps par tour doit être entre 15 et 60 secondes'
      })
    }

    // Récupérer les infos complètes de l'utilisateur
    const user = await User.findById(authUser.userId)

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Utilisateur non trouvé'
      })
    }

    // Générer un code unique
    let gameCode: string
    let codeExists = true

    while (codeExists) {
      gameCode = generateGameCode()
      const existingGame = await Game.findOne({ code: gameCode })
      codeExists = !!existingGame
    }

    // Créer le deck et le mélanger
    const deck = shuffleDeck(createDeck())

    // Créer la partie
    console.log(`[CREATE] Creating game ${gameCode} for user ${user.username}`)
    console.log(`[CREATE] MongoDB connection state:`, mongoose.connection.readyState)
    console.log(`[CREATE] Database name:`, mongoose.connection.name)
    console.log(`[CREATE] Database host:`, mongoose.connection.host)

    const gameData = {
      code: gameCode!,
      hostId: user._id,
      players: [
        {
          userId: user._id,
          username: user.username,
          cards: [],
          coins: 2,
          isAlive: true,
          position: 0,
          avatar: user.avatar,
          isReady: false
        }
      ],
      deck,
      currentPlayer: 0,
      phase: 'lobby',
      turn: 0,
      actionHistory: [],
      settings: {
        maxPlayers,
        timePerTurn,
        allowSpectators
      }
    }

    console.log(`[CREATE] About to create game with data:`, JSON.stringify({
      code: gameData.code,
      hostId: gameData.hostId.toString(),
      playerCount: gameData.players.length
    }))

    const game = await Game.create(gameData)

    console.log(`[CREATE] ✅ Game.create() returned with _id:`, game._id)
    console.log(`[CREATE] Game code: ${game.code} | Host: ${user.username}`)
    console.log(`[CREATE] Players in game:`, game.players.length)

    // VERIFICATION IMMEDIATE - Est-ce que le jeu existe vraiment dans la DB?
    console.log(`[CREATE] 🔍 VERIFICATION: Checking if game exists in database...`)
    const verification = await Game.findById(game._id)
    console.log(`[CREATE] 🔍 VERIFICATION Result:`, verification ? 'FOUND ✅' : 'NOT FOUND ❌')

    if (verification) {
      console.log(`[CREATE] 🔍 VERIFICATION - Game code in DB:`, verification.code)
      console.log(`[CREATE] 🔍 VERIFICATION - Players in DB:`, verification.players.length)
    } else {
      console.error(`[CREATE] ❌❌❌ CRITICAL: Game was created but NOT FOUND in database!`)
    }

    // Vérifier le nombre total de jeux
    const totalGames = await Game.countDocuments()
    console.log(`[CREATE] 📊 Total games in database:`, totalGames)

    const lobbyGames = await Game.countDocuments({ phase: 'lobby' })
    console.log(`[CREATE] 📊 Lobby games in database:`, lobbyGames)

    // BROADCAST en temps réel au lobby via Socket.IO
    const io = getSocketIO()
    if (io) {
      console.log(`[CREATE] 📡 Broadcasting new game to lobby`)
      io.emit('game-created', {
        code: game.code,
        hostId: game.hostId,
        hostName: user.username,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        settings: game.settings,
        createdAt: game.createdAt
      })
    } else {
      console.warn(`[CREATE] ⚠️ Socket.IO not available for broadcast`)
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
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la création de la partie:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création de la partie'
    })
  }
})
