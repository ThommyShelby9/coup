<template>
  <div :class="['glass-panel', variantClass, paddingClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'bordered' | 'elevated' | 'subtle'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md'
})

const variantClass = computed(() => {
  const variants = {
    default: 'bg-royal-800/40 backdrop-blur-lg',
    bordered: 'bg-royal-800/40 backdrop-blur-lg border-2 border-gold-500/30',
    elevated: 'bg-royal-800/60 backdrop-blur-lg shadow-2xl border border-gold-500/20',
    subtle: 'bg-royal-800/20 backdrop-blur-sm border border-royal-700/50'
  }
  return variants[props.variant]
})

const paddingClass = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  return paddings[props.padding]
})
</script>

<style scoped>
.glass-panel {
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.glass-panel:hover {
  filter: brightness(1.05);
}
</style>
