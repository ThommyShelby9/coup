<template>
  <div class="game-playing min-h-screen">
    <!-- Game Table (3D ou 2D selon device) -->
    <div class="relative">
      <!-- Players around table -->
      <div class="players-container">
        <div
          v-for="(player, index) in game.players"
          :key="player.userId.toString()"
          class="player-position"
          :style="getPlayerPositionStyle(index)"
          :data-player-id="player.userId"
        >
          <PlayerCard
            :player="player"
            :is-current="isCurrentPlayer(player)"
            :is-me="isMe(player)"
          />
        </div>
      </div>

      <!-- Center info -->
      <div class="center-info">
        <GlassPanel variant="elevated" padding="sm">
          <div class="text-center">
            <p class="text-royal-300 text-sm mb-1">Tour {{ game.turn }}</p>
            <p class="text-gold-400 font-medieval text-lg">
              {{ currentPlayerName }}
            </p>
          </div>
        </GlassPanel>
      </div>

      <!-- My hand (bottom) -->
      <div class="my-hand-container">
        <PlayerHand
          :cards="myCards"
          :coins="myCoins"
          :is-my-turn="isMyTurn"
          @execute-action="$emit('execute-action', $event)"
        />
      </div>
    </div>

    <!-- Action Response Modal -->
    <ActionResponse
      v-if="showActionResponse"
      :action="pendingAction"
      :can-challenge="canChallenge"
      :can-block="canBlock"
      @challenge="$emit('challenge')"
      @block="$emit('block', $event)"
      @accept="$emit('accept')"
    />

    <!-- Target Selector Modal -->
    <TargetSelector
      v-if="showTargetSelector"
      :players="targetablePlayers"
      @select="$emit('target-selected', $event)"
      @cancel="$emit('cancel-target')"
    />

    <!-- Chat (side) -->
    <GameChat
      :messages="chatMessages"
      @send="$emit('send-chat', $event)"
      class="chat-sidebar"
    />
  </div>
</template>

<script setup lang="ts">
import type { Game, Player, Card, ChatMessage, Action } from '~/types'

interface Props {
  game: Game
  currentUserId: string
  chatMessages: ChatMessage[]
  showActionResponse?: boolean
  showTargetSelector?: boolean
  pendingAction?: any
}

const props = withDefaults(defineProps<Props>(), {
  showActionResponse: false,
  showTargetSelector: false
})

defineEmits<{
  'execute-action': [action: any]
  'challenge': []
  'block': [role: string]
  'accept': []
  'target-selected': [player: Player]
  'cancel-target': []
  'send-chat': [message: string]
}>()

// Computed
const currentPlayer = computed(() =>
  props.game.players[props.game.currentPlayer]
)

const currentPlayerName = computed(() =>
  currentPlayer.value?.username || 'En attente...'
)

const myPlayer = computed(() =>
  props.game.players.find((p: Player) => p.userId.toString() === props.currentUserId)
)

const myCards = computed(() => myPlayer.value?.cards || [])
const myCoins = computed(() => myPlayer.value?.coins || 0)

const isMyTurn = computed(() =>
  currentPlayer.value?.userId.toString() === props.currentUserId
)

const targetablePlayers = computed(() =>
  props.game.players.filter((p: Player) =>
    p.isAlive && p.userId.toString() !== props.currentUserId
  )
)

const canChallenge = computed(() => {
  // Logique pour déterminer si on peut contester
  return !isMyTurn.value && props.pendingAction?.claimedRole
})

const canBlock = computed(() => {
  // Logique pour déterminer si on peut bloquer
  return !isMyTurn.value && props.pendingAction?.canBeBlocked
})

// Helpers
const isCurrentPlayer = (player: Player) => {
  return player.userId.toString() === currentPlayer.value?.userId.toString()
}

const isMe = (player: Player) => {
  return player.userId.toString() === props.currentUserId
}

const getPlayerPositionStyle = (index: number) => {
  const total = props.game.players.length
  const angle = (index / total) * 2 * Math.PI
  const radius = 40 // percentage

  const x = 50 + radius * Math.cos(angle - Math.PI / 2)
  const y = 50 + radius * Math.sin(angle - Math.PI / 2)

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  }
}
</script>

<style scoped>
.game-playing {
  position: relative;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.players-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 800px;
  margin: 0 auto;
}

.player-position {
  position: absolute;
  z-index: 10;
}

.center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.my-hand-container {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: auto;
}

.chat-sidebar {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 30;
}

@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
}
</style>
