import { Game } from '~/server/models/Game'
import { User } from '~/server/models/User'
import type { ActionType, CardType, Card } from '~/types'
import {
  getActionCost,
  canAffordAction,
  mustCoup,
  requiresRole,
  getRequiredRole,
  canBlockAction,
  getBlockingRoles
} from '~/server/utils/gameUtils'

export class GameService {
  /**
   * Démarre une partie - distribue les cartes
   */
  static async startGame(gameId: string) {
    const game = await Game.findById(gameId)

    if (!game) {
      throw new Error('Partie non trouvée')
    }

    if (game.phase !== 'lobby') {
      throw new Error('La partie a déjà commencé')
    }

    if (game.players.length < 2) {
      throw new Error('Il faut au moins 2 joueurs pour commencer')
    }

    // Vérifier que tous les joueurs sont prêts
    const allReady = game.players.every(p => p.isReady)
    if (!allReady) {
      throw new Error('Tous les joueurs doivent être prêts')
    }

    // Distribuer 2 cartes à chaque joueur
    game.players.forEach(player => {
      player.cards = [
        game.deck.pop()!,
        game.deck.pop()!
      ]
    })

    // Changer la phase et initialiser le tour
    game.phase = 'playing'
    game.currentPlayer = 0
    game.turn = 1

    await game.save()
    return game
  }

  /**
   * Exécute une action de joueur
   */
  static async executeAction(
    gameId: string,
    playerId: string,
    actionType: ActionType,
    targetId?: string,
    claimedRole?: CardType
  ) {
    const game = await Game.findById(gameId)

    if (!game) {
      throw new Error('Partie non trouvée')
    }

    if (game.phase !== 'playing') {
      throw new Error('La partie n\'est pas en cours')
    }

    // Vérifier que c'est le tour du joueur
    const currentPlayer = game.players[game.currentPlayer]
    if (currentPlayer.userId.toString() !== playerId) {
      throw new Error('Ce n\'est pas votre tour')
    }

    const player = game.players.find(p => p.userId.toString() === playerId)
    if (!player || !player.isAlive) {
      throw new Error('Joueur non trouvé ou éliminé')
    }

    // Vérifier si le joueur doit faire un coup (10+ pièces)
    if (mustCoup(player.coins) && actionType !== 'coup') {
      throw new Error('Vous devez faire un Coup (vous avez 10+ pièces)')
    }

    // Vérifier le coût de l'action
    const cost = getActionCost(actionType)
    if (!canAffordAction(player.coins, actionType)) {
      throw new Error(`Vous n'avez pas assez de pièces (coût: ${cost})`)
    }

    // Vérifier la cible si nécessaire
    if (['coup', 'assassinate', 'steal'].includes(actionType)) {
      if (!targetId) {
        throw new Error('Cette action nécessite une cible')
      }

      const target = game.players.find(p => p.userId.toString() === targetId)
      if (!target || !target.isAlive) {
        throw new Error('Cible invalide')
      }

      if (target.userId.toString() === playerId) {
        throw new Error('Vous ne pouvez pas vous cibler vous-même')
      }
    }

    // Reset skip count — the player acted in time
    player.skipCount = 0

    // Créer l'action
    const action = {
      playerId: player.userId,
      type: actionType,
      target: targetId ? game.players.find(p => p.userId.toString() === targetId)?.userId : undefined,
      claimedRole,
      timestamp: new Date(),
      contested: false,
      resolved: false
    }

    game.lastAction = action
    game.actionHistory.push(action)

    await game.save()

    // Retourner si l'action peut être contestée/bloquée
    const needsResponse = requiresRole(actionType) || canBlockAction(actionType)

    // Si l'action ne nécessite pas de réponse, la résoudre automatiquement
    if (!needsResponse) {
      console.log(`✅ Action "${actionType}" ne nécessite pas de réponse, résolution automatique...`)
      await this.resolveAction(gameId)
      const updatedGame = await Game.findById(gameId)

      return {
        game: updatedGame,
        action,
        needsResponse: false,
        canBeBlocked: false,
        canBeChallenged: false,
        blockingRoles: []
      }
    }

    return {
      game,
      action,
      needsResponse,
      canBeBlocked: canBlockAction(actionType),
      canBeChallenged: requiresRole(actionType),
      blockingRoles: canBlockAction(actionType) ? getBlockingRoles(actionType) : []
    }
  }

