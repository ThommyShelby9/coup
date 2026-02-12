import { Schema, model, Document, Types } from 'mongoose'
import type { BotDifficulty, BotPersonality } from '~/types/bot'

export interface IBotMetadata extends Document {
  _id: Types.ObjectId
  botId: Types.ObjectId // ID de l'utilisateur bot
  gameId: Types.ObjectId // ID de la partie
  difficulty: BotDifficulty
  personality: BotPersonality
  createdAt: Date
  updatedAt: Date
}

const botMetadataSchema = new Schema<IBotMetadata>(
  {
    botId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      unique: true // Un bot ne peut avoir qu'une seule entrée de métadonnées
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      default: 'medium'
    },
    personality: {
      type: String,
      enum: ['aggressive', 'defensive', 'balanced', 'bluffer'],
      required: true,
      default: 'balanced'
    }
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    collection: 'bot_metadata'
  }
)

// Index composé pour rechercher rapidement par gameId
botMetadataSchema.index({ gameId: 1, botId: 1 })

// Méthode pour nettoyer les métadonnées des parties terminées
botMetadataSchema.statics.cleanupOldMetadata = async function (maxAgeDays = 7) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate }
  })

  return result.deletedCount
}

export const BotMetadata = model<IBotMetadata>('BotMetadata', botMetadataSchema)
