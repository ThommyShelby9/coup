import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  avatar: string
  stats: {
    gamesPlayed: number
    wins: number
    bluffsSuccessful: number
    contestationsWon: number
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Restaurer depuis localStorage au démarrage (côté client uniquement)
    if (process.client) {
      const savedUser = localStorage.getItem('coup_user')
      const savedToken = localStorage.getItem('coup_token')

      if (savedUser && savedToken) {
        try {
          console.log('[AuthStore] 🔄 Restoring user from localStorage')
          return {
            user: JSON.parse(savedUser),
            token: savedToken,
            isAuthenticated: true,
            isLoading: false
          }
        } catch (error) {
          console.error('[AuthStore] ❌ Failed to restore user:', error)
        }
      }
    }

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    }
  },

  getters: {
    currentUser: (state) => state.user,
    username: (state) => state.user?.username || '',
    userStats: (state) => state.user?.stats
  },

  actions: {
    /**
     * Enregistrer un nouvel utilisateur
     */
    async register(username: string, password: string) {
      this.isLoading = true

      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: {
            username,
            password
          }
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Persister dans localStorage
        if (process.client) {
          localStorage.setItem('coup_user', JSON.stringify(response.user))
          localStorage.setItem('coup_token', response.token)
          console.log('[AuthStore] ✅ User registered and saved:', response.user.username)
        }

        return response
      } catch (error: any) {
        console.error('Erreur d\'inscription:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Connecter un utilisateur
     */
    async login(username: string, password: string) {
      this.isLoading = true

      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password
          }
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Persister dans localStorage
        if (process.client) {
          localStorage.setItem('coup_user', JSON.stringify(response.user))
          localStorage.setItem('coup_token', response.token)
          console.log('[AuthStore] ✅ User logged in and saved:', response.user.username)
        }

        return response
      } catch (error: any) {
        console.error('Erreur de connexion:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Déconnecter l'utilisateur
     */
    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })

        this.user = null
        this.token = null
        this.isAuthenticated = false

        // Supprimer de localStorage
        if (process.client) {
          localStorage.removeItem('coup_user')
          localStorage.removeItem('coup_token')
          console.log('[AuthStore] 🗑️ User logged out and removed from localStorage')
        }

        // Rediriger vers la page d'accueil
        navigateTo('/')
      } catch (error) {
        console.error('Erreur de déconnexion:', error)
      }
    },

    /**
     * Récupérer l'utilisateur actuel
     */
    async fetchCurrentUser() {
      this.isLoading = true

      try {
        const response = await $fetch('/api/auth/me')

        this.user = response.user
        this.isAuthenticated = true

        return response.user
      } catch (error) {
        // Si l'utilisateur n'est pas authentifié, réinitialiser l'état
        this.user = null
        this.token = null
        this.isAuthenticated = false
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Mettre à jour les stats de l'utilisateur
     */
    updateStats(stats: Partial<User['stats']>) {
      if (this.user) {
        this.user.stats = {
          ...this.user.stats,
          ...stats
        }
      }
    }
  }
})
