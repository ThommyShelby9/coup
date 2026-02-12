<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="particles-burst-container"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`
      }"
    >
      <div
        v-for="i in particleCount"
        :key="`particle-${i}`"
        class="burst-particle"
        :class="particleClass"
        :style="getParticleStyle(i)"
      ></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  position: { x: number; y: number }
  type?: 'success' | 'danger' | 'warning' | 'info'
  particleCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  particleCount: 20
})

const emit = defineEmits<{
  complete: []
}>()

const particleClass = computed(() => {
  const classes = {
    success: 'particle-success',
    danger: 'particle-danger',
    warning: 'particle-warning',
    info: 'particle-info'
  }
  return classes[props.type]
})

const getParticleStyle = (index: number) => {
  const angle = (index / props.particleCount) * Math.PI * 2
  const distance = 50 + Math.random() * 100
  const duration = 0.6 + Math.random() * 0.4
  const delay = Math.random() * 0.2

  return {
    '--angle': `${angle}rad`,
    '--distance': `${distance}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    setTimeout(() => {
      emit('complete')
    }, 1000)
  }
})
</script>

<style scoped>
.particles-burst-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.burst-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: burst-out ease-out forwards;
}

@keyframes burst-out {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform:
      translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      scale(0);
    opacity: 0;
  }
}

.particle-success {
  background: radial-gradient(circle, #10b981 0%, #059669 100%);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
}

.particle-danger {
  background: radial-gradient(circle, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
}

.particle-warning {
  background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
}

.particle-info {
  background: radial-gradient(circle, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
}
</style>
