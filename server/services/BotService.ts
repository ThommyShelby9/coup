import { Game } from '~/server/models/Game'
import { User } from '~/server/models/User'
import { BotPlayer } from '~/server/ai/BotPlayer'
import type { BotDifficulty, BotPersonality, GameState } from '~/types/bot'
import type { Player } from '~/types'
import { Types } from 'mongoose'

// Noms de bots générés aléatoirement
const BOT_NAMES = [
  'Duke Bot',
  'Assassin AI',
  'Captain Code',
  'Ambassador Algorithm',
  'Contessa CPU',
  'Bluff Master',
  'Strategic Steve',
  'Tactical Tina',
  'Clever Claude',
  'Sneaky Sarah',
  'Bold Boris',
  'Cautious Carl',
  'Lucky Lucy',
  'Brave Bob',
  'Cunning Chloe',
  'Royal Raymond',
  'Noble Nancy',
  'Sly Sam',
  'Wise William',
  'Fearless Fiona'
]

const USED_NAMES = new Set<string>()

export class BotService {
  /**
   * Génère un nom de bot unique
   */
  static generateBotName(): string {
    const availableNames = BOT_NAMES.filter(name => !USED_NAMES.has(name))

    if (availableNames.length === 0) {
      // Si tous les noms sont utilisés, générer un nom avec un numéro
      const randomName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]
      const number = Math.floor(Math.random() * 1000)
      return `${randomName} ${number}`
    }

