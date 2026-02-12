<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-black relative">
    <!-- Background animé -->
    <AnimatedBackground />

    <!-- Toast Notifications -->
    <ToastNotification />

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="lucide:loader-2" class="w-12 h-12 text-gold-400 animate-spin mx-auto mb-4" />
        <p class="text-royal-300">Chargement de la partie...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <GlassPanel variant="bordered" padding="lg" class="max-w-md mx-4">
        <div class="text-center">
          <Icon name="lucide:alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 class="font-medieval text-2xl text-royal-200 mb-2">Erreur</h2>
          <p class="text-royal-300 mb-6">{{ error }}</p>
          <div class="flex gap-3">
            <button @click="loadGame" class="btn-primary flex-1">
              Réessayer
            </button>
            <NuxtLink to="/lobby" class="btn-secondary flex-1">
              Retour au lobby
            </NuxtLink>
          </div>
        </div>
      </GlassPanel>
    </div>

    <!-- Lobby phase -->
    <GameLobby
      v-else-if="game && game.phase === 'lobby'"
      :game="game"
      :current-user-id="currentUserId"
      :is-starting="isStarting"
      :is-adding-bot="isAddingBot"
      @toggle-ready="handleToggleReady"
      @start-game="handleStartGame"
      @add-bot="handleAddBot"
    />

    <!-- Playing phase -->
    <GamePlaying
      v-else-if="game && game.phase === 'playing'"
      :game="game"
      :current-user-id="currentUserId"
      :chat-messages="chatMessages"
      :show-action-response="showActionResponse"
      :show-target-selector="showTargetSelector"
      :pending-action="pendingAction"
      @execute-action="handleExecuteAction"
      @challenge="handleChallenge"
      @block="handleBlock"
      @accept="handleAccept"
      @target-selected="handleTargetSelected"
      @cancel-target="showTargetSelector = false"
      @send-chat="handleSendChat"
    />

    <!-- Game ended -->
    <div v-else-if="game && game.phase === 'ended'" class="flex items-center justify-center min-h-screen">
      <GlassPanel variant="elevated" padding="lg" class="max-w-md mx-4 text-center">
        <Icon name="lucide:trophy" class="w-24 h-24 text-gold-400 mx-auto mb-6" />
        <h1 class="font-medieval text-4xl text-gold-400 mb-4">Victoire !</h1>
        <p class="text-royal-200 text-xl mb-8">
          <span class="text-gold-400 font-bold">{{ winnerName }}</span> remporte la partie !
        </p>
        <NuxtLink to="/lobby" class="btn-primary inline-flex items-center gap-2">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
          Retour au lobby
        </NuxtLink>
      </GlassPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Game, ChatMessage, Player } from '~/types'

const route = useRoute()
const authStore = useAuthStore()
const socket = useSocketService()
const { showToast } = useToast()

const gameCode = route.params.code as string
const currentUserId = computed(() => authStore.user?.id || '')

// États locaux
const isStarting = ref(false)
const isAddingBot = ref(false)
const showActionResponse = ref(false)
const showTargetSelector = ref(false)
const pendingAction = ref<any>(null)
const chatMessages = ref<ChatMessage[]>([])

// Utiliser les composables
const { game, loading, error, loadGame, updateGame } = useGameState(gameCode)
const { setupListeners, cleanup } = useGameEventHandlers(gameCode, loadGame)

// Computed
const winnerName = computed(() => {
  if (!game.value) return ''
  const winner = game.value.players.find((p: Player) => p.isAlive)
  return winner?.username || ''
})

// Lifecycle
onMounted(async () => {
  await loadGame()

  // Connecter Socket.io
  const token = authStore.token
  await socket.connect(token)
  socket.joinGame(gameCode)

  // Setup listeners
  setupListeners()
})

onUnmounted(() => {
  cleanup()
})

// Handlers - Lobby
const handleToggleReady = async () => {
  try {
    if (!game.value) return
    await socket.toggleReady(game.value._id.toString(), currentUserId.value)
    showToast({ type: 'success', message: 'Statut mis à jour' })
  } catch (error: unknown) {
    console.error('Erreur toggle ready:', error)
    showToast({ type: 'error', message: 'Erreur lors de la mise à jour' })
  }
}

const handleStartGame = async () => {
  if (!game.value) return
  isStarting.value = true

  try {
    await socket.startGame(game.value._id.toString())
  } catch (error: unknown) {
    console.error('Erreur start game:', error)
    showToast({ type: 'error', message: 'Impossible de démarrer la partie' })
  } finally {
    isStarting.value = false
  }
}

const handleAddBot = async () => {
  if (!game.value) return
  isAddingBot.value = true

  try {
    await $fetch(`/api/game/${gameCode}/add-bot`, { method: 'POST' })
    await loadGame()
    showToast({ type: 'success', message: 'Bot ajouté' })
  } catch (error: unknown) {
    console.error('Erreur add bot:', error)
    showToast({ type: 'error', message: 'Impossible d\'ajouter un bot' })
  } finally {
    isAddingBot.value = false
  }
}

// Handlers - Playing
const handleExecuteAction = async (action: any) => {
  try {
    if (!game.value) return
    await socket.executeAction({
      gameId: game.value._id.toString(),
      ...action
    })
  } catch (error: unknown) {
    console.error('Erreur execute action:', error)
    showToast({ type: 'error', message: 'Action impossible' })
  }
}

const handleChallenge = async () => {
  try {
    if (!game.value) return
    await socket.challengeAction(game.value._id.toString())
    showActionResponse.value = false
  } catch (error: unknown) {
    console.error('Erreur challenge:', error)
  }
}

const handleBlock = async (role: string) => {
  try {
    if (!game.value) return
    await socket.blockAction({
      gameId: game.value._id.toString(),
      blockingRole: role
    })
    showActionResponse.value = false
  } catch (error: unknown) {
    console.error('Erreur block:', error)
  }
}

const handleAccept = async () => {
  try {
    if (!game.value) return
    await socket.acceptAction(game.value._id.toString())
    showActionResponse.value = false
  } catch (error: unknown) {
    console.error('Erreur accept:', error)
  }
}

const handleTargetSelected = (player: Player) => {
  // Logique de sélection de cible
  showTargetSelector.value = false
}

const handleSendChat = (message: string) => {
  socket.sendChatMessage(gameCode, message)
}

useHead({
  title: `Partie ${gameCode} - Coup Digital`
})
</script>

<style scoped>
/* Styles globaux déjà définis dans les composants */
</style>