  /**
   * Résout une action (après que personne ne l'a contestée/bloquée)
   */
  static async resolveAction(gameId: string) {
    const game = await Game.findById(gameId)

    if (!game || !game.lastAction) {
      throw new Error('Aucune action en attente')
    }

    const action = game.lastAction
    const player = game.players.find(p => p.userId.toString() === action.playerId.toString())

    if (!player) {
      throw new Error('Joueur non trouvé')
    }

    // Appliquer l'effet de l'action
    this.applyActionEffect(game, action, player)

    // Marquer l'action comme résolue
    action.resolved = true

    // Passer au joueur suivant
    this.nextTurn(game)

    // Mettre à jour les stats si la partie est terminée
    if (game.phase === 'ended') {
      await this.updateEndGameStats(game)
    }

    await game.save()
    return game
  }

  /**
   * Conteste une action
   */
  static async challengeAction(gameId: string, challengerId: string) {
    const game = await Game.findById(gameId)

    if (!game || !game.lastAction) {
      throw new Error('Aucune action à contester')
    }

    const action = game.lastAction
    const player = game.players.find(p => p.userId.toString() === action.playerId.toString())
    const challenger = game.players.find(p => p.userId.toString() === challengerId)

    if (!player || !challenger) {
      throw new Error('Joueur non trouvé')
    }

    if (!action.claimedRole) {
      throw new Error('Cette action ne peut pas être contestée')
    }

    action.contested = true

    // Vérifier si le joueur a vraiment le rôle
    const hasRole = player.cards.some(card => card.type === action.claimedRole)

    let revealedCard = null
    let challengeSuccess = false
    let eliminatedPlayer = null

    if (hasRole) {
      // Le challenge a échoué - le joueur avait bien le rôle
      challengeSuccess = false
      eliminatedPlayer = challengerId

      // Le challenger perd une carte
      this.removeCard(game, challengerId)

      // Le joueur révèle sa carte, la remet dans le deck et en pioche une nouvelle
      const cardIndex = player.cards.findIndex(c => c.type === action.claimedRole)
      const cardData = player.cards[cardIndex]
      revealedCard = { type: cardData.type, id: cardData.id }
      player.cards.splice(cardIndex, 1)

      // Remettre la carte révélée dans le deck et mélanger
      game.deck.push({ type: revealedCard.type, id: revealedCard.id })
      game.deck = this.shuffleDeck(game.deck)

      // Piocher une nouvelle carte
      if (game.deck.length > 0) {
        player.cards.push(game.deck.pop()!)
      }

      // L'action continue - résoudre inline (pas de re-fetch)
      this.applyActionEffect(game, action, player)
      action.resolved = true
      this.nextTurn(game)
    } else {
      // Le challenge a réussi - le joueur bluffait
      challengeSuccess = true
      eliminatedPlayer = action.playerId.toString()

      // Le bluffeur perd une carte
      this.removeCard(game, action.playerId.toString())

      // L'action est annulée, passer au tour suivant
      action.resolved = true
      this.nextTurn(game)
    }

    await game.save()

    return {
      ...game.toObject(),
      revealedCard,
      challengeSuccess,
      eliminatedPlayer
    }
  }

  /**
   * Applique l'effet d'une action (sans save ni nextTurn)
   */
  static applyActionEffect(game: any, action: any, player: any) {
    switch (action.type) {
      case 'income':
        player.coins += 1
        break

      case 'foreign-aid':
        player.coins += 2
        break

      case 'tax':
        player.coins += 3
        break

      case 'coup':
        if (action.target) {
          player.coins -= 7
          this.removeCard(game, action.target.toString())
        }
        break

      case 'assassinate':
        if (action.target) {
          player.coins -= 3
          this.removeCard(game, action.target.toString())
        }
        break

      case 'steal':
        if (action.target) {
          const target = game.players.find((p: any) => p.userId.toString() === action.target?.toString())
          if (target) {
            const stolen = Math.min(2, target.coins)
            target.coins -= stolen
            player.coins += stolen
          }
        }
        break

      case 'exchange':
        if (game.deck.length >= 2) {
          const drawnCards = [game.deck.pop()!, game.deck.pop()!]
          game.deck.push(...player.cards)
          player.cards = drawnCards
          game.deck = this.shuffleDeck(game.deck)
        }
        break
    }
  }

