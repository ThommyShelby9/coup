import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Game } from './server/models/Game'
import { GameService } from './server/services/GameService'
import { BotService } from './server/services/BotService'

const PORT = 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coup-digital'

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ [SOCKET-SERVER] MongoDB connected')
    console.log(`[SOCKET-SERVER] Database: ${mongoose.connection.name}`)
    console.log(`[SOCKET-SERVER] Host: ${mongoose.connection.host}`)
    console.log(`[SOCKET-SERVER] Connection ID: ${mongoose.connection.id}`)
  })
  .catch(err => console.error('❌ [SOCKET-SERVER] MongoDB connection error:', err))

const io = new SocketIOServer(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Turn timers tracking
const turnTimers = new Map<string, NodeJS.Timeout>()

// Helper: Check if a player is a bot
const isBot = (username: string): boolean => {
  return username.includes('Bot') ||
         username.includes('AI') ||
         username.includes('Algorithm') ||
         username.includes('CPU') ||
         username.startsWith('Bot (')
}

// Timer functions
const startTurnTimer = (gameCode: string, playerId: string, gameId: string) => {
  const timerKey = `${gameId}-${playerId}`

  // Clear existing timer if any
  clearTurnTimer(timerKey)

  const timerId = setTimeout(async () => {
    try {
      const game = await Game.findById(gameId)
      if (!game) return

      // Verify it's still this player's turn
      const currentPlayer = game.players[game.currentPlayer]
      if (currentPlayer.userId.toString() !== playerId) return

      console.log(`⏱️ Turn timeout for ${currentPlayer.username}, auto-playing income`)

      // Auto-play income (safest action)
      const result = await GameService.executeAction(gameId, playerId, 'income')

      io.to(`game-${gameCode}`).emit('turn-timeout', {
        playerId,
        autoAction: 'income',
        message: 'Temps écoulé - Income automatique'
      })

      io.to(`game-${gameCode}`).emit('action-executed', {
        game: result.game,
        action: result.action,
        needsResponse: false,
        canBeBlocked: false,
        canBeChallenged: false,
        blockingRoles: []
      })

      // Resolve action automatically
      const resolved = await GameService.resolveAction(gameId)
      io.to(`game-${gameCode}`).emit('action-resolved', { game: resolved })

    } catch (error) {
      console.error('Turn timer error:', error)
    }
  }, 30000) // 30 seconds

  turnTimers.set(timerKey, timerId)
}

const clearTurnTimer = (timerKey: string) => {
  const timerId = turnTimers.get(timerKey)
  if (timerId) {
    clearTimeout(timerId)
    turnTimers.delete(timerKey)
  }
}

// JWT Authentication middleware (inspired by socket.md)
io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    // Allow connection without token for now (can be enforced later)
    console.log('⚠️ No token provided, connecting as guest')
    socket.data.userId = null
    socket.data.username = 'Guest'
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    socket.data.userId = decoded.userId
    socket.data.username = decoded.username
    console.log(`✅ Authenticated user: ${decoded.username} (${decoded.userId})`)
    next()
  } catch (error: any) {
    // If token is invalid, allow connection as guest instead of rejecting
    console.warn(`⚠️ Invalid token, connecting as guest:`, error.message)
    socket.data.userId = null
    socket.data.username = 'Guest'
    next()
  }
})

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id, socket.data.username || 'Anonymous')

  // Store user's personal room
  if (socket.data.userId) {
    socket.join(`user-${socket.data.userId}`)
  }

  socket.on('disconnect', async () => {
    console.log('🔌 Client disconnected:', socket.id)

    if (!socket.data.userId) return

    const userId = socket.data.userId
    const username = socket.data.username || 'Unknown'

    // Find the player's active game
    const game = await Game.findOne({
      'players.userId': userId,
      phase: 'playing'
    })

    if (!game) return

    const player = game.players.find(p => p.userId.toString() === userId)
    if (!player) return

    // Mark as disconnected
    player.isConnected = false
    player.disconnectedAt = new Date()
    await game.save()

    // Notify other players
    io.to(`game-${game.code}`).emit('player-disconnected', {
      playerId: userId,
      playerName: player.username
    })

    console.log(`🔌 Player ${username} disconnected from game ${game.code}`)

    // Replace with bot after 60 seconds if still disconnected
    setTimeout(async () => {
      const freshGame = await Game.findById(game._id)
      if (!freshGame) return

      const freshPlayer = freshGame.players.find(p => p.userId.toString() === userId)
      if (freshPlayer && !freshPlayer.isConnected) {
        freshPlayer.username = `Bot (was ${freshPlayer.username})`
        await freshGame.save()

        io.to(`game-${freshGame.code}`).emit('player-replaced-by-bot', {
          playerId: userId,
          botName: freshPlayer.username
        })

        console.log(`🤖 Replaced ${username} with bot in game ${freshGame.code}`)
      }
    }, 60000) // 60 seconds
  })

  // Reconnect to game
  socket.on('reconnect-to-game', async (gameId: string) => {
    try {
      const game = await Game.findById(gameId)
      if (!game) {
        socket.emit('reconnect-error', { message: 'Partie non trouvée' })
        return
      }

      const player = game.players.find(p => p.userId.toString() === socket.data.userId)
      if (!player) {
        socket.emit('reconnect-error', { message: 'Vous n\'êtes pas dans cette partie' })
        return
      }

      // Mark as reconnected
      player.isConnected = true
      player.disconnectedAt = undefined
      await game.save()

      // Join the game room
      socket.join(`game-${game.code}`)

      // Send full game state
      socket.emit('game-state-sync', game)

      // Notify others
      io.to(`game-${game.code}`).emit('player-reconnected', {
        playerId: socket.data.userId,
        playerName: player.username
      })

      console.log(`✅ ${player.username} reconnected to game ${game.code}`)
    } catch (error) {
      console.error('Reconnect error:', error)
      socket.emit('reconnect-error', { message: 'Erreur lors de la reconnexion' })
    }
  })

  // ==================== LOBBY EVENTS ====================

  // Join game room
  socket.on('join-game', (gameCode) => {
    socket.join(`game-${gameCode}`)
    console.log(`✅ ${socket.data.username || socket.id} joined game ${gameCode}`)

    // Notify others in the room
    socket.to(`game-${gameCode}`).emit('player-joined', {
      socketId: socket.id,
      username: socket.data.username,
      userId: socket.data.userId
    })
  })

  // Leave game room
  socket.on('leave-game', (gameCode) => {
    socket.leave(`game-${gameCode}`)
    console.log(`👋 ${socket.data.username || socket.id} left game ${gameCode}`)

    // Notify others in the room
    socket.to(`game-${gameCode}`).emit('player-left', {
      socketId: socket.id,
      userId: socket.data.userId
    })
  })

  // Player ready toggle
  socket.on('player-ready', async (data) => {
    const { gameCode, isReady } = data

    // Get username from game if not in socket data
    let username = socket.data.username
    if (!username && gameCode) {
      try {
        const game = await Game.findOne({ code: gameCode })
        const player = game?.players.find(p => p.userId?.toString() === socket.data.userId)
        username = player?.username || 'Unknown'
      } catch (error) {
        username = 'Unknown'
      }
    }

    console.log(`🎮 Player ready changed: ${username} - ${isReady}`)

    io.to(`game-${gameCode}`).emit('player-ready-changed', {
      playerId: socket.data.userId,
      username: username,
      isReady
    })
  })

  // Start game
  socket.on('start-game', async (gameCode) => {
    console.log(`🚀 Game starting: ${gameCode}`)

    try {
      const game = await Game.findOne({ code: gameCode })
      if (!game) return

      io.to(`game-${gameCode}`).emit('game-started', {
        gameCode,
        timestamp: new Date()
      })

      // Start timer for first player if game is in playing phase
      if (game.phase === 'playing' && game.players.length > 0) {
        const firstPlayer = game.players[game.currentPlayer]
        if (firstPlayer) {
          startTurnTimer(gameCode, firstPlayer.userId.toString(), game._id.toString())
        }
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
  })

  // ==================== GAME ACTION EVENTS ====================

  // Execute action
  socket.on('execute-action', async (data) => {
    try {
      const { gameId, actionType, targetId, claimedRole } = data
      console.log(`🎯 Action executed: ${actionType} by ${socket.data.username}`)

      // Clear turn timer for this player
      clearTurnTimer(`${gameId}-${socket.data.userId}`)

      // Validation via GameService
      const result = await GameService.executeAction(
        gameId,
        socket.data.userId,
        actionType,
        targetId,
        claimedRole
      )

      // Récupérer le code de la partie pour le room
      const game = await Game.findById(gameId)

      if (!game) {
        socket.emit('action-error', { message: 'Partie non trouvée' })
        return
      }

      // Broadcast à tous les joueurs
      io.to(`game-${game.code}`).emit('action-executed', {
        game: result.game,
        action: result.action,
        needsResponse: result.needsResponse,
        canBeBlocked: result.canBeBlocked,
        canBeChallenged: result.canBeChallenged,
        blockingRoles: result.blockingRoles || []
      })

      // If action needs response, check if any bots should respond
      if (result.needsResponse) {
        for (const player of game.players) {
          // Skip the player who executed the action
          if (player.userId.toString() === socket.data.userId) continue

          // Check if this is a bot
          if (isBot(player.username)) {
            setTimeout(async () => {
              try {
                // Bot decides whether to challenge
                const shouldChallenge = await BotService.shouldBotChallenge(
                  gameId,
                  player.userId.toString(),
                  result.action
                )

                if (shouldChallenge) {
                  console.log(`🤖 Bot ${player.username} is challenging!`)

                  const challengeResult = await GameService.challengeAction(gameId, player.userId.toString())

                  io.to(`game-${game.code}`).emit('challenge-resolved', {
                    game: challengeResult,
                    challengeSuccess: challengeResult.challengeSuccess,
                    challengerId: player.userId.toString(),
                    challengerName: player.username,
                    revealedCard: challengeResult.revealedCard,
                    eliminatedPlayer: challengeResult.eliminatedPlayer
                  })
                } else {
                  // Bot accepts silently (auto-accept after all bots decide)
                  console.log(`🤖 Bot ${player.username} accepts the action`)
                }
              } catch (error) {
                console.error('❌ Bot response error:', error)
              }
            }, Math.random() * 2000 + 1000) // 1-3 seconds delay
          }
        }
      }
    } catch (error) {
      console.error('❌ Error executing action:', error)
      socket.emit('action-error', { message: error.message })
    }
  })

  // Challenge action
  socket.on('challenge-action', async (data) => {
    try {
      const { gameId, challengerId } = data
      console.log(`⚔️ Action challenged by ${socket.data.username}`)

      const result = await GameService.challengeAction(gameId, challengerId || socket.data.userId)
      const game = await Game.findById(gameId)

      if (!game) {
        socket.emit('action-error', { message: 'Partie non trouvée' })
        return
      }

      io.to(`game-${game.code}`).emit('challenge-resolved', {
        game: result,
        challengeSuccess: result.challengeSuccess,
        challengerId: challengerId || socket.data.userId,
        challengerName: socket.data.username,
        revealedCard: result.revealedCard,
        eliminatedPlayer: result.eliminatedPlayer
      })
    } catch (error) {
      console.error('❌ Error challenging action:', error)
      socket.emit('action-error', { message: error.message })
    }
  })

  // Block action
  socket.on('block-action', async (data) => {
    try {
      const { gameId, playerId, blockingRole } = data
      console.log(`🛡️ Action blocked by ${socket.data.username} with ${blockingRole}`)

      const result = await GameService.blockAction(
        gameId,
        playerId || socket.data.userId,
        blockingRole
      )
      const game = await Game.findById(gameId)

      if (!game) {
        socket.emit('action-error', { message: 'Partie non trouvée' })
        return
      }

      io.to(`game-${game.code}`).emit('block-declared', {
        game: result,
        blockerId: playerId || socket.data.userId,
        blockerName: socket.data.username,
        blockingRole
      })
    } catch (error) {
      console.error('❌ Error blocking action:', error)
      socket.emit('action-error', { message: error.message })
    }
  })

  // Accept action (pass)
  socket.on('accept-action', async (data) => {
    try {
      const { gameId } = data
      console.log(`✅ Action accepted by ${socket.data.username}`)

      // Résoudre l'action si tous les joueurs ont accepté
      const result = await GameService.resolveAction(gameId)
      const game = await Game.findById(gameId)

      if (!game) {
        socket.emit('action-error', { message: 'Partie non trouvée' })
        return
      }

      io.to(`game-${game.code}`).emit('action-resolved', {
        game: result
      })

      // Start timer for the next player
      const currentPlayer = result.players[result.currentPlayer]
      if (currentPlayer && result.phase === 'playing') {
        startTurnTimer(game.code, currentPlayer.userId.toString(), gameId)

        // If next player is a bot, make it play automatically after a delay
        if (isBot(currentPlayer.username)) {
          setTimeout(async () => {
            try {
              console.log(`🤖 Bot ${currentPlayer.username} is taking its turn...`)

              const botDecision = await BotService.executeBotTurn(gameId, currentPlayer.userId.toString())

              // Clear the bot's timer
              clearTurnTimer(`${gameId}-${currentPlayer.userId.toString()}`)

              // Emit the bot's action
              io.to(`game-${game.code}`).emit('action-executed', {
                game: botDecision.result.game,
                action: botDecision.result.action,
                needsResponse: botDecision.result.needsResponse,
                canBeBlocked: botDecision.result.canBeBlocked,
                canBeChallenged: botDecision.result.canBeChallenged,
                blockingRoles: botDecision.result.blockingRoles || []
              })
            } catch (error) {
              console.error('❌ Bot turn error:', error)
            }
          }, 1500) // 1.5 second delay to seem natural
        }
      }
    } catch (error) {
      console.error('❌ Error accepting action:', error)
      socket.emit('action-error', { message: error.message })
    }
  })

  // Action resolved
  socket.on('action-resolved', (data) => {
    const { gameCode, success, eliminatedPlayerId } = data
    console.log(`✔️ Action resolved: ${success ? 'Success' : 'Failed'}`)

    io.to(`game-${gameCode}`).emit('action-resolved', {
      success,
      eliminatedPlayerId,
      timestamp: new Date()
    })
  })

  // ==================== CARD EVENTS ====================

  // Card revealed (for challenge/block verification)
  socket.on('card-revealed', (data) => {
    const { gameCode, cardType, playerId } = data
    console.log(`🃏 Card revealed: ${cardType} by ${playerId}`)

    io.to(`game-${gameCode}`).emit('card-revealed', {
      playerId,
      cardType,
      timestamp: new Date()
    })
  })

  // Card lost (player eliminated or lost influence)
  socket.on('card-lost', (data) => {
    const { gameCode, playerId, cardType } = data
    console.log(`💀 Card lost: ${cardType} by ${playerId}`)

    io.to(`game-${gameCode}`).emit('card-lost', {
      playerId,
      cardType,
      timestamp: new Date()
    })
  })

  // ==================== GAME END EVENTS ====================

  // Game ended
  socket.on('game-ended', (data) => {
    const { gameCode, winnerId, winnerName } = data
    console.log(`🏆 Game ended: Winner is ${winnerName}`)

    io.to(`game-${gameCode}`).emit('game-ended', {
      winnerId,
      winnerName,
      timestamp: new Date()
    })
  })

  // ==================== CHAT EVENTS ====================

  // Chat message
  socket.on('chat-message', (data) => {
    const { gameCode, text } = data
    console.log(`💬 Chat [${gameCode}]: ${socket.data.username}: ${text}`)

    io.to(`game-${gameCode}`).emit('chat-message', {
      username: socket.data.username || 'Anonymous',
      userId: socket.data.userId,
      text,
      timestamp: new Date()
    })
  })

  // Typing indicator
  socket.on('typing-start', (data) => {
    const { gameCode } = data
    socket.to(`game-${gameCode}`).emit('user-typing', {
      username: socket.data.username,
      userId: socket.data.userId
    })
  })

  socket.on('typing-stop', (data) => {
    const { gameCode } = data
    socket.to(`game-${gameCode}`).emit('user-stopped-typing', {
      userId: socket.data.userId
    })
  })

  // ==================== ERROR HANDLING ====================

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error)
    socket.emit('error', { message: error.message })
  })
})

console.log(`📡 Socket.io server running on port ${PORT}`)
console.log(`🔗 WebSocket URL: ws://localhost:${PORT}`)
console.log(`🔐 JWT authentication: ${JWT_SECRET !== 'your-secret-key-change-in-production' ? 'Enabled' : 'Demo mode'}`)
