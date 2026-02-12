<template>
  <div
    class="player-card glass-panel"
    :class="{
      'player-current': isCurrent,
      'player-me': isMe,
      'player-eliminated': !player.isAlive
    }"
    :data-player-id="player.userId"
  >
    <!-- Avatar -->
    <div class="player-avatar">
      <div class="avatar-circle">
        <Icon v-if="isBot" name="lucide:bot" class="w-6 h-6" />
        <span v-else class="text-lg font-bold">{{ player.username[0] }}</span>
      </div>
      <div v-if="isCurrent" class="current-indicator">
        <Icon name="lucide:play" class="w-3 h-3" />
      </div>
    </div>

    <!-- Info -->
    <div class="player-info">
      <p class="player-name">{{ player.username }}</p>
      <div class="player-stats">
        <span class="flex items-center gap-1">
          <Icon name="lucide:coins" class="w-3 h-3" />
          {{ player.coins }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:credit-card" class="w-3 h-3" />
          {{ aliveCardsCount }}
        </span>
      </div>
    </div>

    <!-- Status -->
    <div v-if="!player.isAlive" class="eliminated-badge">
      Éliminé
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types'

interface Props {
  player: Player
  isCurrent?: boolean
  isMe?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  isMe: false
})

const isBot = computed(() =>
  props.player.username.includes('Bot') ||
  props.player.username.includes('AI') ||
  props.player.username.includes('CPU')
)

const aliveCardsCount = computed(() =>
  props.player.cards?.length || 0
)
</script>

<style scoped>
.player-card {
  padding: 0.75rem;
  min-width: 150px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.player-current {
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  animation: current-player-pulse 2s ease-in-out infinite;
}

@keyframes current-player-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), 0 0 10px rgba(251, 191, 36, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.4);
  }
}

.player-me {
  border-color: #10b981;
}

.player-eliminated {
  opacity: 0.5;
  filter: grayscale(1);
  transition: all 0.5s ease;
}

.player-avatar {
  position: relative;
  margin: 0 auto 0.5rem;
  width: 3rem;
  height: 3rem;
}

.avatar-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  transition: transform 0.3s ease;
}

.player-current .avatar-circle {
  animation: avatar-bounce 2s ease-in-out infinite;
}

@keyframes avatar-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.current-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid #0f172a;
  animation: indicator-spin 3s linear infinite;
}

@keyframes indicator-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.player-info {
  margin-bottom: 0.5rem;
}

.player-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 0.25rem;
}

.player-stats {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  font-size: 0.75rem;
  color: #94a3b8;
}

.eliminated-badge {
  padding: 0.25rem 0.5rem;
  background: #dc2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 0.25rem;
  text-transform: uppercase;
}
</style>
