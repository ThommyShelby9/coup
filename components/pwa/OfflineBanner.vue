<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="!isOnline" class="fixed top-0 left-0 right-0 z-50 bg-orange-600 py-3 px-4 shadow-lg">
        <div class="container mx-auto flex items-center justify-center gap-2">
          <Icon name="lucide:wifi-off" class="w-5 h-5 text-white animate-pulse" />
          <span class="text-white font-medium">
            Vous êtes hors ligne
          </span>
          <span class="text-white/80 text-sm ml-2">
            Certaines fonctionnalités peuvent être limitées
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const isOnline = ref(true)

onMounted(() => {
  if (!process.client) return

  // État initial
  isOnline.value = navigator.onLine

  // Écouter les changements de connexion
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
})
</script>

<style scoped>
/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
