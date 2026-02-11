import type { Server as SocketIOServer } from 'socket.io'
import http from 'http'

// Instance Socket.IO partagée entre le serveur standalone et les API
let io: SocketIOServer | null = null

export function setSocketIO(instance: SocketIOServer) {
  io = instance
  console.log('✅ Socket.IO instance set globally')
}

export function getSocketIO(): SocketIOServer | null {
  return io
}

export async function emitToGame(gameCode: string, event: string, data: any) {
  console.log(`[EMIT] Attempting to emit ${event} to game ${gameCode}`)

  if (io) {
    // Instance locale disponible (serveur standalone)
    io.to(`game-${gameCode}`).emit(event, data)
    console.log(`📡 Emitted ${event} to game ${gameCode} (local)`)
  } else {
    // Pas d'instance locale, envoyer via HTTP au serveur standalone
    console.log(`[EMIT] No local io instance, trying HTTP...`)

    return new Promise<void>((resolve, reject) => {
      const payload = JSON.stringify({ gameCode, event, data })

      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/broadcast',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }

      const req = http.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`📡 Emitted ${event} to game ${gameCode} via HTTP`)
            resolve()
          } else {
            console.warn(`⚠️ Failed to emit ${event} via HTTP: ${res.statusCode} - ${responseData}`)
            resolve() // Ne pas bloquer même en cas d'erreur
          }
        })
      })

      req.on('error', (error) => {
        console.error(`❌ Cannot emit ${event}:`, error.message)
        resolve() // Ne pas bloquer même en cas d'erreur
      })

      req.write(payload)
      req.end()
    })
  }
}
