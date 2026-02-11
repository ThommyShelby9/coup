import mongoose, { Schema, Document } from 'mongoose'
import type { Game as IGame, Card, Player, Action, GameSettings } from '~/types'

export interface GameDocument extends Omit<IGame, '_id'>, Document {}

const cardSchema = new Schema<Card>(
  {
    type: {
      type: String,
      enum: ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'],
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

const playerSchema = new Schema<Player>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    cards: [cardSchema],
    coins: {
      type: Number,
      default: 2
    },
    isAlive: {
      type: Boolean,
      default: true
    },
    position: {
      type: Number,
      required: true
    },
    avatar: {
      type: String,
      default: 'default-avatar.png'
    },
    isReady: {
      type: Boolean,
      default: false
    },
    isConnected: {
      type: Boolean,
      default: true
    },
    disconnectedAt: {
      type: Date
    }
  },
  { _id: false }
)

const actionSchema = new Schema<Action>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    type: {
      type: String,
      enum: ['income', 'foreign-aid', 'coup', 'tax', 'assassinate', 'steal', 'exchange', 'block'],
      required: true
    },
    target: {
      type: Schema.Types.ObjectId
    },
    claimedRole: {
      type: String,
      enum: ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    contested: {
      type: Boolean,
      default: false
    },
    resolved: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
)

const gameSettingsSchema = new Schema<GameSettings>(
  {
    maxPlayers: {
      type: Number,
      default: 6,
      min: 2,
      max: 6
    },
    timePerTurn: {
      type: Number,
      default: 30
    },
    allowSpectators: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
)

const gameSchema = new Schema<GameDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 6
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    players: [playerSchema],
    deck: [cardSchema],
    currentPlayer: {
      type: Number,
      default: 0
    },
    phase: {
      type: String,
      enum: ['lobby', 'playing', 'ended'],
      default: 'lobby'
    },
    turn: {
      type: Number,
      default: 0
    },
    lastAction: actionSchema,
    actionHistory: [actionSchema],
    settings: {
      type: gameSettingsSchema,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

// L'index sur code est déjà créé par l'option unique: true
// Index sur phase pour rechercher les parties actives
gameSchema.index({ phase: 1 })

export const Game = mongoose.models.Game || mongoose.model<GameDocument>('Game', gameSchema)
