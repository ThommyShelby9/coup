<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="showInstallPrompt" class="fixed bottom-4 right-4 z-50 max-w-sm">
        <div class="glass-panel p-4 border-2 border-gold-500/50 rounded-xl shadow-2xl">
          <div class="flex items-start gap-3">
            <Icon name="lucide:download" class="w-6 h-6 text-gold-400 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-medieval text-lg text-gold-400 mb-1">
                Installer Coup Digital
              </h3>
              <p class="text-royal-200 text-sm mb-3">
                Installez l'app pour un accès rapide et une expérience optimale !
              </p>
              <div class="flex gap-2">
                <button @click="install" class="btn-primary text-sm px-4 py-2 flex-1">
                  Installer
                </button>
                <button @click="dismiss" class="btn-secondary text-sm px-4 py-2 flex-1">
                  Plus tard
                </button>
              </div>
            </div>
            <button @click="dismissPermanently" class="text-royal-400 hover:text-royal-200 transition-colors">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  if (!process.client) return

  // Vérifier si déjà installé ou prompt déjà rejeté
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return
  }

  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed === 'true') {
    return
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e

    // Afficher le prompt après 30 secondes
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 30000)
  })

  // Détecter l'installation réussie
  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})

const install = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('PWA installée')
  }

  deferredPrompt = null
  showInstallPrompt.value = false
}

const dismiss = () => {
  showInstallPrompt.value = false
}

const dismissPermanently = () => {
  if (process.client) {
    localStorage.setItem('pwa-install-dismissed', 'true')
  }
  showInstallPrompt.value = false
}
</script>

<style scoped>
.glass-panel {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(16px);
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
