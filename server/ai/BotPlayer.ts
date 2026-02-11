import type {
  BotDifficulty,
  BotPersonality,
  BotConfig,
  BotMemory,
  GameState,
  ActionDecision,
  ChallengeDecision,
  BlockDecision
} from '~/types/bot'
import type { ActionType, CardType, Card } from '~/types'

export class BotPlayer {
  private config: BotConfig
  private memory: BotMemory

  constructor(difficulty: BotDifficulty = 'medium', personality: BotPersonality = 'balanced') {
    this.config = this.createConfig(difficulty, personality)
    this.memory = {
      revealedCards: new Map(),
      playerActions: new Map(),
      successfulBluffs: new Map(),
      failedBluffs: new Map()
    }
  }

  /**
   * Crée la configuration du bot selon la difficulté et personnalité
   */
  private createConfig(difficulty: BotDifficulty, personality: BotPersonality): BotConfig {
    const baseConfig = {
      easy: {
        bluffFrequency: 0.1,
        challengeThreshold: 0.8,
        blockThreshold: 0.8,
        aggressiveness: 0.3
      },
      medium: {
        bluffFrequency: 0.3,
        challengeThreshold: 0.6,
        blockThreshold: 0.6,
        aggressiveness: 0.5
      },
      hard: {
        bluffFrequency: 0.5,
        challengeThreshold: 0.4,
        blockThreshold: 0.4,
        aggressiveness: 0.7
      }
    }[difficulty]

    const personalityModifiers = {
      aggressive: { aggressiveness: 0.9, bluffFrequency: 0.6 },
      defensive: { aggressiveness: 0.2, challengeThreshold: 0.7 },
      balanced: {},
      bluffer: { bluffFrequency: 0.8, challengeThreshold: 0.3 }
    }[personality]

    return {
      difficulty,
      personality,
      ...baseConfig,
      ...personalityModifiers
    }
  }

  /**
   * Décide quelle action jouer
   */
  async decideAction(gameState: GameState): Promise<ActionDecision> {
    const { myCards, myCoins, players } = gameState

    // Obligatoire : Coup si 10+ pièces
    if (myCoins >= 10) {
      const target = this.selectCoupTarget(players)
      return {
        type: 'coup',
        targetId: target.id,
        confidence: 1.0,
        reasoning: 'Forced coup with 10+ coins'
      }
    }

    // Stratégie aggressive : Coup si 7+ pièces
    if (myCoins >= 7 && Math.random() < this.config.aggressiveness) {
      const target = this.selectCoupTarget(players)
      return {
        type: 'coup',
        targetId: target.id,
        confidence: 0.8,
        reasoning: 'Aggressive coup'
      }
    }

    // Assassinate si on a Assassin et 3+ pièces
    if (myCoins >= 3 && this.hasCard(myCards, 'Assassin')) {
      if (Math.random() < 0.7) {
        const target = this.selectAssassinateTarget(players)
        return {
          type: 'assassinate',
          targetId: target.id,
          claimedRole: 'Assassin',
          confidence: 0.9,
          reasoning: 'Have Assassin card'
        }
      }
    }

    // Bluff Assassinate
    if (myCoins >= 3 && Math.random() < this.config.bluffFrequency * 0.5) {
      const target = this.selectAssassinateTarget(players)
      return {
        type: 'assassinate',
        targetId: target.id,
        claimedRole: 'Assassin',
        confidence: 0.4,
        reasoning: 'Bluffing Assassin'
      }
    }

    // Tax si on a Duke
    if (this.hasCard(myCards, 'Duke')) {
      return {
        type: 'tax',
        claimedRole: 'Duke',
        confidence: 0.95,
        reasoning: 'Have Duke card'
      }
    }

    // Bluff Tax
    if (Math.random() < this.config.bluffFrequency) {
      return {
        type: 'tax',
        claimedRole: 'Duke',
        confidence: 0.5,
        reasoning: 'Bluffing Duke for tax'
      }
    }

    // Steal si on a Captain
    if (this.hasCard(myCards, 'Captain')) {
      const target = this.selectStealTarget(players)
      if (target) {
        return {
          type: 'steal',
          targetId: target.id,
          claimedRole: 'Captain',
          confidence: 0.9,
          reasoning: 'Have Captain card'
        }
      }
    }

    // Bluff Steal
    if (Math.random() < this.config.bluffFrequency * 0.7) {
      const target = this.selectStealTarget(players)
      if (target) {
        return {
          type: 'steal',
          targetId: target.id,
          claimedRole: 'Captain',
          confidence: 0.5,
          reasoning: 'Bluffing Captain for steal'
        }
      }
    }

    // Exchange si on a Ambassador
    if (this.hasCard(myCards, 'Ambassador')) {
      if (Math.random() < 0.6) {
        return {
          type: 'exchange',
          claimedRole: 'Ambassador',
          confidence: 0.85,
          reasoning: 'Have Ambassador card'
        }
      }
    }

    // Foreign Aid (sûr, peut être bloqué)
    if (Math.random() < 0.6) {
      return {
        type: 'foreign-aid',
        confidence: 0.7,
        reasoning: 'Safe +2 coins action'
      }
    }

    // Income (toujours sûr)
    return {
      type: 'income',
      confidence: 1.0,
      reasoning: 'Safe +1 coin action'
    }
  }

