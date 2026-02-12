<template>
  <div class="animated-background">
    <!-- Gradient animé - DÉSACTIVÉ temporairement pour performances -->
    <!-- <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div> -->

    <!-- Particules flottantes - DÉSACTIVÉES temporairement pour performances -->
    <!-- <div v-if="mounted" class="floating-particles">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="floating-particle"
        :style="particle.style"
      >
        <Icon name="lucide:sparkles" class="w-2 h-2 text-gold-400/30" />
      </div>
    </div> -->

    <!-- Grille hexagonale subtile -->
    <div class="hex-grid"></div>

    <!-- Effet de vignette -->
    <div class="vignette"></div>
  </div>
</template>

<script setup lang="ts">
interface Particle {
  id: number
  style: Record<string, string>
}

const mounted = ref(false)
const particles = ref<Particle[]>([])
const particleCount = 20 // Réduit de 30 à 20 pour meilleures performances

onMounted(() => {
  // Générer les particules uniquement côté client
  particles.value = Array.from({ length: particleCount }, (_, i) => {
    const x = Math.random() * 100
    const y = Math.random() * 100
    const duration = 15 + Math.random() * 15
    const delay = Math.random() * 5
    const size = 0.5 + Math.random() * 1.5

    return {
      id: i,
      style: {
        left: `${x}%`,
        top: `${y}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        transform: `scale(${size})`
      }
    }
  })

  mounted.value = true
})
</script>

<style scoped>
.animated-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

/* Orbes de gradient animés */
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px); /* Réduit de 80px à 60px pour meilleures performances */
  opacity: 0.2; /* Réduit l'opacité pour effet plus subtil */
  animation: float 20s ease-in-out infinite;
  will-change: transform; /* Optimisation GPU */
  /* Force composition layer pour éviter layout shift */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent);
  top: -250px;
  left: -250px;
  animation-duration: 25s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent);
  bottom: -200px;
  right: -200px;
  animation-duration: 30s;
  animation-delay: -5s;
}

.orb-3 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 35s;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(50px, -50px, 0) scale(1.05);
  }
  66% {
    transform: translate3d(-30px, 30px, 0) scale(0.95);
  }
}

/* Particules flottantes */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-particle {
  position: absolute;
  animation: particle-float linear infinite;
  will-change: transform, opacity;
  transform: translateZ(0);
}

@keyframes particle-float {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translate3d(50px, -100vh, 0) rotate(360deg);
    opacity: 0;
  }
}

/* Grille hexagonale */
.hex-grid {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(251, 191, 36, 0.02) 0px,
      transparent 1px,
      transparent 60px,
      rgba(251, 191, 36, 0.02) 61px
    ),
    repeating-linear-gradient(
      60deg,
      rgba(251, 191, 36, 0.02) 0px,
      transparent 1px,
      transparent 60px,
      rgba(251, 191, 36, 0.02) 61px
    ),
    repeating-linear-gradient(
      120deg,
      rgba(251, 191, 36, 0.02) 0px,
      transparent 1px,
      transparent 60px,
      rgba(251, 191, 36, 0.02) 61px
    );
  opacity: 0.5;
}

/* Vignette */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none;
}
</style>
