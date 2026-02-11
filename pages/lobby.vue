<template>
  <div class="min-h-screen bg-royal-900">
    <!-- Header -->
    <header class="border-b border-royal-700 bg-royal-950/50 backdrop-blur-lg sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="font-medieval text-3xl text-gold-400">COUP</h1>
            <span class="px-3 py-1 bg-emerald/20 text-emerald rounded-full text-sm">
              {{ onlinePlayers }} en ligne
            </span>
          </div>

          <div class="flex items-center gap-4">
            <button class="p-2 text-royal-300 hover:text-gold-400 transition-colors">
              <Icon name="lucide:bell" class="w-5 h-5" />
            </button>
            <button class="p-2 text-royal-300 hover:text-gold-400 transition-colors">
              <Icon name="lucide:settings" class="w-5 h-5" />
            </button>
            <div class="flex items-center gap-2 glass-panel px-4 py-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span class="font-bold text-royal-900">{{ username[0] }}</span>
              </div>
              <span class="text-royal-100">{{ username }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h2 class="font-medieval text-5xl text-gold-400 mb-3 text-glow">
          Salle du Trône
        </h2>
        <p class="text-royal-300 text-lg">
          Rejoignez une partie ou créez la vôtre
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Liste des parties -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medieval text-2xl text-gold-400">Parties disponibles</h3>
            <button @click="refreshGames" class="p-2 text-royal-300 hover:text-gold-400 transition-colors">
              <Icon name="lucide:refresh-cw" class="w-5 h-5" :class="{ 'animate-spin': isRefreshing }" />
            </button>
          </div>

          <!-- Liste des parties -->
          <div v-if="availableGames.length > 0" class="space-y-3">
            <div
              v-for="game in availableGames"
              :key="game.code"
              class="glass-panel p-4 hover:border-gold-500/50 transition-all cursor-pointer group"
              @click="joinGame(game.code)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="font-medieval text-xl text-gold-400">{{ game.code }}</span>
                    <span class="px-2 py-1 bg-royal-700 rounded text-xs text-royal-300">
                      {{ game.playerCount }}/{{ game.maxPlayers }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-royal-300">
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:user" class="w-4 h-4" />
                      Hôte: {{ game.hostName }}
                    </span>
                    <span v-if="game.settings" class="flex items-center gap-1">
                      <Icon name="lucide:clock" class="w-4 h-4" />
                      {{ game.settings.timePerTurn }}s/tour
                    </span>
                  </div>
                </div>

                <button class="btn-primary px-6 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Rejoindre
                </button>
              </div>
            </div>
          </div>

          <!-- Aucune partie -->
          <div v-else class="glass-panel p-12 text-center">
            <Icon name="lucide:search-x" class="w-16 h-16 text-royal-600 mx-auto mb-4" />
            <p class="text-royal-400 text-lg mb-4">Aucune partie disponible pour le moment</p>
            <p class="text-royal-500 text-sm">Créez la première partie !</p>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="space-y-6">
          <!-- Créer une partie -->
          <div class="glass-panel p-6">
            <h3 class="font-medieval text-xl text-gold-400 mb-4">Créer une partie</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm text-royal-300 mb-2">Joueurs maximum</label>
                <select
                  v-model="createSettings.maxPlayers"
                  class="w-full px-4 py-2 bg-royal-900/50 border border-royal-600 rounded-lg
                         focus:outline-none focus:border-gold-500 text-royal-100"
                >
                  <option :value="2">2 joueurs</option>
                  <option :value="3">3 joueurs</option>
                  <option :value="4">4 joueurs</option>
                  <option :value="5">5 joueurs</option>
                  <option :value="6">6 joueurs</option>
                </select>
              </div>

              <div>
                <label class="block text-sm text-royal-300 mb-2">Temps par tour (secondes)</label>
                <input
                  v-model.number="createSettings.timePerTurn"
                  type="number"
                  min="15"
                  max="60"
                  class="w-full px-4 py-2 bg-royal-900/50 border border-royal-600 rounded-lg
                         focus:outline-none focus:border-gold-500 text-royal-100"
                />
              </div>

              <button
                @click="createGame"
                :disabled="isCreating"
                class="btn-primary w-full"
              >
                <span v-if="!isCreating">Créer la partie</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
                  Création...
                </span>
              </button>
            </div>
          </div>

          <!-- Rejoindre avec code -->
          <div class="glass-panel p-6">
            <h3 class="font-medieval text-xl text-gold-400 mb-4">Rejoindre avec code</h3>

            <div class="space-y-4">
              <input
                v-model="joinCode"
                type="text"
                placeholder="Entrez le code"
                maxlength="6"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 text-royal-100 uppercase text-center text-2xl font-bold"
                @input="joinCode = joinCode.toUpperCase()"
              />

              <button
                @click="joinGameWithCode"
                :disabled="joinCode.length !== 6"
                class="btn-secondary w-full"
              >
                Rejoindre
              </button>
            </div>
          </div>

          <!-- Statistiques utilisateur -->
          <div class="glass-panel p-6">
            <h3 class="font-medieval text-xl text-gold-400 mb-4">Vos statistiques</h3>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-royal-300">Parties jouées</span>
                <span class="text-gold-400 font-bold">{{ userStats.gamesPlayed }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-royal-300">Victoires</span>
                <span class="text-gold-400 font-bold">{{ userStats.wins }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-royal-300">Bluffs réussis</span>
                <span class="text-gold-400 font-bold">{{ userStats.bluffsSuccessful }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-royal-300">Winrate</span>
                <span class="text-gold-400 font-bold">{{ winrate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const gameStore = useGameStore()

const onlinePlayers = ref(0)
const isRefreshing = ref(false)
const joinCode = ref('')

const createSettings = reactive({
  maxPlayers: 6,
  timePerTurn: 30
})

const username = computed(() => authStore.username || 'Guest')
const availableGames = computed(() => gameStore.availableGames)
const userStats = computed(() => authStore.userStats || {
  gamesPlayed: 0,
  wins: 0,
  bluffsSuccessful: 0,
  contestationsWon: 0
})

const isCreating = computed(() => gameStore.isLoading)

const winrate = computed(() => {
  if (!userStats.value || userStats.value.gamesPlayed === 0) return 0
  return Math.round((userStats.value.wins / userStats.value.gamesPlayed) * 100)
})

// Charger le nombre de joueurs en ligne
const loadOnlinePlayers = async () => {
  try {
    const data = await $fetch('/api/stats/online')
    onlinePlayers.value = data.onlinePlayers
  } catch (error) {
    console.error('Error loading online players:', error)
  }
}

const refreshGames = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      gameStore.fetchAvailableGames(),
      loadOnlinePlayers()
    ])

    // Log pour debug
    console.log('[Lobby] Refreshed games:', availableGames.value)
  } catch (error) {
    console.error('Error fetching games:', error)
  } finally {
    isRefreshing.value = false
  }
}

const createGame = async () => {
  try {
    const game = await gameStore.createGame(createSettings)
    navigateTo(`/game/${game.code}`)
  } catch (error) {
    console.error('Error creating game:', error)
  }
}

const joinGame = async (code: string) => {
  try {
    await gameStore.joinGame(code)
    navigateTo(`/game/${code}`)
  } catch (error: any) {
    console.error('Error joining game:', error)
    alert(error.data?.message || 'Impossible de rejoindre la partie')
  }
}

const joinGameWithCode = () => {
  if (joinCode.value.length === 6) {
    joinGame(joinCode.value)
  }
}

// Charger les parties au montage
onMounted(() => {
  // S'assurer que l'authStore est bien hydraté
  console.log('[Lobby] AuthStore state:', {
    user: authStore.user,
    username: authStore.username,
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token ? 'present' : 'missing'
  })

  // Si le store n'est pas hydraté mais que localStorage a les données, les restaurer
  if (!authStore.user && process.client) {
    const savedUser = localStorage.getItem('coup_user')
    const savedToken = localStorage.getItem('coup_token')

    if (savedUser && savedToken) {
      try {
        authStore.user = JSON.parse(savedUser)
        authStore.token = savedToken
        authStore.isAuthenticated = true
        console.log('[Lobby] ✅ Manually restored user from localStorage:', authStore.username)
      } catch (error) {
        console.error('[Lobby] ❌ Failed to restore user:', error)
      }
    }
  }

  refreshGames()

  // Écouter les événements Socket.IO en temps réel
  if (process.client) {
    const socketService = useSocketService()

    // Connecter le socket si pas déjà connecté (non-blocking)
    if (!socketService.isConnected.value) {
      const authStore = useAuthStore()
      const token = authStore.token
      socketService.connect(token || undefined).catch(err => {
        console.warn('[Lobby] Socket connection failed:', err)
      })
    }

    // Nouvelle partie créée
    const unsubCreated = socketService.on('game-created', (data: any) => {
      console.log('[Lobby] 📡 New game created via socket:', data.code)
      refreshGames()
    })

    // Partie mise à jour
    const unsubUpdated = socketService.on('game-updated', (data: any) => {
      console.log('[Lobby] 📡 Game updated via socket:', data.code)
      refreshGames()
    })

    // Partie supprimée
    const unsubDeleted = socketService.on('game-deleted', (data: any) => {
      console.log('[Lobby] 📡 Game deleted via socket:', data.code)
      refreshGames()
    })

    // Backup: rafraîchir toutes les 15 secondes au cas où
    const interval = setInterval(() => {
      console.log('[Lobby] 🔄 Backup refresh (polling)')
      refreshGames()
    }, 15000)

    onUnmounted(() => {
      clearInterval(interval)
      if (unsubCreated) unsubCreated()
      if (unsubUpdated) unsubUpdated()
      if (unsubDeleted) unsubDeleted()
    })
  }
})

useHead({
  title: 'Lobby'
})
</script>
