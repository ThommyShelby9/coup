import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { Game } from '../models/Game'
import { setSocketIO } from '../socket-instance'

let initialized = false

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    if (initialized) return
    initialized = true

    const httpServer = (event.node.req.socket as any)?.server
    if (!httpServer) {
      console.error('[SOCKET] Could not get HTTP server reference')
      return
    }

    const config = useRuntimeConfig()
    const JWT_SECRET = config.jwtSecret || 'your-secret-key-change-in-production'

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    })

    // Enregistrer l'instance globalement pour les API routes
    setSocketIO(io)
    console.log('[SOCKET] Socket.IO attached to Nuxt server on same port')

    // Authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        socket.data.userId = null
        socket.data.username = 'Guest'
        return next()
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
        socket.data.userId = decoded.userId
        socket.data.username = decoded.username
        console.log(`[SOCKET] Auth: ${decoded.username}`)
        next()
      } catch (error: any) {
        console.warn(`[SOCKET] Invalid token:`, error.message)
        socket.data.userId = null
        socket.data.username = 'Guest'
        next()
      }
    })

    // Connection handler
    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id} (${socket.data.username})`)

      // Join game room
      socket.on('join-game', async (gameCode: string) => {
        try {
          socket.join(`game-${gameCode}`)
          console.log(`[SOCKET] ${socket.data.username} joined game ${gameCode}`)

          const game = await Game.findOne({ code: gameCode })
          if (game) {
            socket.emit('game-state', game)
          }
        } catch (error: any) {
          console.error('[SOCKET] Join error:', error)
          socket.emit('error', { message: error.message })
        }
      })

      // Leave game room
      socket.on('leave-game', (gameCode: string) => {
        socket.leave(`game-${gameCode}`)
        console.log(`[SOCKET] ${socket.data.username} left game ${gameCode}`)
      })

      // Chat message
      socket.on('chat-message', (data: { gameCode: string; text: string }) => {
        const { gameCode, text } = data
        io.to(`game-${gameCode}`).emit('chat-message', {
          username: socket.data.username,
          text,
          timestamp: new Date()
        })
      })

      // Player ready
      socket.on('player-ready', async (data: { gameCode: string; isReady: boolean }) => {
        const { gameCode, isReady } = data
        console.log(`[SOCKET] Player ready: ${socket.data.username} - ${isReady}`)

        try {
          const game = await Game.findOne({ code: gameCode })
          if (!game) {
            console.error(`[SOCKET] Game ${gameCode} not found`)
            return
          }

          const playerIndex = game.players.findIndex(
            (p: any) => p.userId.toString() === socket.data.userId
          )

          if (playerIndex !== -1) {
            game.players[playerIndex].isReady = isReady
            await game.save()
            console.log(`[SOCKET] Player ${game.players[playerIndex].username} ready: ${isReady}`)
          } else {
            console.error(`[SOCKET] Player ${socket.data.userId} not found in game`)
          }
        } catch (error) {
          console.error('[SOCKET] Error updating player ready:', error)
        }

        // Broadcast
        io.to(`game-${gameCode}`).emit('player-ready-changed', {
          playerId: socket.data.userId,
          username: socket.data.username,
          isReady
        })
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`)
      })
    })
  })
})
