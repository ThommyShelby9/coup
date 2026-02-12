<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="needRefresh" class="fixed bottom-20 right-4 z-50 max-w-sm">
        <div class="glass-panel p-4 border-2 border-emerald-500/50 rounded-xl shadow-2xl">
          <div class="flex items-start gap-3">
            <Icon name="lucide:refresh-cw" class="w-6 h-6 text-emerald-400 flex-shrink-0 animate-spin-slow" />
            <div class="flex-1">
              <h3 class="font-medieval text-lg text-emerald-400 mb-1">
                Mise à jour disponible
              </h3>
              <p class="text-royal-200 text-sm mb-3">
                Une nouvelle version est prête. Actualisez pour profiter des dernières améliorations.
              </p>
              <button @click="updateApp" class="btn-primary text-sm px-4 py-2 w-full">
                <Icon name="lucide:download" class="w-4 h-4 inline mr-2" />
                Mettre à jour
              </button>
            </div>
            <button @click="closeUpdate" class="text-royal-400 hover:text-royal-200 transition-colors">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW()

const updateApp = async () => {
  await updateServiceWorker(true)
}

const closeUpdate = () => {
  needRefresh.value = false
}
</script>

<style scoped>
.glass-panel {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(16px);
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