  /**
   * Décide si challenger une action
   */
  async shouldChallenge(
    gameState: GameState,
    action: { playerId: string; type: ActionType; claimedRole?: CardType }
  ): Promise<ChallengeDecision> {
    if (!action.claimedRole) {
      return { shouldChallenge: false, confidence: 0, reasoning: 'No role claimed' }
    }

    // Calculer la probabilité que le joueur ait la carte
    const probability = this.calculateCardProbability(
      action.playerId,
      action.claimedRole,
      gameState
    )

    // Analyser l'historique du joueur
    const playerHistory = this.memory.playerActions.get(action.playerId) || []
    const sameRoleCount = playerHistory.filter(
      a => a === action.type
    ).length

    // Si le joueur a utilisé ce rôle plusieurs fois, plus probable qu'il l'ait
    const historyBonus = Math.min(sameRoleCount * 0.1, 0.3)
    const adjustedProbability = Math.min(probability + historyBonus, 1.0)

    // Décision basée sur le seuil de difficulté
    const shouldChallenge = adjustedProbability < this.config.challengeThreshold

    // Ajouter du random pour ne pas être trop prévisible
    const randomFactor = Math.random()
    const finalDecision = shouldChallenge && randomFactor > 0.3

    return {
      shouldChallenge: finalDecision,
      confidence: finalDecision ? (1 - adjustedProbability) : adjustedProbability,
      reasoning: finalDecision
        ? `Low probability (${(adjustedProbability * 100).toFixed(0)}%) of having ${action.claimedRole}`
        : `Likely has ${action.claimedRole}`
    }
  }

  /**
   * Décide si bloquer une action
   */
  async shouldBlock(
    gameState: GameState,
    action: { playerId: string; type: ActionType; targetId?: string }
  ): Promise<BlockDecision> {
    const { myCards } = gameState

    // Déterminer les rôles qui peuvent bloquer
    const blockingRoles = this.getBlockingRoles(action.type)
    if (blockingRoles.length === 0) {
      return { shouldBlock: false, confidence: 0, reasoning: 'Action cannot be blocked' }
    }

    // Vérifier si on est la cible (plus de raison de bloquer)
    const isTarget = action.targetId === 'me' // Note: adapter selon l'implémentation

    // Si on a une carte qui peut bloquer
    const canBlockWith = blockingRoles.find(role => this.hasCard(myCards, role))
    if (canBlockWith) {
      const shouldBlock = isTarget
        ? Math.random() < 0.9 // 90% de bloquer si on est ciblé et on a la carte
        : Math.random() < 0.4 // 40% de bloquer si on n'est pas ciblé

      if (shouldBlock) {
        return {
          shouldBlock: true,
          blockingRole: canBlockWith,
          confidence: 0.95,
          reasoning: `Have ${canBlockWith} to block`
        }
      }
    }

    // Bluff de blocage
    if (isTarget && Math.random() < this.config.bluffFrequency) {
      const bluffRole = blockingRoles[Math.floor(Math.random() * blockingRoles.length)]
      return {
        shouldBlock: true,
        blockingRole: bluffRole,
        confidence: 0.4,
        reasoning: `Bluffing ${bluffRole} to block`
      }
    }

    return {
      shouldBlock: false,
      confidence: 0.6,
      reasoning: 'Not blocking'
    }
  }

