import { defineStore } from 'pinia'
import type { Game, Player, Action, GameSettings, Card } from '~/types'

interface GameState {
  currentGame: Game | null
  availableGames: any[]
  isLoading: boolean
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentGame: null,
    availableGames: [],
    isLoading: false
  }),

  getters: {
    game: (state) => state.currentGame,

    players: (state) => state.currentGame?.players || [],

    myPlayer: (state) => {
      const authStore = useAuthStore()
      if (!state.currentGame || !authStore.user) return null

      return state.currentGame.players.find(
        p => p.userId.toString() === authStore.user!.id
      )
    },

    myCards: (state): Card[] => {
      const authStore = useAuthStore()
      if (!state.currentGame || !authStore.user) return []

      const player = state.currentGame.players.find(
        p => p.userId.toString() === authStore.user!.id
      )

      return player?.cards || []
    },

    myCoins(): number {
      return this.myPlayer?.coins || 0
    },

    isMyTurn: (state) => {
      const authStore = useAuthStore()
      if (!state.currentGame || !authStore.user) return false

      const currentPlayer = state.currentGame.players[state.currentGame.currentPlayer]
      return currentPlayer?.userId.toString() === authStore.user.id
    },

    currentPlayer: (state) => {
      if (!state.currentGame) return null
      return state.currentGame.players[state.currentGame.currentPlayer]
    },

    isHost: (state) => {
      const authStore = useAuthStore()
      if (!state.currentGame || !authStore.user) return false

      return state.currentGame.hostId.toString() === authStore.user.id
    }
  },

  actions: {
    /**
     * Créer une nouvelle partie
     */
    async createGame(settings: Partial<GameSettings>) {
      this.isLoading = true

      try {
        const response = await $fetch('/api/game/create', {
          method: 'POST',
          body: settings
        })

        this.currentGame = response.game as any

        return response.game
      } catch (error) {
        console.error('Erreur lors de la création de la partie:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Récupérer la liste des parties disponibles
     */
    async fetchAvailableGames() {
      this.isLoading = true

      try {
        // CACHE BUSTING: Ajouter timestamp pour forcer le bypass du cache
        const timestamp = Date.now()
        const response = await $fetch(`/api/game/list?_t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })

        console.log('[GameStore] 🔄 Fetched from API:', response.games)
        this.availableGames = response.games
        return response.games
      } catch (error) {
        console.error('Erreur lors de la récupération des parties:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Rejoindre une partie
     */
    async joinGame(code: string) {
      this.isLoading = true

      try {
        const response = await $fetch('/api/game/join', {
          method: 'POST',
          body: { code }
        })

        this.currentGame = response.game as any

        return response.game
      } catch (error) {
        console.error('Erreur lors de la jonction à la partie:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Récupérer les détails d'une partie
     */
    async fetchGame(code: string) {
      this.isLoading = true

      try {
        const response = await $fetch(`/api/game/${code}`)
        this.currentGame = response.game as any
        return response.game
      } catch (error) {
        console.error('Erreur lors de la récupération de la partie:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Mettre à jour la partie (appelé par Socket.io)
     */
    updateGame(game: Game) {
      this.currentGame = game
    },

    /**
     * Réinitialiser la partie actuelle
     */
    resetCurrentGame() {
      this.currentGame = null
    }
  }
})
