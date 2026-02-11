import mongoose from 'mongoose'
import { Game } from '~/server/models/Game'

export default defineEventHandler(async (event) => {
  try {
    // 1. Informations sur toutes les connexions Mongoose
    const connections = mongoose.connections.map((conn, index) => ({
      index,
      id: conn.id,
      name: conn.name,
      host: conn.host,
      port: conn.port,
      readyState: conn.readyState,
      readyStateText: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }[conn.readyState],
      models: Object.keys(conn.models)
    }))

    // 2. Connexion par défaut
    const defaultConnection = {
      id: mongoose.connection.id,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState
    }

    // 3. Compter les documents dans chaque connexion
    const gamesInDefault = await Game.countDocuments()
    const gamesListDefault = await Game.find().limit(10).select('code phase players createdAt')

    // 4. Vérifier le modèle Game
    const gameModelInfo = {
      modelName: Game.modelName,
      collection: Game.collection.name,
      db: Game.db.name,
      connectionId: Game.db.id
    }

    // 5. Stats de la collection directement
    const db = mongoose.connection.db
    const collections = await db?.listCollections().toArray()

    let directCount = 0
    if (db) {
      const gamesCollection = db.collection('games')
      directCount = await gamesCollection.countDocuments()
      console.log(`[DEBUG] Direct count from 'games' collection:`, directCount)
    }

    return {
      timestamp: new Date().toISOString(),

      // Toutes les connexions Mongoose
      allConnections: connections,
      totalConnections: connections.length,

      // Connexion par défaut
      defaultConnection,

      // Données via le modèle Game
      viaGameModel: {
        count: gamesInDefault,
        games: gamesListDefault.map(g => ({
          code: g.code,
          phase: g.phase,
          playerCount: g.players.length,
          createdAt: g.createdAt
        }))
      },

      // Informations sur le modèle
      gameModelInfo,

      // Données directement de MongoDB
      viaMongoDB: {
        allCollections: collections?.map(c => c.name) || [],
        gamesCollectionCount: directCount
      },

      // Diagnostic
      diagnosis: {
        multipleConnections: connections.length > 1,
        modelAndDirectCountMatch: gamesInDefault === directCount,
        possibleIssue: gamesInDefault !== directCount
          ? 'Model and direct count MISMATCH - possible cache issue'
          : 'Counts match - data is consistent'
      }
    }
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
      stack: error.stack
    }
  }
})
