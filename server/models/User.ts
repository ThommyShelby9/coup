import mongoose, { Schema, Document } from 'mongoose'
import type { User as IUser } from '~/types'

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar: {
      type: String,
      default: 'default-avatar.png'
    },
    stats: {
      gamesPlayed: {
        type: Number,
        default: 0
      },
      wins: {
        type: Number,
        default: 0
      },
      bluffsSuccessful: {
        type: Number,
        default: 0
      },
      contestationsWon: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
)

// L'index sur username est déjà créé par l'option unique: true

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)
