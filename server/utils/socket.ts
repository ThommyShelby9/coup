import type { Server as SocketIOServer } from 'socket.io'

// Variable globale pour stocker l'instance Socket.io
let io: SocketIOServer | null = null

export function setSocketIO(instance: SocketIOServer) {
  io = instance
}

export function getSocketIO(): SocketIOServer | null {
  return io
}

export function emitToGame(gameCode: string, event: string, data: any) {
  if (io) {
    io.to(`game-${gameCode}`).emit(event, data)
    console.log(`📡 Emitted ${event} to game ${gameCode}`)
  }
}
