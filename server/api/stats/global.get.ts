import { Game } from '~/server/models/Game'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Récupérer les statistiques en parallèle
    const [totalGames, activeGames, totalUsers, totalStats] = await Promise.all([
      // Total de parties créées
      Game.countDocuments(),

      // Parties en cours (lobby + playing)
      Game.countDocuments({ phase: { $in: ['lobby', 'playing'] } }),

      // Total d'utilisateurs inscrits
      User.countDocuments(),

      // Somme de toutes les statistiques de jeu
      User.aggregate([
        {
          $group: {
            _id: null,
            totalGamesPlayed: { $sum: '$stats.gamesPlayed' },
            totalWins: { $sum: '$stats.wins' },
            totalBluffs: { $sum: '$stats.bluffsSuccessful' },
            totalContestations: { $sum: '$stats.contestationsWon' }
          }
        }
      ])
    ])

    const stats = totalStats[0] || {
      totalGamesPlayed: 0,
      totalWins: 0,
      totalBluffs: 0,
      totalContestations: 0
    }

    return {
      stats: {
        totalGames,
        gamesPlayed: stats.totalGamesPlayed,
        activeGames,
        totalUsers,
        totalBluffs: stats.totalBluffs,
        totalContestations: stats.totalContestations
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des statistiques'
    })
  }
})
