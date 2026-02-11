import { BotService } from '~/server/services/BotService'
import type { BotDifficulty, BotPersonality } from '~/types/bot'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { gameId, difficulty, personality } = body

    if (!gameId) {
      throw createError({
        statusCode: 400,
        message: 'gameId est requis'
      })
    }

    const validDifficulties: BotDifficulty[] = ['easy', 'medium', 'hard']
    if (difficulty && !validDifficulties.includes(difficulty)) {
      throw createError({
        statusCode: 400,
        message: 'Difficulté invalide (easy, medium, hard)'
      })
    }

    const result = await BotService.addBot(gameId, difficulty || 'medium', personality)

    return {
      success: true,
      bot: {
        id: result.botId,
        name: result.botName,
        difficulty: result.difficulty,
        personality: result.personality
      },
      game: result.game
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Erreur lors de l\'ajout du bot'
    })
  }
})
