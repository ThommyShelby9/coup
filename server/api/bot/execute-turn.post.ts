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

    const result = await BotService.executeBotTurn(gameId, botId)

    return {
      success: true,
      decision: result.decision,
      game: result.result.game
    }
  } catch (error: any) {
    console.error('❌ Erreur exécution tour bot:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Erreur lors de l\'exécution du tour du bot'
    })
  }
})