    const name = availableNames[Math.floor(Math.random() * availableNames.length)]
    USED_NAMES.add(name)
    return name
  }

  /**
   * Libère un nom de bot
   */
  static releaseBotName(name: string) {
    USED_NAMES.delete(name)
  }

  /**
   * Ajoute un bot à une partie
   */
  static async addBot(
    gameId: string,
    difficulty: BotDifficulty = 'medium',
    personality?: BotPersonality
  ) {
    const game = await Game.findById(gameId)

    if (!game) {
      throw new Error('Partie non trouvée')
    }

    if (game.phase !== 'lobby') {
      throw new Error('Impossible d\'ajouter un bot après le démarrage')
    }

    if (game.players.length >= game.settings.maxPlayers) {
      throw new Error('La partie est pleine')
    }

    // Générer un nom et une personnalité
    const botName = this.generateBotName()
    const botPersonality = personality || this.randomPersonality()

    // Créer un "utilisateur" bot (fictif, juste pour l'ID)
    const botUser = new User({
      username: botName,
      password: 'bot-no-login',
      avatar: this.getBotAvatar(difficulty),
      stats: {
        gamesPlayed: 0,
        wins: 0,
        bluffsSuccessful: 0,
        contestationsWon: 0
      }
    })

    await botUser.save()

    // Ajouter le bot à la partie
    const botPlayer: Player = {
      userId: botUser._id,
      username: botName,
      cards: [],
      coins: 2,
      isAlive: true,
      position: game.players.length,
      avatar: botUser.avatar,
      isReady: true // Les bots sont toujours prêts
    }

    game.players.push(botPlayer)
    await game.save()

    // Créer l'instance BotPlayer
    const botInstance = new BotPlayer(difficulty, botPersonality)

    // Stocker les métadonnées du bot
    await this.storeBotMetadata(botUser._id.toString(), {
      difficulty,
      personality: botPersonality,
      gameId: game._id.toString()
    })

    return {
      botId: botUser._id.toString(),
      botName,
      difficulty,
      personality: botPersonality,
      game
    }
  }

  /**
   * Retire un bot d'une partie
   */
  static async removeBot(gameId: string, botId: string) {
    const game = await Game.findById(gameId)

    if (!game) {
      throw new Error('Partie non trouvée')
    }

    const botPlayer = game.players.find(p => p.userId.toString() === botId)
    if (!botPlayer) {
      throw new Error('Bot non trouvé')
    }

    // Retirer le bot
    game.players = game.players.filter(p => p.userId.toString() !== botId)

    // Réajuster les positions
    game.players.forEach((p, index) => {
      p.position = index
    })

    await game.save()

    // Supprimer l'utilisateur bot
    await User.findByIdAndDelete(botId)

    // Libérer le nom
    this.releaseBotName(botPlayer.username)

    // Supprimer les métadonnées
    await this.deleteBotMetadata(botId)

    return game
  }

  /**
   * Exécute le tour d'un bot
   */
  static async executeBotTurn(gameId: string, botId: string) {
    const game = await Game.findById(gameId)

    if (!game) {
      throw new Error('Partie non trouvée')
    }

    const botPlayer = game.players.find(p => p.userId.toString() === botId)
    if (!botPlayer) {
      throw new Error('Bot non trouvé')
    }

    // Récupérer les métadonnées du bot
    const metadata = await this.getBotMetadata(botId)
    if (!metadata) {
      throw new Error('Métadonnées du bot non trouvées')
    }

    // Créer l'instance BotPlayer
    const bot = new BotPlayer(metadata.difficulty, metadata.personality)

    // Construire l'état du jeu pour le bot
    const gameState = this.buildGameState(game, botId)

    // Le bot décide de son action
    const decision = await bot.decideAction(gameState)

    console.log(`🤖 Bot ${botPlayer.username} decision:`, decision)

    // Importer GameService pour exécuter l'action
    const { GameService } = await import('./GameService')

    // Exécuter l'action
    const result = await GameService.executeAction(
      gameId,
      botId,
      decision.type,
      decision.targetId,
      decision.claimedRole
    )

    return {
      decision,
      result
    }
  }

  /**
   * Décide si le bot doit challenger une action
   */
  static async shouldBotChallenge(
    gameId: string,
    botId: string,
    action: { playerId: string; type: string; claimedRole?: string }
  ): Promise<boolean> {
    const game = await Game.findById(gameId)
    if (!game) return false

    const metadata = await this.getBotMetadata(botId)
    if (!metadata) return false

    const bot = new BotPlayer(metadata.difficulty, metadata.personality)
    const gameState = this.buildGameState(game, botId)

    const decision = await bot.shouldChallenge(gameState, action as any)

    console.log(`🤖 Bot challenge decision:`, decision)

    return decision.shouldChallenge
  }

  /**
   * Décide si le bot doit bloquer une action
   */
  static async shouldBotBlock(
    gameId: string,
    botId: string,
    action: { playerId: string; type: string; targetId?: string }
  ): Promise<{ shouldBlock: boolean; blockingRole?: string }> {
    const game = await Game.findById(gameId)
    if (!game) return { shouldBlock: false }

    const metadata = await this.getBotMetadata(botId)
    if (!metadata) return { shouldBlock: false }

    const bot = new BotPlayer(metadata.difficulty, metadata.personality)
    const gameState = this.buildGameState(game, botId)

    const decision = await bot.shouldBlock(gameState, action as any)

    console.log(`🤖 Bot block decision:`, decision)

    return {
      shouldBlock: decision.shouldBlock,
      blockingRole: decision.blockingRole
    }
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private static randomPersonality(): BotPersonality {
    const personalities: BotPersonality[] = ['aggressive', 'defensive', 'balanced', 'bluffer']
    return personalities[Math.floor(Math.random() * personalities.length)]
  }

  private static getBotAvatar(difficulty: BotDifficulty): string {
    const avatars = {
      easy: 'bot-easy.png',
      medium: 'bot-medium.png',
      hard: 'bot-hard.png'
    }
    return avatars[difficulty]
  }

  /**
   * Construit l'état du jeu pour le bot
   */
  private static buildGameState(game: any, botId: string): GameState {
    const botPlayer = game.players.find((p: any) => p.userId.toString() === botId)

    return {
      myCards: botPlayer?.cards || [],
      myCoins: botPlayer?.coins || 0,
      players: game.players
        .filter((p: any) => p.userId.toString() !== botId)
        .map((p: any) => ({
          id: p.userId.toString(),
          username: p.username,
          coins: p.coins,
          cardCount: p.cards.length,
          isAlive: p.isAlive
        })),
      deckCount: game.deck.length,
      lastAction: game.lastAction
        ? {
            playerId: game.lastAction.playerId.toString(),
            type: game.lastAction.type,
            claimedRole: game.lastAction.claimedRole,
            target: game.lastAction.target?.toString()
          }
        : undefined
    }
  }

  /**
   * Stocke les métadonnées d'un bot (en mémoire pour simplifier)
   */
  private static botMetadata = new Map<string, any>()

  private static async storeBotMetadata(botId: string, metadata: any) {
    this.botMetadata.set(botId, metadata)
  }

  private static async getBotMetadata(botId: string) {
    return this.botMetadata.get(botId)
  }

  private static async deleteBotMetadata(botId: string) {
    this.botMetadata.delete(botId)
  }
}
