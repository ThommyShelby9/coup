import 'dotenv/config'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Game } from './server/models/Game'
import { setSocketIO } from './server/socket-instance'

const PORT = 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coup-digital'

console.log('🚀 [SOCKET-SERVER] Starting Socket.IO server...')

// Connect to MongoDB (partagé avec Nuxt)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ [SOCKET-SERVER] MongoDB connected')
    console.log(`[SOCKET-SERVER] Database: ${mongoose.connection.name}`)
    console.log(`[SOCKET-SERVER] Host: ${mongoose.connection.host}`)
  })
  .catch(err => console.error('❌ [SOCKET-SERVER] MongoDB error:', err))

// Create HTTP server with request handler
const httpServer = createServer((req, res) => {
  // Handle broadcast endpoint
  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = ''

    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const { gameCode, event, data } = JSON.parse(body)

        if (!gameCode || !event) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'gameCode and event are required' }))
          return
        }

        console.log(`📡 [HTTP] Broadcasting ${event} to game ${gameCode}`)
        io.to(`game-${gameCode}`).emit(event, data)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } catch (error: any) {
        console.error('[HTTP] Error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
  // Autres requêtes: laisser Socket.IO gérer
})

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling']
})

console.log('✅ [SOCKET-SERVER] Socket.IO server created')

// Enregistrer l'instance globalement pour les API
setSocketIO(io)

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    console.log('⚠️ [SOCKET-SERVER] No token, guest connection')
    socket.data.userId = null
    socket.data.username = 'Guest'
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
    socket.data.userId = decoded.userId
    socket.data.username = decoded.username
    console.log(`✅ [SOCKET-SERVER] Auth: ${decoded.username}`)
    next()
  } catch (error: any) {
    console.warn(`⚠️ [SOCKET-SERVER] Invalid token:`, error.message)
    socket.data.userId = null
    socket.data.username = 'Guest'
    next()
  }
})

io.on('connection', (socket) => {
  console.log(`🔌 [SOCKET-SERVER] Client connected: ${socket.id} (${socket.data.username})`)

  // Join game room
  socket.on('join-game', async (gameCode: string) => {
    try {
      socket.join(`game-${gameCode}`)
      console.log(`🎮 [SOCKET-SERVER] ${socket.data.username} joined game ${gameCode}`)

      const game = await Game.findOne({ code: gameCode })
      if (game) {
        socket.emit('game-state', game)
      }
    } catch (error: any) {
      console.error('[SOCKET-SERVER] Join error:', error)
      socket.emit('error', { message: error.message })
    }
  })

  // Leave game room
  socket.on('leave-game', (gameCode: string) => {
    socket.leave(`game-${gameCode}`)
    console.log(`👋 [SOCKET-SERVER] ${socket.data.username} left game ${gameCode}`)
  })

  // Chat message
  socket.on('chat-message', (data: { gameCode: string; text: string }) => {
    const { gameCode, text } = data
    console.log(`💬 [SOCKET-SERVER] Chat from ${socket.data.username} in ${gameCode}: ${text}`)

    // Broadcast to all players in the game (including sender)
    io.to(`game-${gameCode}`).emit('chat-message', {
      username: socket.data.username,
      text,
      timestamp: new Date()
    })
  })

  // Player ready
  socket.on('player-ready', async (data: { gameCode: string; isReady: boolean }) => {
    const { gameCode, isReady } = data
    console.log(`✅ [SOCKET-SERVER] Player ready: ${socket.data.username} (${socket.data.userId}) - ${isReady}`)

    try {
      // Mettre à jour la base de données
      const game = await Game.findOne({ code: gameCode })

      if (!game) {
        console.error(`[SOCKET-SERVER] Game ${gameCode} not found`)
        return
      }

      console.log(`[SOCKET-SERVER] Game found. Players:`, game.players.map((p: any) => ({
        username: p.username,
        userId: p.userId.toString(),
        isReady: p.isReady
      })))

      // Trouver le joueur et mettre à jour son statut
      const playerIndex = game.players.findIndex(
        (p: any) => p.userId.toString() === socket.data.userId
      )

      console.log(`[SOCKET-SERVER] Player index: ${playerIndex}`)

      if (playerIndex !== -1) {
        game.players[playerIndex].isReady = isReady
        await game.save()
        console.log(`✅ [SOCKET-SERVER] Player ${game.players[playerIndex].username} ready status saved: ${isReady}`)

        // Log all players ready status
        const allReady = game.players.every((p: any) => p.isReady)
        console.log(`[SOCKET-SERVER] All players ready: ${allReady}`)
      } else {
        console.error(`[SOCKET-SERVER] Player with userId ${socket.data.userId} not found in game`)
      }
    } catch (error) {
      console.error('[SOCKET-SERVER] Error updating player ready status:', error)
    }

    // Broadcast l'événement
    io.to(`game-${gameCode}`).emit('player-ready-changed', {
      playerId: socket.data.userId,
      username: socket.data.username,
      isReady
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 [SOCKET-SERVER] Client disconnected: ${socket.id}`)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ [SOCKET-SERVER] Listening on port ${PORT}`)
  console.log(`   Socket.IO endpoint: http://localhost:${PORT}/socket.io/`)
  console.log(`   Broadcast API: http://localhost:${PORT}/broadcast`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ [SOCKET-SERVER] SIGTERM received, closing...')
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ [SOCKET-SERVER] Shutdown complete')
      process.exit(0)
    })
  })
})
