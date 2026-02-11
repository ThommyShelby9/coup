import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { loadNuxt } from 'nuxt'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const PORT = 3000

console.log('🚀 Starting Coup Digital on port', PORT, '...\n')

async function start() {
  try {
    // Charger Nuxt
    const nuxt = await loadNuxt({
      cwd: __dirname,
      dev: isDev,
      ready: false
    })

    await nuxt.ready()

    // Créer le serveur HTTP avec le handler Nuxt
    const server = createServer(nuxt.server.app)

    // Attacher Socket.io au même serveur
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      path: '/socket.io/'
    })

    // Gestion des événements Socket.io
    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id)
      })

      // Join game room
      socket.on('join-game', (gameCode) => {
        socket.join(`game-${gameCode}`)
        console.log(`Player ${socket.id} joined game ${gameCode}`)
        socket.to(`game-${gameCode}`).emit('player-joined', { socketId: socket.id })
      })

      // Leave game room
      socket.on('leave-game', (gameCode) => {
        socket.leave(`game-${gameCode}`)
        console.log(`Player ${socket.id} left game ${gameCode}`)
        io.to(`game-${gameCode}`).emit('player-left', { socketId: socket.id })
      })

      // Player ready
      socket.on('player-ready', (data) => {
        console.log('Player ready:', data)
        io.to(`game-${data.gameCode || ''}`).emit('player-ready-changed', data)
      })

      // Start game
      socket.on('start-game', (gameId) => {
        console.log('Game starting:', gameId)
      })

      // Execute action
      socket.on('execute-action', (data) => {
        console.log('Action executed:', data)
      })

      // Challenge action
      socket.on('challenge-action', (gameId) => {
        console.log('Action challenged:', gameId)
      })

      // Block action
      socket.on('block-action', (data) => {
        console.log('Action blocked:', data)
      })

      // Accept action
      socket.on('accept-action', (gameId) => {
        console.log('Action accepted:', gameId)
      })

      // Chat message
      socket.on('chat-message', (data) => {
        console.log('Chat message:', data)
        io.to(`game-${data.gameCode}`).emit('chat-message', {
          username: data.username || 'Anonymous',
          text: data.text,
          timestamp: new Date()
        })
      })
    })

    console.log('✅ Socket.io initialized')

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`)
      console.log(`📡 Socket.io ready on the same port\n`)
    })

  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

start()
