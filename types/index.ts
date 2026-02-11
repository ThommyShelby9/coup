import type { ObjectId } from 'mongoose'

export type CardType = 'Duke' | 'Assassin' | 'Captain' | 'Ambassador' | 'Contessa'

export type ActionType =
  | 'income'
  | 'foreign-aid'
  | 'coup'
  | 'tax'
  | 'assassinate'
  | 'steal'
  | 'exchange'
  | 'block'

export type GamePhase = 'lobby' | 'playing' | 'ended'

export interface User {
  _id: ObjectId
  username: string
  avatar: string
  stats: {
    gamesPlayed: number
    wins: number
    bluffsSuccessful: number
    contestationsWon: number
  }
  createdAt: Date
}

export interface Card {
  type: CardType
  id: string
}

export interface Player {
  userId: ObjectId
  username: string
  cards: Card[]
  coins: number
  isAlive: boolean
  position: number
  avatar: string
  isReady: boolean
  isConnected?: boolean
  disconnectedAt?: Date
}

export interface Action {
  playerId: ObjectId
  type: ActionType
  target?: ObjectId
  claimedRole?: CardType
  timestamp: Date
  contested: boolean
  resolved: boolean
}

export interface GameSettings {
  maxPlayers: number
  timePerTurn: number
  allowSpectators: boolean
}

export interface Game {
  _id: ObjectId
  code: string
  hostId: ObjectId
  players: Player[]
  deck: Card[]
  currentPlayer: number
  phase: GamePhase
  turn: number
  lastAction?: Action
  actionHistory: Action[]
  settings: GameSettings
  createdAt: Date
  updatedAt: Date
}

export interface ActionInput {
  gameId: string
  playerId: string
  type: ActionType
  target?: string
  claimedRole?: CardType
}

export interface ChallengeInput {
  gameId: string
  challengerId: string
  actionId: string
}

export interface SocketEvents {
  'join-game': (gameCode: string) => void
  'leave-game': (gameCode: string) => void
  'execute-action': (data: ActionInput) => void
  'challenge-action': (data: ChallengeInput) => void
  'block-action': (data: { gameId: string; playerId: string; blockingRole: CardType }) => void
  'player-ready': (data: { gameId: string; playerId: string }) => void
}

export interface SocketListeners {
  'game-state': (game: Game) => void
  'action-executed': (data: { game: Game; action: Action; needsResponse: boolean }) => void
  'challenge-result': (game: Game) => void
  'game-started': (game: Game) => void
  'game-ended': (data: { game: Game; winner: Player }) => void
  'player-joined': (player: Player) => void
  'player-left': (playerId: string) => void
  'action-error': (error: string) => void
}

export interface Position {
  x: number
  y: number
  z?: number
}
