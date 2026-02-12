<template>
  <div class="game-effects-overlay" aria-hidden="true">
    <!-- Particules d'ambiance -->
    <div v-if="showAmbientParticles" class="ambient-particles">
      <div
        v-for="i in 15"
        :key="`particle-${i}`"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${10 + Math.random() * 10}s`
        }"
      ></div>
    </div>

    <!-- Étoiles scintillantes -->
    <div v-if="showStars" class="stars-container">
      <div
        v-for="i in 30"
        :key="`star-${i}`"
        class="star"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }"
      ></div>
    </div>

    <!-- Vignette d'ambiance -->
    <div class="ambient-vignette"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showAmbientParticles?: boolean
  showStars?: boolean
}

withDefaults(defineProps<Props>(), {
  showAmbientParticles: true,
  showStars: true
})
</script>

<style scoped>
.game-effects-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.ambient-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) scale(1);
    opacity: 0;
  }
}

.stars-container {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

.ambient-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 50%,
    rgba(15, 23, 42, 0.4) 100%
  );
}
</style>
