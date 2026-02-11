<template>
  <div class="particle-container" ref="container">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :class="particle.type"
      :style="particle.style"
    >
      <Icon v-if="particle.icon" :name="particle.icon" :class="particle.iconClass" />
      <span v-else-if="particle.text" class="particle-text">{{ particle.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Particle {
  id: number
  type: 'coin' | 'star' | 'heart' | 'sparkle' | 'explosion'
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  icon?: string
  text?: string
  iconClass?: string
  style: Record<string, string>
}

interface Props {
  active?: boolean
  type?: 'coin' | 'star' | 'heart' | 'sparkle' | 'explosion'
  count?: number
  duration?: number
  x?: number
  y?: number
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  type: 'sparkle',
  count: 20,
  duration: 2000,
  x: 50,
  y: 50
})

const container = ref<HTMLElement>()
const particles = ref<Particle[]>([])
let particleId = 0
let animationFrame: number | null = null

const createParticle = (): Particle => {
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 3 + 2

  const particleConfig: Record<string, any> = {
    coin: {
      icon: 'lucide:coins',
      iconClass: 'w-6 h-6 text-gold-400',
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2
    },
    star: {
      icon: 'lucide:star',
      iconClass: 'w-4 h-4 text-yellow-400',
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    },
    heart: {
      icon: 'lucide:heart',
      iconClass: 'w-4 h-4 text-red-400',
      vx: Math.cos(angle) * speed * 0.5,
      vy: -Math.abs(Math.sin(angle) * speed)
    },
    sparkle: {
      text: '✨',
      vx: Math.cos(angle) * speed * 0.5,
      vy: Math.sin(angle) * speed * 0.5
    },
    explosion: {
      text: '💥',
      vx: Math.cos(angle) * speed * 1.5,
      vy: Math.sin(angle) * speed * 1.5
    }
  }

  const config = particleConfig[props.type] || particleConfig.sparkle

  return {
    id: particleId++,
    type: props.type,
    x: props.x + (Math.random() - 0.5) * 20,
    y: props.y + (Math.random() - 0.5) * 20,
    vx: config.vx,
    vy: config.vy,
    life: props.duration,
    maxLife: props.duration,
    icon: config.icon,
    text: config.text,
    iconClass: config.iconClass,
    style: {}
  }
}

const updateParticles = () => {
  particles.value = particles.value.filter(p => {
    p.life -= 16 // ~60fps
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.2 // Gravity
    p.vx *= 0.99 // Friction

    const opacity = p.life / p.maxLife
    const scale = 0.5 + (p.life / p.maxLife) * 0.5

    p.style = {
      left: `${p.x}%`,
      top: `${p.y}%`,
      opacity: `${opacity}`,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${(1 - opacity) * 360}deg)`
    }

    return p.life > 0
  })

  if (particles.value.length > 0) {
    animationFrame = requestAnimationFrame(updateParticles)
  } else {
    animationFrame = null
  }
}

const emit = () => {
  for (let i = 0; i < props.count; i++) {
    particles.value.push(createParticle())
  }

  if (animationFrame === null) {
    animationFrame = requestAnimationFrame(updateParticles)
  }
}

watch(() => props.active, (active) => {
  if (active) {
    emit()
  }
})

onMounted(() => {
  if (props.active) {
    emit()
  }
})

onUnmounted(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }
})

defineExpose({ emit })
</script>

<style scoped>
.particle-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.particle {
  position: absolute;
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.particle-text {
  font-size: 1.5rem;
  display: block;
}

.particle.coin {
  animation: coin-spin 1s linear infinite;
}

@keyframes coin-spin {
  0%, 100% {
    filter: drop-shadow(0 2px 8px rgba(251, 191, 36, 0.8));
  }
  50% {
    filter: drop-shadow(0 2px 8px rgba(251, 191, 36, 0.3));
  }
}

.particle.star {
  animation: star-twinkle 0.5s ease-in-out infinite alternate;
}

@keyframes star-twinkle {
  from {
    filter: brightness(1) drop-shadow(0 0 4px rgba(251, 191, 36, 0.8));
  }
  to {
    filter: brightness(1.5) drop-shadow(0 0 8px rgba(251, 191, 36, 1));
  }
}
</style>
