<template>
  <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="glass-panel p-12 max-w-2xl w-full border-2 border-gold-500">
      <!-- Confetti animation container -->
      <div ref="confettiContainer" class="absolute inset-0 pointer-events-none"></div>

      <div class="text-center relative z-10">
        <Icon name="lucide:crown" class="w-24 h-24 text-gold-400 mx-auto mb-6 animate-bounce" />

        <h1 class="font-medieval text-6xl text-gold-400 mb-4 text-glow">
          Victoire Royale!
        </h1>

        <div class="mb-8">
          <div class="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600
                      flex items-center justify-center mx-auto mb-4">
            <span class="font-medieval text-5xl text-royal-900">
              {{ winner.username[0] }}
            </span>
          </div>
          <p class="text-2xl text-royal-100 font-medium">{{ winner.username }}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="glass-panel p-4">
            <div class="text-3xl font-bold text-gold-400">{{ gameStats.turns }}</div>
            <div class="text-sm text-royal-300">Tours</div>
          </div>
          <div class="glass-panel p-4">
            <div class="text-3xl font-bold text-gold-400">{{ gameStats.bluffs }}</div>
            <div class="text-sm text-royal-300">Bluffs</div>
          </div>
          <div class="glass-panel p-4">
            <div class="text-3xl font-bold text-gold-400">{{ gameStats.duration }}</div>
            <div class="text-sm text-royal-300">Minutes</div>
          </div>
        </div>

        <button @click="$emit('return-to-lobby')" class="btn-primary px-12 py-4 text-lg">
          Retour au Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

interface Props {
  winner: { username: string }
  gameStats: {
    turns: number
    bluffs: number
    duration: string
  }
}

defineProps<Props>()
defineEmits<{ 'return-to-lobby': [] }>()

const confettiContainer = ref<HTMLElement>()

onMounted(() => {
  // Trigger confetti animation using GSAP
  // Will be implemented in Phase 4 when animations are integrated
  console.log('Victory modal mounted - confetti animation will be added in Phase 4')
})
</script>

<style scoped>
/* Animation d'entrée */
.glass-panel {
  animation: modalEnter 0.4s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation de la couronne */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>
