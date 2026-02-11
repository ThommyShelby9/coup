/**
 * Composable pour gérer automatiquement les tours des bots
 */
export const useBotTurn = (gameRef: Ref<any>, onTurnExecuted?: () => void) => {
  const isExecutingBotTurn = ref(false)
  let checkInterval: NodeJS.Timeout | null = null

  /**
   * Vérifie si le joueur actuel est un bot
   */
  const isCurrentPlayerBot = computed(() => {
    if (!gameRef.value) return false

    const currentPlayer = gameRef.value.players[gameRef.value.currentPlayer]
    if (!currentPlayer) return false

    // Un bot a un nom qui contient Bot, AI, ou CPU
    return (
      currentPlayer.username.includes('Bot') ||
      currentPlayer.username.includes('AI') ||
      currentPlayer.username.includes('CPU') ||
      currentPlayer.username.includes('Algorithm') ||
      currentPlayer.username.includes('Code')
    )
  })

  /**
   * Exécute le tour du bot actuel
   */
  const executeBotTurn = async () => {
    if (!gameRef.value || !isCurrentPlayerBot.value || isExecutingBotTurn.value) {
      return
    }

    const currentPlayer = gameRef.value.players[gameRef.value.currentPlayer]
    if (!currentPlayer) return

    isExecutingBotTurn.value = true

    try {
      console.log(`🤖 Exécution du tour de ${currentPlayer.username}...`)

      // Attendre 1-2 secondes pour simuler une réflexion
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      const response = await $fetch('/api/bot/execute-turn', {
        method: 'POST',
        body: {
          gameId: gameRef.value._id,
          botId: currentPlayer.userId
        }
      })

      console.log(`✅ Bot turn executed:`, response.decision)

      // Callback après exécution
      if (onTurnExecuted) {
        onTurnExecuted()
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'exécution du tour du bot:', error)
    } finally {
      isExecutingBotTurn.value = false
    }
  }

  /**
   * Démarre la surveillance des tours de bots
   */
  const startBotTurnWatcher = () => {
    if (checkInterval) return
    if (!process.client) return // Client-side only

    // Vérifier toutes les 2 secondes si c'est le tour d'un bot
    checkInterval = setInterval(() => {
      if (
        gameRef.value?.phase === 'playing' &&
        isCurrentPlayerBot.value &&
        !isExecutingBotTurn.value &&
        !gameRef.value?.lastAction?.resolved === false // Pas d'action en attente
      ) {
        executeBotTurn()
      }
    }, 2000)

    console.log('👀 Bot turn watcher started')
  }

  /**
   * Arrête la surveillance des tours de bots
   */
  const stopBotTurnWatcher = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
      console.log('🛑 Bot turn watcher stopped')
    }
  }

  // Cleanup automatique
  onUnmounted(() => {
    stopBotTurnWatcher()
  })

  return {
    isCurrentPlayerBot,
    isExecutingBotTurn,
    executeBotTurn,
    startBotTurnWatcher,
    stopBotTurnWatcher
  }
}
