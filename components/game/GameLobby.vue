<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <GlassPanel variant="bordered" padding="md" class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-medieval text-3xl text-gold-400">Salle d'attente</h1>
            <p class="text-royal-300">
              Code: <span class="text-gold-400 font-bold text-xl">{{ game.code }}</span>
            </p>
          </div>
          <NuxtLink to="/lobby" class="btn-secondary">
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            Quitter
          </NuxtLink>
        </div>
      </GlassPanel>

      <!-- Liste des joueurs -->
      <GlassPanel variant="bordered" padding="md" class="mb-6">
        <h2 class="font-medieval text-xl text-gold-400 mb-4">
          Joueurs ({{ game.players.length }}/{{ game.settings.maxPlayers }})
        </h2>

        <div class="grid gap-3">
          <div
            v-for="player in game.players"
            :key="player.userId.toString()"
            class="flex items-center justify-between p-4 bg-royal-800/50 rounded-lg border border-royal-700"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Icon
                  v-if="isBot(player)"
                  name="lucide:bot"
                  class="w-6 h-6 text-royal-900"
                />
                <span v-else class="font-bold text-royal-900 text-lg">
                  {{ player.username[0] }}
                </span>
              </div>

              <!-- Info joueur -->
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-royal-100">{{ player.username }}</span>
                  <span
                    v-if="isBot(player)"
                    class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                  >
                    BOT
                  </span>
                </div>
                <div
                  v-if="player.userId.toString() === game.hostId.toString()"
                  class="text-xs text-gold-400 flex items-center gap-1"
                >
                  <Icon name="lucide:crown" class="w-3 h-3" />
                  Hôte
                </div>
              </div>
            </div>

            <!-- Status -->
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
      </GlassPanel>

      <!-- Actions -->
      <div class="grid lg:grid-cols-3 gap-4">
        <!-- Bouton Prêt -->
        <button
          @click="$emit('toggle-ready')"
          :class="myPlayer?.isReady ? 'btn-secondary' : 'btn-primary'"
          class="lg:col-span-2"
        >
          {{ myPlayer?.isReady ? 'Annuler' : 'Je suis prêt !' }}
        </button>

        <!-- Bouton Démarrer (host uniquement) -->
        <button
          v-if="isHost && allPlayersReady"
          @click="$emit('start-game')"
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

        <!-- Ajouter un bot (host uniquement) -->
        <button
          v-if="isHost && canAddBot"
          @click="$emit('add-bot')"
          :disabled="isAddingBot"
          class="btn-secondary"
        >
          <Icon name="lucide:bot" class="w-5 h-5" />
          {{ isAddingBot ? 'Ajout...' : 'Ajouter un bot' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Game, Player } from '~/types'

interface Props {
  game: Game
  currentUserId: string
  isStarting?: boolean
  isAddingBot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStarting: false,
  isAddingBot: false
})

defineEmits<{
  'toggle-ready': []
  'start-game': []
  'add-bot': []
}>()

// Computed
const myPlayer = computed(() =>
  props.game.players.find((p: Player) => p.userId.toString() === props.currentUserId)
)

const isHost = computed(() =>
  props.game.hostId.toString() === props.currentUserId
)

const allPlayersReady = computed(() =>
  props.game.players.every((p: Player) => p.isReady)
)

const canAddBot = computed(() =>
  props.game.players.length < props.game.settings.maxPlayers
)

// Helpers
const isBot = (player: Player) => {
  return player.username.includes('Bot') ||
         player.username.includes('AI') ||
         player.username.includes('CPU')
}
</script>

<style scoped>
/* Styles spécifiques au lobby si nécessaire */
</style>
