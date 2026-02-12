import type { Game } from '~/types'

/**
 * Composable pour gérer l'état du jeu
 * Centralise le chargement et la gestion de l'état d'une partie
 */
export const useGameState = (gameCode: string) => {
  const game = ref<Game | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  /**
   * Charger l'état du jeu depuis l'API
   */
  const loadGame = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch(`/api/game/${gameCode}`)
      game.value = data.game
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Impossible de charger la partie'
      error.value = errorMessage
      console.error('Erreur lors du chargement de la partie:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour l'état du jeu
   */
  const updateGame = (newGame: Game) => {
    game.value = newGame
  }

  /**
   * Réinitialiser l'état
   */
  const reset = () => {
    game.value = null
    loading.value = false
    error.value = null
  }

  return {
    game,
    loading,
    error,
    loadGame,
    updateGame,
    reset
  }
}
