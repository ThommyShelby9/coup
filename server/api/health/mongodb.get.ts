import mongoose from 'mongoose'
import { Game } from '~/server/models/Game'

export default defineEventHandler(async () => {
  try {
    // Check connection status
    const isConnected = mongoose.connection.readyState === 1

    // Count games in database
    let gameCount = 0
    let games = []

    if (isConnected) {
      gameCount = await Game.countDocuments()
      games = await Game.find().limit(5).select('code phase players')
    }

    return {
      connected: isConnected,
      connectionState: mongoose.connection.readyState,
      states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }[mongoose.connection.readyState],
      database: mongoose.connection.name || 'N/A',
      host: mongoose.connection.host || 'N/A',
      gameCount,
      games: games.map(g => ({
        code: g.code,
        phase: g.phase,
        playerCount: g.players.length
      }))
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message
    }
  }
})
