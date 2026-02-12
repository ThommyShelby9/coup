import { BotService } from '~/server/services/BotService'

/**
 * Endpoint pour nettoyer les métadonnées obsolètes des bots
 * POST /api/admin/cleanup-bots
 *
 * Utilisation: Peut être appelé manuellement ou via un cron job externe
 */
export default defineEventHandler(async (event) => {
  try {
    // TODO: Ajouter une vérification d'authentification admin en production
    // const user = await requireAuth(event)
    // if (!user.isAdmin) throw new Error('Accès non autorisé')

    const count = await BotService.cleanupOldBotMetadata()

    return {
      success: true,
      message: `${count} métadonnées de bots obsolètes nettoyées`,
      deletedCount: count
    }
  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage des bots:', error)

    return {
      success: false,
      message: error.message || 'Erreur lors du nettoyage',
      deletedCount: 0
    }
  }
})
