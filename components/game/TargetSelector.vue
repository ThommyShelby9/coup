<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 target-modal-backdrop">
    <div class="glass-panel p-4 sm:p-6 max-w-sm sm:max-w-md w-full target-modal-content">
      <h3 class="font-medieval text-2xl text-gold-400 mb-2 text-center">
        {{ title }}
      </h3>
      <p class="text-royal-300 text-center mb-6 text-sm">
        {{ description }}
      </p>

      <div class="space-y-3 max-h-96 overflow-y-auto">
        <button
          v-for="player in targetablePlayers"
          :key="player.userId"
          @click="selectTarget(player)"
          class="w-full p-4 bg-royal-700 hover:bg-royal-600 rounded-lg border border-royal-500
                 transition-all duration-200 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/20"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
              <span class="font-bold text-royal-900 text-lg">{{ player.username[0] }}</span>
            </div>

            <div class="flex-1 text-left">
              <div class="font-medium text-royal-100 mb-1">{{ player.username }}</div>
              <div class="text-sm text-royal-300 flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:coins" class="w-4 h-4" />
                  {{ player.coins }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:layers" class="w-4 h-4" />
                  {{ player.cardCount }} carte(s)
                </span>
              </div>
            </div>

            <!-- Indicateurs -->
            <div class="flex flex-col items-end gap-1">
              <span
                v-if="player.coins >= 7"
                class="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs"
              >
                ⚠️ Peut faire Coup
              </span>
              <span
                v-if="player.cardCount === 1"
                class="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs"
              >
                🎯 Dernière carte
              </span>
            </div>
          </div>
        </button>
      </div>

      <button
        @click="cancel"
        class="w-full mt-4 p-3 bg-royal-600 hover:bg-royal-500 rounded-lg transition-colors text-royal-100"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Player {
  userId: string
  username: string
  coins: number
  cardCount: number
  isAlive: boolean
}

interface Props {
  players: Player[]
  currentUserId: string
  actionType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [player: Player]
  cancel: []
}>()

const targetablePlayers = computed(() => {
  return props.players.filter(p =>
    p.userId !== props.currentUserId &&
    p.isAlive
  )
})

const title = computed(() => {
  const titles: Record<string, string> = {
    coup: 'Choisir une cible pour le Coup',
    assassinate: 'Choisir une cible à assassiner',
    steal: 'Choisir une cible à voler'
  }
  return titles[props.actionType] || 'Choisir une cible'
})

const description = computed(() => {
  const descriptions: Record<string, string> = {
    coup: 'Cette action coûte 7 pièces et élimine une carte de la cible (non bloquable)',
    assassinate: 'Cette action coûte 3 pièces et élimine une carte (bloquable par Contessa)',
    steal: 'Voler 2 pièces à la cible (bloquable par Captain ou Ambassador)'
  }
  return descriptions[props.actionType] || 'Sélectionnez votre cible'
})

const selectTarget = (player: Player) => {
  emit('select', player)
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.target-modal-backdrop {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.target-modal-content {
  animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

button {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

button:hover {
  transform: translateX(4px);
}

button:active {
  transform: translateX(2px) scale(0.98);
}

/* Effet de ripple au clic */
button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

button:active::after {
  width: 300px;
  height: 300px;
}
</style>
