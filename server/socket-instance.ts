import type { Server as SocketIOServer } from 'socket.io'

// Instance Socket.IO partagee entre le plugin et les API routes
let io: SocketIOServer | null = null

export function setSocketIO(instance: SocketIOServer) {
  io = instance
  console.log('[SOCKET] Socket.IO instance set globally')
}

export function getSocketIO(): SocketIOServer | null {
  return io
}

export async function emitToGame(gameCode: string, event: string, data: any) {
  if (io) {
    io.to(`game-${gameCode}`).emit(event, data)
    console.log(`[SOCKET] Emitted ${event} to game ${gameCode}`)
  } else {
    console.warn(`[SOCKET] Cannot emit ${event}: Socket.IO not initialized`)
  }
}
