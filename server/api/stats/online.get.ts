import { Game } from '~/server/models/Game'

export default defineEventHandler(async (event) => {
  try {
    // Compter les joueurs uniques dans les parties actives
    const activeGames = await Game.find({
      phase: { $in: ['lobby', 'playing'] }
    }).select('players')

    // Extraire les IDs uniques des joueurs
    const uniquePlayerIds = new Set<string>()

    activeGames.forEach(game => {
      game.players.forEach(player => {
        uniquePlayerIds.add(player.userId.toString())
      })
    })

    return {
      onlinePlayers: uniquePlayerIds.size
    }
  } catch (error: any) {
    console.error('Erreur lors du comptage des joueurs en ligne:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors du comptage des joueurs en ligne'
    })
  }
})
