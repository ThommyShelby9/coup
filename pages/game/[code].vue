<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-black relative">
    <!-- Background animé -->
    <AnimatedBackground />

    <!-- Toast Notifications -->
    <ToastNotification />

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="lucide:loader-2" class="w-12 h-12 text-gold-400 animate-spin mx-auto mb-4" />
        <p class="text-royal-300">Chargement de la partie...</p>
      </div>
    </div>

    <!-- Lobby phase -->
    <div v-else-if="game && game.phase === 'lobby'" class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="glass-panel p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-medieval text-3xl text-gold-400">Salle d'attente</h1>
              <p class="text-royal-300">Code: <span class="text-gold-400 font-bold text-xl">{{ route.params.code }}</span></p>
            </div>
            <NuxtLink to="/lobby" class="btn-secondary">
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
              Quitter
            </NuxtLink>
          </div>
        </div>

        <div class="glass-panel p-6 mb-6">
          <h2 class="font-medieval text-xl text-gold-400 mb-4">
            Joueurs ({{ game.players.length }}/{{ game.settings.maxPlayers }})
          </h2>

          <div class="grid gap-3">
            <div
              v-for="player in game.players"
              :key="player.userId"
              class="flex items-center justify-between p-4 bg-royal-800/50 rounded-lg border border-royal-700"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Icon v-if="player.username.includes('Bot') || player.username.includes('AI') || player.username.includes('CPU')" name="lucide:bot" class="w-6 h-6 text-royal-900" />
                  <span v-else class="font-bold text-royal-900 text-lg">{{ player.username[0] }}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-royal-100">{{ player.username }}</span>
                    <span v-if="player.username.includes('Bot') || player.username.includes('AI') || player.username.includes('CPU')" class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                      BOT
                    </span>
                  </div>
                  <div v-if="player.userId === game.hostId" class="text-xs text-gold-400 flex items-center gap-1">
                    <Icon name="lucide:crown" class="w-3 h-3" />
                    Hôte
                  </div>
                </div>
              </div>

              <span
                v-if="player.isReady"
                class="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium"
              >
                ✓ Prêt
              </span>
              <span v-else class="px-4 py-2 bg-royal-700 text-royal-300 rounded-full text-sm">
                En attente...
              </span>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4">
          <button
            @click="toggleReady"
            :class="myPlayer?.isReady ? 'btn-secondary' : 'btn-primary'"
            class="lg:col-span-2"
          >
            {{ myPlayer?.isReady ? 'Annuler' : 'Je suis prêt !' }}
          </button>

          <button
            v-if="isHost && allPlayersReady"
            @click="startGame"
            :disabled="isStarting"
            class="btn-primary lg:col-span-2"
          >
            <span v-if="!isStarting" class="flex items-center justify-center gap-2">
              <Icon name="lucide:play" class="w-5 h-5" />
              Démarrer la partie
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
              Démarrage...
            </span>
          </button>
        </div>

        <!-- Ajouter un bot (seulement pour l'hôte) -->
        <div v-if="isHost && game.players.length < game.settings.maxPlayers" class="mt-6">
          <button
            @click="addBot"
            :disabled="isAddingBot"
            class="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Icon v-if="!isAddingBot" name="lucide:bot" class="w-5 h-5" />
            <Icon v-else name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            <span>{{ isAddingBot ? 'Ajout...' : 'Ajouter un Bot' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Playing phase -->
    <div v-else-if="game && game.phase === 'playing'" class="relative">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-royal-950/90 backdrop-blur-lg border-b border-royal-700">
        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <NuxtLink to="/lobby" class="text-royal-300 hover:text-gold-400 transition-colors">
                <Icon name="lucide:arrow-left" class="w-5 h-5" />
              </NuxtLink>
              <div>
                <span class="text-royal-300">Tour {{ game.turn }}</span>
                <span class="mx-2 text-royal-600">•</span>
                <span class="text-gold-400 font-medium">{{ currentPlayerName }} joue</span>
              </div>
            </div>
            <div class="text-royal-300">
              Code: <span class="text-gold-400 font-mono">{{ route.params.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar left -->
          <div class="space-y-4">
            <ActionHistory
              v-if="game.actionHistory"
              :actions="game.actionHistory"
              :players="game.players"
            />
          </div>

          <!-- Main area -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Players grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="(player, index) in game.players"
                :key="player.userId"
                :data-player-id="player.userId"
                :data-player-index="index"
                class="glass-panel p-4 relative transition-all duration-500"
                :class="{
                  'player-active': index === game.currentPlayer,
                  'opacity-60 grayscale': !player.isAlive,
                  'player-card-hover': player.isAlive
                }"
              >
                <div class="absolute top-2 right-2" v-if="index === game.currentPlayer">
                  <span class="px-2 py-1 bg-gold-500 text-royal-950 rounded text-xs font-bold">
                    ▶ TOUR
                  </span>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                    <span class="font-bold text-royal-900">{{ player.username[0] }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-royal-100 truncate">{{ player.username }}</div>
                    <div class="text-sm text-royal-300 space-y-1 mt-2">
                      <div class="flex items-center gap-2">
                        <Icon name="lucide:coins" class="w-4 h-4 text-gold-400" />
                        <span>{{ player.coins }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Icon name="lucide:layers" class="w-4 h-4 text-royal-400" />
                        <span>{{ player.cardCount }} carte(s)</span>
                      </div>
                      <div v-if="!player.isAlive" class="text-red-400 text-xs">
                        ❌ Éliminé
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- My cards -->
            <div v-if="myCards.length > 0" class="glass-panel p-6">
              <h3 class="font-medieval text-xl text-gold-400 mb-4">Vos cartes</h3>
              <div class="flex gap-4 justify-center">
                <Card3D
                  v-for="(card, index) in myCards"
                  :key="index"
                  :card="card"
                  :interactive="false"
                />
              </div>
            </div>

            <!-- Actions -->
            <div v-if="isMyTurn && myPlayer?.isAlive" class="glass-panel p-6">
              <h3 class="font-medieval text-xl text-gold-400 mb-4 flex items-center gap-2">
                <Icon name="lucide:zap" class="w-5 h-5" />
                Vos actions
              </h3>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <!-- Actions de base -->
                <button
                  @click="executeAction('income')"
                  aria-label="Income - Gagner 1 pièce"
                  class="action-btn action-basic"
                >
                  <Icon name="lucide:plus" class="w-5 h-5" />
                  <span>Income</span>
                  <span class="text-xs">+1</span>
                </button>

                <button
                  @click="executeAction('foreign-aid')"
                  aria-label="Aide étrangère - Gagner 2 pièces"
                  class="action-btn action-basic"
                >
                  <Icon name="lucide:hand-heart" class="w-5 h-5" />
                  <span>Aide</span>
                  <span class="text-xs">+2</span>
                </button>

                <button
                  v-if="myPlayer && myPlayer.coins >= 7"
                  @click="selectTarget('coup')"
                  aria-label="Coup d'État - Éliminer un joueur pour 7 pièces"
                  class="action-btn action-danger"
                >
                  <Icon name="lucide:sword" class="w-5 h-5" />
                  <span>Coup</span>
                  <span class="text-xs">-7</span>
                </button>

                <!-- Actions de rôles -->
                <button
                  @click="executeAction('tax', 'Duke')"
                  aria-label="Taxe - Prétendre être Duke et gagner 3 pièces"
                  class="action-btn action-role"
                >
                  <Icon name="lucide:crown" class="w-5 h-5" />
                  <span>Taxe</span>
                  <span class="text-xs">Duke +3</span>
                </button>

                <button
                  v-if="myPlayer && myPlayer.coins >= 3"
                  @click="selectTarget('assassinate')"
                  aria-label="Assassiner - Éliminer un joueur pour 3 pièces"
                  class="action-btn action-danger"
                >
                  <Icon name="lucide:zap" class="w-5 h-5" />
                  <span>Assassiner</span>
                  <span class="text-xs">-3</span>
                </button>

                <button
                  @click="selectTarget('steal')"
                  aria-label="Voler - Prétendre être Captain et voler 2 pièces"
                  class="action-btn action-role"
                >
                  <Icon name="lucide:hand" class="w-5 h-5" />
                  <span>Voler</span>
                  <span class="text-xs">Captain</span>
                </button>

                <button
                  @click="executeAction('exchange', 'Ambassador')"
                  aria-label="Échanger - Prétendre être Ambassador et échanger des cartes"
                  class="action-btn action-role"
                >
                  <Icon name="lucide:refresh-cw" class="w-5 h-5" />
                  <span>Échanger</span>
                  <span class="text-xs">Ambassador</span>
                </button>
              </div>
            </div>

            <!-- Waiting message -->
            <div v-else-if="game.phase === 'playing'" class="glass-panel p-6 text-center">
              <Icon name="lucide:clock" class="w-12 h-12 text-royal-400 mx-auto mb-3" />
              <p class="text-royal-300">
                C'est le tour de <span class="text-gold-400 font-medium">{{ currentPlayerName }}</span>
              </p>
            </div>
          </div>

          <!-- Sidebar right -->
          <div class="space-y-4">
            <GameChat :messages="chatMessages" @send="sendChatMessage" />
          </div>
        </div>
      </div>

      <!-- Target selector modal -->
      <TargetSelector
        v-if="showTargetSelector"
        :players="game.players"
        :current-user-id="authStore.user!.id"
        :action-type="pendingActionType"
        @select="onTargetSelected"
        @cancel="showTargetSelector = false"
      />

      <!-- Action response modal -->
      <ActionResponse
        v-if="showActionResponse && pendingAction && pendingAction.action"
        :player-name="getPlayerName(pendingAction.action.playerId)"
        :action-type="pendingAction.action.type"
        :claimed-role="pendingAction.action.claimedRole"
        :target-name="pendingAction.action.target ? game.players.find((p: any) => p.userId === pendingAction.action.target)?.username : undefined"
        :can-challenge="!!pendingAction.action.claimedRole"
        :can-block="canBlockCurrentAction"
        :blocking-roles="getBlockingRoles(pendingAction.action.type)"
        @challenge="handleChallengeAction"
        @block="handleBlockAction"
        @accept="handleAcceptAction"
      />

      <!-- Character Reveal Modal -->
      <CharacterRevealModal
        v-if="showRevealModal && revealData"
        :reveal-data="revealData"
        @close="showRevealModal = false"
      />

      <!-- Victory Modal -->
      <VictoryModal
        v-if="showVictoryModal && victoryData"
        :winner="victoryData.winner"
        :game-stats="victoryData.stats"
        @return-to-lobby="navigateTo('/lobby')"
      />
    </div>

    <!-- Game ended -->
    <div v-else-if="game && game.phase === 'ended'" class="flex items-center justify-center min-h-screen">
      <div class="glass-panel p-12 text-center max-w-md mx-4">
        <Icon name="lucide:trophy" class="w-24 h-24 text-gold-400 mx-auto mb-6" />
        <h1 class="font-medieval text-4xl text-gold-400 mb-4">Victoire !</h1>
        <p class="text-royal-200 text-xl mb-8">
          <span class="text-gold-400 font-bold">{{ winnerName }}</span> remporte la partie !
        </p>
        <NuxtLink to="/lobby" class="btn-primary inline-flex items-center gap-2">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
          Retour au lobby
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const socket = useSocketService()
const animations = useGameAnimations()
const { showToast } = useToast()

const isLoading = ref(true)
const isStarting = ref(false)
const isAddingBot = ref(false)

// Action labels for toasts
const actionLabels: Record<string, string> = {
  'income': 'Income (+1 pièce)',
  'foreign-aid': 'Aide étrangère (+2 pièces)',
  'tax': 'Impôt (+3 pièces)',
  'coup': 'Coup d\'État',
  'assassinate': 'Assassinat',
  'steal': 'Vol',
  'exchange': 'Échange de cartes',
  'block': 'Blocage'
}
const game = ref<any>(null)
const showTargetSelector = ref(false)
const pendingActionType = ref('')
const chatMessages = ref<any[]>([])
const showActionResponse = ref(false)
const pendingAction = ref<any>(null)
const showRevealModal = ref(false)
const revealData = ref<any>(null)
const showVictoryModal = ref(false)
const victoryData = ref<any>(null)

// Système de bot automatique (après la déclaration de game)
const botTurn = useBotTurn(game, () => {
  // Callback après exécution du tour du bot
  loadGame()
})

const myPlayer = computed(() => {
  if (!game.value || !authStore.user) return null
  return game.value.players.find((p: any) => p.userId === authStore.user!.id)
})

const myCards = computed(() => myPlayer.value?.cards || [])

const isMyTurn = computed(() => {
  if (!game.value || !authStore.user) return false
  const currentPlayer = game.value.players[game.value.currentPlayer]
  return currentPlayer?.userId === authStore.user.id
})

const isHost = computed(() => {
  if (!game.value || !authStore.user) {
    console.log('[HOST-CHECK] No game or user')
    return false
  }

  const result = game.value.hostId === authStore.user.id

  console.log('[HOST-CHECK] Game hostId:', game.value.hostId, 'User id:', authStore.user.id, 'Match:', result)

  return result
})

const allPlayersReady = computed(() => {
  if (!game.value) {
    console.log('[READY-CHECK] No game')
    return false
  }

  const playersStatus = game.value.players.map((p: any) => ({
    username: p.username,
    isReady: p.isReady
  }))

  const allReady = game.value.players.every((p: any) => p.isReady)

  console.log('[READY-CHECK] Players:', playersStatus)
  console.log('[READY-CHECK] All ready:', allReady)
  console.log('[READY-CHECK] Is host:', isHost.value)
  console.log('[READY-CHECK] Button should show:', isHost.value && allReady)

  return allReady
})

const currentPlayerName = computed(() => {
  if (!game.value) return ''
  return game.value.players[game.value.currentPlayer]?.username || ''
})

const winnerName = computed(() => {
  if (!game.value) return ''
  const winner = game.value.players.find((p: any) => p.isAlive)
  return winner?.username || ''
})

const canBlockCurrentAction = computed(() => {
  if (!pendingAction.value || !pendingAction.value.action || !myCards.value) return false
  return getBlockingRoles(pendingAction.value.action.type).length > 0
})

const getBlockingRoles = (actionType: string): string[] => {
  const blockingMap: Record<string, string[]> = {
    'foreign-aid': ['Duke'],
    'assassinate': ['Contessa'],
    'steal': ['Captain', 'Ambassador']
  }
  return blockingMap[actionType] || []
}

const loadGame = async () => {
  try {
    const data = await $fetch(`/api/game/${route.params.code}`)
    game.value = data.game
  } catch (error) {
    console.error('Error loading game:', error)
    navigateTo('/lobby')
  } finally {
    isLoading.value = false
  }
}

const toggleReady = () => {
  if (!game.value) return

  const gameCode = route.params.code as string
  const currentReadyState = myPlayer.value?.isReady || false

  socket.toggleReady(gameCode, !currentReadyState)
}

const startGame = async () => {
  if (!game.value) return

  isStarting.value = true

  try {
    await $fetch('/api/game/start', {
      method: 'POST',
      body: {
        gameId: game.value._id
      }
    })

    showToast('Partie démarrée !', 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Error starting game:', error)
    showToast(error.data?.message || 'Erreur lors du démarrage de la partie', 'error')
  } finally {
    isStarting.value = false
  }
}

const executeAction = async (actionType: string, claimedRole?: string) => {
  if (!game.value || !authStore.user) return

  // Actions nécessitant une cible
  if (['coup', 'assassinate', 'steal'].includes(actionType)) {
    pendingActionType.value = actionType
    // Stocker temporairement le claimedRole pour les actions ciblées
    if (claimedRole) {
      // @ts-ignore
      window.__pendingClaimedRole = claimedRole
    }
    showTargetSelector.value = true
    return
  }

  // Actions directes via API
  try {
    await $fetch('/api/game/action', {
      method: 'POST',
      body: {
        gameId: game.value._id,
        actionType,
        claimedRole
      }
    })

    showToast(`Action ${actionType} exécutée !`, 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Erreur action:', error)
    showToast(error.data?.message || 'Erreur lors de l\'action', 'error')
  }
}

const selectTarget = (actionType: string) => {
  pendingActionType.value = actionType
  showTargetSelector.value = true
}

// Handler de sélection de cible (appelé par TargetSelector)
const handleTargetSelected = async (targetPlayer: any) => {
  if (!game.value || !pendingActionType.value) return

  // @ts-ignore
  const claimedRole = window.__pendingClaimedRole

  try {
    await $fetch('/api/game/action', {
      method: 'POST',
      body: {
        gameId: game.value._id,
        actionType: pendingActionType.value,
        targetId: targetPlayer.userId,
        claimedRole
      }
    })

    showToast(`Action ${pendingActionType.value} exécutée !`, 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Erreur action:', error)
    showToast(error.data?.message || 'Erreur lors de l\'action', 'error')
  }

  showTargetSelector.value = false
  pendingActionType.value = ''
  // @ts-ignore
  window.__pendingClaimedRole = undefined
}

const onTargetSelected = async (player: any) => {
  if (!game.value || !pendingActionType.value) return

  const claimedRole = pendingActionType.value === 'assassinate' ? 'Assassin' :
                       pendingActionType.value === 'steal' ? 'Captain' : undefined

  try {
    await $fetch('/api/game/action', {
      method: 'POST',
      body: {
        gameId: game.value._id,
        actionType: pendingActionType.value,
        targetId: player.userId,
        claimedRole
      }
    })

    showToast(`Action ${pendingActionType.value} exécutée !`, 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Erreur action:', error)
    showToast(error.data?.message || 'Erreur lors de l\'action', 'error')
  }

  showTargetSelector.value = false
  pendingActionType.value = ''
}

const sendChatMessage = (text: string) => {
  const gameCode = route.params.code as string
  socket.sendChatMessage(gameCode, text)
}

const addBot = async () => {
  if (!game.value) return

  isAddingBot.value = true
  try {
    await $fetch('/api/game/bot', {
      method: 'POST',
      body: {
        gameId: game.value._id,
        difficulty: 'medium'
      }
    })

    showToast('Bot ajouté avec succès !', 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Error adding bot:', error)
    showToast(error.data?.message || 'Erreur lors de l\'ajout du bot', 'error')
  } finally {
    isAddingBot.value = false
  }
}

const handleBotAdded = async (bot: any) => {
  console.log('Bot ajouté:', bot)
  // Recharger l'état du jeu
  await loadGame()
}

// Helper pour obtenir le nom d'un joueur
const getPlayerName = (playerId: string) => {
  const player = game.value?.players.find((p: any) => p.userId.toString() === playerId.toString())
  return player?.username || 'Inconnu'
}

const handleChallengeAction = async () => {
  if (!game.value || !authStore.user) return

  try {
    await $fetch('/api/game/challenge', {
      method: 'POST',
      body: {
        gameId: game.value._id
      }
    })

    showToast('Action contestée !', 'info')
    await loadGame()
  } catch (error: any) {
    console.error('Erreur contestation:', error)
    showToast(error.data?.message || 'Erreur lors de la contestation', 'error')
  }

  showActionResponse.value = false
}

const handleBlockAction = async (blockingRole: string) => {
  if (!game.value || !authStore.user) return

  try {
    await $fetch('/api/game/block', {
      method: 'POST',
      body: {
        gameId: game.value._id,
        blockingRole
      }
    })

    showToast(`Action bloquée avec ${blockingRole} !`, 'success')
    await loadGame()
  } catch (error: any) {
    console.error('Erreur blocage:', error)
    showToast(error.data?.message || 'Erreur lors du blocage', 'error')
  }

  showActionResponse.value = false
}

const handleAcceptAction = async () => {
  if (!game.value) return

  try {
    await $fetch('/api/game/resolve', {
      method: 'POST',
      body: {
        gameId: game.value._id
      }
    })

    await loadGame()
  } catch (error: any) {
    console.error('Erreur résolution:', error)
    showToast(error.data?.message || 'Erreur lors de la résolution', 'error')
  }

  showActionResponse.value = false
}

// Approche hybride : API REST + Socket.io pour notifications
onMounted(async () => {
  const gameCode = route.params.code as string

  // S'assurer que l'authStore est bien hydraté
  console.log('[GAME] AuthStore state:', {
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
        console.log('[GAME] ✅ Manually restored user from localStorage:', authStore.username)
      } catch (error) {
        console.error('[GAME] ❌ Failed to restore user:', error)
      }
    }
  }

  // Charger l'état initial
  await loadGame()

  // Connecter Socket.io (avec JWT si disponible)
  const token = authStore.token
  await socket.connect(token)
  socket.joinGame(gameCode)

  // Écouter les notifications de changement (puis recharger via API)
  socket.onPlayerJoined(() => {
    console.log('Player joined, reloading game state...')
    loadGame()
  })

  socket.onPlayerLeft(() => {
    console.log('Player left, reloading game state...')
    loadGame()
  })

  socket.onPlayerReadyChanged((data) => {
    console.log('Player ready changed:', data)
    loadGame()
  })

  socket.onGameStarted(() => {
    console.log('Game started!')
    loadGame()
    // Démarrer la surveillance des tours de bots
    botTurn.startBotTurnWatcher()
  })

  socket.onActionExecuted((data) => {
    console.log('Action executed:', data)

    // Mettre à jour l'état du jeu
    if (data.game) {
      game.value = data.game
    } else {
      loadGame()
    }

    // Toast notification
    const playerName = getPlayerName(data.action.playerId)
    const actionLabel = actionLabels[data.action.type] || data.action.type
    showToast(`${playerName} a fait ${actionLabel}`, 'info')

    // Si cette action nécessite une réponse ET que je peux répondre
    if (data.needsResponse) {
      const myUserId = authStore.user?.id
      const currentPlayerId = data.action.playerId.toString()

      if (myUserId && myUserId !== currentPlayerId) {
        pendingAction.value = data
        showActionResponse.value = true
      }
    }
  })

  socket.onActionChallenged((data) => {
    console.log('Action challenged:', data)
    loadGame()

    // Toast notification
    showToast(`${data.challengerName} conteste l'action!`, 'warning')
  })

  socket.onActionBlocked((data) => {
    console.log('Action blocked:', data)
    loadGame()

    // Toast notification
    showToast(`${data.blockerName} bloque avec ${data.blockingRole}!`, 'warning')
  })

  socket.onActionResolved((data) => {
    console.log('Action resolved:', data)
    if (data.game) {
      game.value = data.game
    } else {
      loadGame()
    }
    showActionResponse.value = false
  })

  // Nouveau listener pour challenge resolved
  socket.onChallengeResolved((data) => {
    console.log('Challenge resolved:', data)
    game.value = data.game
    showActionResponse.value = false

    // Toast notification
    if (data.challengeSuccess) {
      const eliminatedName = getPlayerName(data.eliminatedPlayer || '')
      showToast(`Contestation réussie! ${eliminatedName} perd une carte`, 'success')
    } else {
      const challengerName = data.challengerName
      showToast(`${challengerName} avait bien ${data.revealedCard?.type}!`, 'warning')
    }

    // Afficher la carte révélée
    if (data.revealedCard) {
      revealData.value = {
        playerName: data.challengerName,
        card: data.revealedCard,
        success: data.challengeSuccess
      }
      showRevealModal.value = true

      // Fermer après 3 secondes
      setTimeout(() => {
        showRevealModal.value = false
      }, 3000)
    }
  })

  // Nouveau listener pour block declared
  socket.onBlockDeclared((data) => {
    console.log('Block declared:', data)
    game.value = data.game
    showActionResponse.value = false

    // Toast notification
    const blockerName = data.blockerName
    showToast(`${blockerName} bloque avec ${data.blockingRole}`, 'warning')
  })

  socket.onGameEnded((data) => {
    console.log('Game ended:', data)

    if (data.game) {
      game.value = data.game
    } else {
      loadGame()
    }

    // Toast notification
    showToast(`🎉 ${data.winner.username} a gagné!`, 'success')

    // Victory animation (confetti)
    const winnerElement = document.querySelector(`[data-player-id="${data.winner.userId}"]`) as HTMLElement
    if (winnerElement) {
      animations.animateVictory(winnerElement)
    } else {
      // Fallback: just create confetti
      animations.animateVictory(document.body)
    }

    // Afficher modal victoire
    victoryData.value = {
      winner: data.winner,
      stats: data.stats || {
        turns: game.value?.turn || 0,
        bluffs: 0,
        duration: '0'
      }
    }
    showVictoryModal.value = true
  })

  // Disconnection/reconnection events
  socket.onPlayerDisconnected((data) => {
    showToast(`${data.playerName} s'est déconnecté`, 'warning')
    loadGame() // Reload to update player status
  })

  socket.onPlayerReconnected((data) => {
    showToast(`${data.playerName} s'est reconnecté`, 'success')
    loadGame()
  })

  socket.onPlayerReplacedByBot((data) => {
    showToast(`${data.botName} remplace le joueur déconnecté`, 'info')
    loadGame()
  })

  socket.onTurnTimeout((data) => {
    showToast(data.message, 'warning')
  })

  socket.onGameStateSync((gameData) => {
    game.value = gameData
    showToast('État du jeu synchronisé', 'success')
  })

  // Chat en temps réel
  socket.onChatMessage((data) => {
    console.log('Chat message received:', data)
    chatMessages.value.push(data)
  })
})

onUnmounted(() => {
  const gameCode = route.params.code as string
  socket.leaveGame(gameCode)
  botTurn.stopBotTurnWatcher()
  // Note: We don't disconnect as service is singleton
})

useHead({
  title: `Partie ${route.params.code}`
})
</script>

<style scoped>
.action-btn {
  @apply flex flex-col items-center gap-1 p-4 rounded-lg font-medium
         transition-all duration-200 hover:shadow-lg relative overflow-hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.action-basic {
  @apply bg-royal-700 hover:bg-royal-600 text-royal-100
         border border-royal-600 hover:border-royal-500;
}

.action-basic:hover {
  box-shadow: 0 4px 20px rgba(100, 116, 139, 0.4);
}

.action-role {
  @apply bg-gradient-to-br from-blue-600 to-blue-700
         hover:from-blue-500 hover:to-blue-600 text-white;
}

.action-role:hover {
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
  transform: translateY(-2px);
}

.action-danger {
  @apply bg-gradient-to-br from-red-600 to-red-700
         hover:from-red-500 hover:to-red-600 text-white;
}

.action-danger:hover {
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.6);
  transform: translateY(-2px);
}

/* Cartes de joueur avec effets */
.player-card-hover {
  position: relative;
  overflow: hidden;
}

.player-card-hover::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(251, 191, 36, 0.1) 50%,
    transparent 70%
  );
  animation: card-shimmer 3s ease-in-out infinite;
}

@keyframes card-shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.player-active {
  animation: player-glow 2s ease-in-out infinite;
  position: relative;
  z-index: 10;
}

@keyframes player-glow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(251, 191, 36, 0.5),
      0 0 40px rgba(251, 191, 36, 0.3),
      inset 0 0 20px rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.6);
  }
  50% {
    box-shadow:
      0 0 30px rgba(251, 191, 36, 0.8),
      0 0 60px rgba(251, 191, 36, 0.5),
      inset 0 0 30px rgba(251, 191, 36, 0.2);
    border-color: rgba(251, 191, 36, 1);
  }
}

.player-active::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-rotate 3s linear infinite;
  pointer-events: none;
}

@keyframes border-rotate {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

/* Amélioration du glass panel */
:deep(.glass-panel) {
  backdrop-filter: blur(12px);
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.8),
    rgba(30, 41, 59, 0.6)
  );
  border: 1px solid rgba(251, 191, 36, 0.2);
  transition: all 0.3s ease;
}

:deep(.glass-panel:hover) {
  border-color: rgba(251, 191, 36, 0.4);
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.9),
    rgba(30, 41, 59, 0.7)
  );
}
</style>
