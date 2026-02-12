<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdrop"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div
          class="relative glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
          role="dialog"
          :aria-labelledby="titleId"
          aria-modal="true"
        >
          <!-- Header (optionnel) -->
          <div v-if="$slots.header" class="border-b border-royal-700 p-6">
            <div class="flex items-center justify-between">
              <h2 :id="titleId" class="font-medieval text-2xl text-gold-400">
                <slot name="header" />
              </h2>
              <button
                v-if="closable"
                @click="close"
                class="text-royal-400 hover:text-royal-200 transition-colors"
                aria-label="Fermer"
              >
                <Icon name="lucide:x" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer (optionnel) -->
          <div v-if="$slots.footer" class="border-t border-royal-700 p-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

// ID unique pour l'accessibilité
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)

const handleBackdrop = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const close = () => {
  emit('close')
}

// Fermer avec Escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show && props.closable) {
      close()
    }
  }

  window.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.glass-panel {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(16px);
  border: 2px solid rgba(251, 191, 36, 0.3);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .glass-panel,
.modal-leave-active .glass-panel {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .glass-panel {
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .glass-panel {
  transform: scale(0.95) translateY(20px);
}
</style>
