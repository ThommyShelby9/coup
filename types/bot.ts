import type { ActionType, CardType, Card } from './index'

export type BotDifficulty = 'easy' | 'medium' | 'hard'
export type BotPersonality = 'aggressive' | 'defensive' | 'balanced' | 'bluffer'

export interface BotConfig {
  difficulty: BotDifficulty
  personality: BotPersonality
  bluffFrequency: number // 0-1
  challengeThreshold: number // 0-1
  blockThreshold: number // 0-1
  aggressiveness: number // 0-1
}

export interface BotMemory {
  revealedCards: Map<string, CardType[]> // playerId -> revealed cards
  playerActions: Map<string, ActionType[]> // playerId -> action history
  successfulBluffs: Map<string, number> // playerId -> bluff count
  failedBluffs: Map<string, number> // playerId -> failed bluff count
}

export interface GameState {
  myCards: Card[]
  myCoins: number
  players: {
    id: string
    username: string
    coins: number
    cardCount: number
    isAlive: boolean
  }[]
  deckCount: number
  lastAction?: {
    playerId: string
    type: ActionType
    claimedRole?: CardType
    target?: string
  }
}

export interface ActionDecision {
  type: ActionType
  targetId?: string
  claimedRole?: CardType
  confidence: number // 0-1
  reasoning?: string
}

export interface ChallengeDecision {
  shouldChallenge: boolean
  confidence: number
  reasoning?: string
}

export interface BlockDecision {
  shouldBlock: boolean
  blockingRole?: CardType
  confidence: number
  reasoning?: string
}
