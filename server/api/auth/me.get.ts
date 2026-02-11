import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const authUser = await requireAuth(event)

    // Récupérer l'utilisateur complet
    const user = await User.findById(authUser.userId).select('-password')

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Utilisateur non trouvé'
      })
    }

    return {
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        stats: user.stats
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur serveur'
    })
  }
})
