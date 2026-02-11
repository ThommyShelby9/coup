<template>
  <Teleport to="body">
    <Transition name="turn-indicator">
      <div v-if="show" class="turn-indicator-overlay">
        <div class="turn-indicator-content">
          <div class="turn-indicator-crown">
            <Icon name="lucide:crown" class="w-24 h-24 text-gold-400" />
          </div>
          <h2 class="turn-indicator-text">
            Tour de <span class="player-name">{{ playerName }}</span>
          </h2>
          <div class="turn-indicator-particles">
            <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  playerName: string
}

const props = defineProps<Props>()

const getParticleStyle = (index: number) => {
  const angle = (index / 20) * Math.PI * 2
  const distance = 150 + Math.random() * 50
  const duration = 1 + Math.random() * 0.5

  return {
    '--x': `${Math.cos(angle) * distance}px`,
    '--y': `${Math.sin(angle) * distance}px`,
    '--duration': `${duration}s`,
    '--delay': `${index * 0.05}s`
  }
}

// Auto-hide after 2 seconds
watch(() => props.show, (show) => {
  if (show) {
    setTimeout(() => {
      // Le parent doit gérer la fermeture
    }, 2000)
  }
})
</script>

<style scoped>
.turn-indicator-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.turn-indicator-content {
  position: relative;
  text-align: center;
  animation: turn-indicator-zoom 2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes turn-indicator-zoom {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.turn-indicator-crown {
  animation: crown-bounce 0.8s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8));
}

@keyframes crown-bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.turn-indicator-text {
  font-family: 'Cinzel', serif;
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-top: 1rem;
  text-shadow:
    0 0 10px rgba(251, 191, 36, 0.8),
    0 0 20px rgba(251, 191, 36, 0.5),
    0 0 30px rgba(251, 191, 36, 0.3),
    0 4px 20px rgba(0, 0, 0, 0.5);
}

.player-name {
  color: #fbbf24;
  display: inline-block;
  animation: player-name-glow 1.5s ease-in-out infinite;
}

@keyframes player-name-glow {
  0%, 100% {
    text-shadow:
      0 0 20px rgba(251, 191, 36, 1),
      0 0 40px rgba(251, 191, 36, 0.8);
  }
  50% {
    text-shadow:
      0 0 30px rgba(251, 191, 36, 1),
      0 0 60px rgba(251, 191, 36, 1);
  }
}

.turn-indicator-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #fbbf24, transparent);
  border-radius: 50%;
  animation: particle-explode var(--duration) ease-out var(--delay);
}

@keyframes particle-explode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
}

/* Transitions */
.turn-indicator-enter-active {
  transition: opacity 0.3s ease;
}

.turn-indicator-leave-active {
  transition: opacity 0.5s ease;
}

.turn-indicator-enter-from,
.turn-indicator-leave-to {
  opacity: 0;
}
</style>