  /**
   * Retire une carte d'un joueur (inline, sans save)
   */
  static removeCard(game: any, playerId: string) {
    const player = game.players.find((p: any) => p.userId.toString() === playerId)

    if (!player || player.cards.length === 0) {
      return
    }

    player.cards.shift()

    if (player.cards.length === 0) {
      player.isAlive = false

      const alivePlayers = game.players.filter((p: any) => p.isAlive)
      if (alivePlayers.length === 1) {
        game.phase = 'ended'
      }
    }
  }

  /**
   * Bloque une action
   */
  static async blockAction(
    gameId: string,
    blockerId: string,
    blockingRole: CardType
  ) {
    const game = await Game.findById(gameId)

    if (!game || !game.lastAction) {
      throw new Error('Aucune action à bloquer')
    }

    const action = game.lastAction
    const blocker = game.players.find(p => p.userId.toString() === blockerId)

    if (!blocker) {
      throw new Error('Joueur non trouvé')
    }

    // Vérifier que le rôle peut bloquer cette action
    const allowedRoles = getBlockingRoles(action.type)
    if (!allowedRoles.includes(blockingRole)) {
      throw new Error('Ce rôle ne peut pas bloquer cette action')
    }

    // Créer une action de blocage
    const blockAction = {
      playerId: blocker.userId,
      type: 'block' as ActionType,
      claimedRole: blockingRole,
      timestamp: new Date(),
      contested: false,
      resolved: false
    }

    game.actionHistory.push(blockAction)

    // L'action originale est bloquée
    action.resolved = true

    // Passer au tour suivant (le bloqueur peut être contesté aussi)
    // Pour simplifier, on résout directement
    this.nextTurn(game)

    await game.save()
    return game
  }

  /**
   * Élimine une carte d'un joueur (legacy - utilise removeCard)
   */
  static async eliminateCard(game: any, playerId: string, chooseCard: boolean = false) {
    this.removeCard(game, playerId)

    // Mettre à jour les stats si la partie est terminée
    if (game.phase === 'ended') {
      await this.updateEndGameStats(game)
    }
  }

  /**
   * Met à jour les stats de fin de partie
   */
  static async updateEndGameStats(game: any) {
    const alivePlayers = game.players.filter((p: any) => p.isAlive)
    if (alivePlayers.length !== 1) return

    const winner = alivePlayers[0]
    try {
      await User.findByIdAndUpdate(winner.userId, {
        $inc: { 'stats.gamesPlayed': 1, 'stats.wins': 1 }
      })

      for (const p of game.players) {
        if (p.userId.toString() !== winner.userId.toString()) {
          await User.findByIdAndUpdate(p.userId, {
            $inc: { 'stats.gamesPlayed': 1 }
          })
        }
      }
    } catch (err) {
      console.error('[STATS] Error updating end game stats:', err)
    }
  }

  /**
   * Skip the current player's turn (called by TurnTimer on timeout)
   * Increments skipCount; eliminates the player after 3 skips.
   */
  static async skipTurn(gameId: string) {
    const game = await Game.findById(gameId)

    if (!game || game.phase !== 'playing') {
      throw new Error('Partie non trouvée ou non en cours')
    }

    const player = game.players[game.currentPlayer]
    if (!player || !player.isAlive) {
      // Player already dead — just advance
      this.nextTurn(game)
      await game.save()
      return game
    }

    // Increment skip count
    player.skipCount = (player.skipCount || 0) + 1

    // Record the skip in action history
    const skipAction = {
      playerId: player.userId,
      type: 'skip' as const,
      timestamp: new Date(),
      contested: false,
      resolved: true
    }
    game.actionHistory.push(skipAction)

    // Eliminate after 3 consecutive skips
    if (player.skipCount >= 3) {
      // Remove all cards
      player.cards = []
      player.isAlive = false

      const alivePlayers = game.players.filter((p: any) => p.isAlive)
      if (alivePlayers.length <= 1) {
        game.phase = 'ended'
        await this.updateEndGameStats(game)
      }
    }

    // Advance to next turn
    if (game.phase === 'playing') {
      this.nextTurn(game)
    }

    await game.save()
    return game
  }

  /**
   * Passe au tour suivant
   */
  static nextTurn(game: any) {
    do {
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length
    } while (!game.players[game.currentPlayer].isAlive && game.phase === 'playing')

    game.turn++
  }

  /**
   * Mélange un deck
   */
  static shuffleDeck<T>(deck: T[]): T[] {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
