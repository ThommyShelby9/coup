import { BotService } from '~/server/services/BotService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { gameId, botId } = body

    if (!gameId || !botId) {
      throw createError({
        statusCode: 400,
        message: 'gameId et botId sont requis'
      })
    }

    const game = await BotService.removeBot(gameId, botId)

    return {
      success: true,
      game
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Erreur lors de la suppression du bot'
    })
  }
})