  /**
   * Met à jour la mémoire avec une carte révélée
   */
  recordRevealedCard(playerId: string, card: CardType) {
    if (!this.memory.revealedCards.has(playerId)) {
      this.memory.revealedCards.set(playerId, [])
    }
    this.memory.revealedCards.get(playerId)!.push(card)
  }

  /**
   * Met à jour la mémoire avec une action
   */
  recordAction(playerId: string, action: ActionType) {
    if (!this.memory.playerActions.has(playerId)) {
      this.memory.playerActions.set(playerId, [])
    }
    this.memory.playerActions.get(playerId)!.push(action)
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private hasCard(cards: Card[], type: CardType): boolean {
    return cards.some(card => card.type === type)
  }

  private selectCoupTarget(players: GameState['players']) {
    // Cibler le joueur le plus dangereux (le plus de pièces ou de cartes)
    const alivePlayers = players.filter(p => p.isAlive)
    return alivePlayers.reduce((strongest, p) =>
      p.coins + p.cardCount * 3 > strongest.coins + strongest.cardCount * 3 ? p : strongest
    )
  }

  private selectAssassinateTarget(players: GameState['players']) {
    // Cibler un joueur fort mais pas le plus fort (économiser 4 pièces vs Coup)
    const alivePlayers = players.filter(p => p.isAlive)
    const sorted = alivePlayers.sort((a, b) => b.coins - a.coins)
    return sorted[Math.min(1, sorted.length - 1)] || sorted[0]
  }

  private selectStealTarget(players: GameState['players']) {
    // Cibler le joueur avec le plus de pièces (mais au moins 1)
    const richPlayers = players.filter(p => p.isAlive && p.coins > 0)
    if (richPlayers.length === 0) return null
    return richPlayers.reduce((richest, p) => (p.coins > richest.coins ? p : richest))
  }

  /**
   * Calcule la probabilité qu'un joueur ait une carte spécifique
   */
  private calculateCardProbability(
    playerId: string,
    cardType: CardType,
    gameState: GameState
  ): number {
    // Nombre total de chaque type de carte dans le jeu (3 de chaque)
    const totalCardsOfType = 3

    // Cartes révélées de ce type
    let revealedOfType = 0
    this.memory.revealedCards.forEach(cards => {
      revealedOfType += cards.filter(c => c === cardType).length
    })

    // Mes propres cartes de ce type
    const myCardsOfType = gameState.myCards.filter(c => c.type === cardType).length

    // Cartes disponibles de ce type
    const availableOfType = totalCardsOfType - revealedOfType - myCardsOfType

    if (availableOfType <= 0) {
      return 0 // Aucune carte disponible
    }

    // Nombre de cartes que le joueur pourrait avoir
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return 0.5

    const playerCardCount = player.cardCount

    // Probabilité = (cartes disponibles de ce type) / (total cartes dans le deck et chez les joueurs)
    // Simplification : si 1 carte disponible et joueur a 2 cartes, ~50% de chance
    const probability = Math.min(
      (availableOfType / playerCardCount) * 0.5,
      1.0
    )

    return probability
  }

  /**
   * Retourne les rôles qui peuvent bloquer une action
   */
  private getBlockingRoles(actionType: ActionType): CardType[] {
    const blockingMap: Record<string, CardType[]> = {
      'foreign-aid': ['Duke'],
      'assassinate': ['Contessa'],
      'steal': ['Captain', 'Ambassador']
    }
    return blockingMap[actionType] || []
  }
}
