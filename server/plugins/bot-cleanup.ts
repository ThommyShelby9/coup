import { BotService } from '~/server/services/BotService'

/**
 * Plugin Nitro pour nettoyer périodiquement les métadonnées obsolètes des bots
 * S'exécute au démarrage du serveur et toutes les 24 heures
 */
export default defineNitroPlugin((nitroApp) => {
  console.log('🤖 Bot cleanup plugin initialisé')

  // Nettoyer au démarrage
  setTimeout(async () => {
    try {
      console.log('🧹 Nettoyage initial des métadonnées de bots...')
      await BotService.cleanupOldBotMetadata()
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage initial:', error)
    }
  }, 5000) // Attendre 5 secondes après le démarrage

  // Nettoyer toutes les 24 heures
  setInterval(
    async () => {
      try {
        console.log('🧹 Nettoyage périodique des métadonnées de bots...')
        await BotService.cleanupOldBotMetadata()
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage périodique:', error)
      }
    },
    24 * 60 * 60 * 1000 // 24 heures en millisecondes
  )
})
