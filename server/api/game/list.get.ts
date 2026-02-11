import mongoose from 'mongoose'
import { Game } from '~/server/models/Game'

export default defineEventHandler(async (event) => {
  // Désactiver le cache pour cette route
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  const requestId = Math.random().toString(36).substring(7)
  console.log(`[LIST-${requestId}] 🔍 Fetching games...`)
  console.log(`[LIST-${requestId}] MongoDB connection:`, {
    state: mongoose.connection.readyState,
    db: mongoose.connection.name,
    host: mongoose.connection.host,
    connectionId: mongoose.connection.id
  })

  try {
    // Compter d'abord
    const totalCount = await Game.countDocuments()
    const lobbyCount = await Game.countDocuments({ phase: 'lobby' })
    console.log(`[LIST-${requestId}] 📊 Total games: ${totalCount}, Lobby: ${lobbyCount}`)

    // Compter directement dans MongoDB (bypass Mongoose)
    const db = mongoose.connection.db
    if (db) {
      const directCount = await db.collection('games').countDocuments()
      console.log(`[LIST-${requestId}] 📊 Direct MongoDB count: ${directCount}`)

      if (directCount !== totalCount) {
        console.error(`[LIST-${requestId}] ❌ MISMATCH! Mongoose: ${totalCount}, MongoDB: ${directCount}`)
      }
    }

    // Récupérer les parties en phase lobby
    const games = await Game.find({ phase: 'lobby' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-deck -actionHistory')
      .lean() // Use lean() to get plain objects (no Mongoose magic)

    console.log(`[LIST-${requestId}] 📋 Query returned ${games.length} games:`,
      games.map(g => ({ code: g.code, _id: g._id?.toString() }))
    )

    // Formatter les données avec log pour debug
    const formattedGames = games.map(game => {
      const formatted = {
        id: game._id,
        code: game.code,
        hostId: game.hostId,
        hostName: game.players[0]?.username || 'Unknown',
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        settings: game.settings,
        createdAt: game.createdAt,
        // Debug: inclure la liste des joueurs
        players: game.players.map(p => ({
          username: p.username,
          isReady: p.isReady
        }))
      }

      console.log(`[API] Game ${game.code}: ${formatted.playerCount}/${formatted.maxPlayers} players`)
      return formatted
    })

    console.log(`[API] Returning ${formattedGames.length} lobby games`)

    return {
      games: formattedGames
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des parties:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des parties'
    })
  }
})
