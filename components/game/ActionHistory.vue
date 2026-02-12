<template>
  <div class="glass-panel p-3 sm:p-4 w-full sm:w-80 sm:max-w-xs">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-medieval text-lg text-gold-400">Historique</h3>
      <button
        @click="isCollapsed = !isCollapsed"
        class="text-royal-300 hover:text-gold-400 transition-colors"
      >
        <Icon
          :name="isCollapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'"
          class="w-5 h-5"
        />
      </button>
    </div>

    <!-- Utiliser Transition + max-height au lieu de v-if pour éviter layout shift -->
    <Transition
      name="collapse"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
    >
      <div
        v-show="!isCollapsed"
        class="space-y-2 overflow-y-auto collapse-content"
        :style="{ maxHeight: isCollapsed ? '0' : '24rem' }"
      >
        <div
          v-for="(action, index) in recentActions"
          :key="index"
          class="p-3 bg-royal-800/30 rounded-lg text-sm action-item"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="flex items-start gap-2">
            <Icon :name="getActionIcon(action.type)" class="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <div class="text-royal-100">
                <span class="font-medium text-gold-400">{{ getPlayerName(action.playerId) }}</span>
                {{ getActionText(action) }}
              </div>
              <div class="text-royal-400 text-xs mt-1">
                {{ formatTime(action.timestamp) }}
              </div>
            </div>
            <div v-if="action.contested" class="flex-shrink-0">
              <span class="px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-xs">
                Contesté
              </span>
            </div>
          </div>
        </div>

        <div v-if="actions.length === 0" class="text-royal-400 text-center py-4">
          Aucune action pour le moment
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Action } from '~/types'

interface Props {
  actions: Action[]
  players: any[]
}

const props = defineProps<Props>()

const isCollapsed = ref(false)

const recentActions = computed(() => {
  return [...props.actions].reverse().slice(0, 10)
})

const getPlayerName = (playerId: any) => {
  const player = props.players.find(p => p.userId.toString() === playerId.toString())
  return player?.username || 'Inconnu'
}

const getActionIcon = (type: string) => {
  const icons: Record<string, string> = {
    income: 'lucide:plus',
    'foreign-aid': 'lucide:hand-heart',
    coup: 'lucide:sword',
    tax: 'lucide:crown',
    assassinate: 'lucide:zap',
    steal: 'lucide:hand',
    exchange: 'lucide:refresh-cw',
    block: 'lucide:shield'
  }
  return icons[type] || 'lucide:circle'
}

const getActionText = (action: Action) => {
  const texts: Record<string, string> = {
    income: 'a pris 1 pièce (Income)',
    'foreign-aid': 'a pris 2 pièces (Aide)',
    coup: 'a fait un Coup',
    tax: 'a pris 3 pièces (Taxe)',
    assassinate: 'a assassiné',
    steal: 'a volé',
    exchange: 'a échangé ses cartes',
    block: 'a bloqué'
  }

  let text = texts[action.type] || action.type

  if (action.claimedRole) {
    text += ` (${action.claimedRole})`
  }

  if (action.target) {
    const targetName = getPlayerName(action.target)
    text += ` → ${targetName}`
  }

  return text
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Handlers pour transition smooth
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = '0'
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = '24rem'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.maxHeight = '0'
}
</script>

<style scoped>
.collapse-content {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  will-change: max-height;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.2s ease-in-out;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0 !important;
  opacity: 0;
}

.action-item {
  animation: action-slide-in 0.4s ease-out backwards;
  transition: all 0.2s ease;
}

.action-item:hover {
  transform: translateX(4px);
  background: rgba(30, 41, 59, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@keyframes action-slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.glass-panel {
  transition: all 0.3s ease;
}

button {
  transition: all 0.2s ease;
}

button:hover {
  transform: scale(1.1);
}
</style>
