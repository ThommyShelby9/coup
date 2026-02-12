<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="toastClasses(toast.type)"
        class="glass-panel p-4 rounded-lg border-2 shadow-lg flex items-start gap-3"
      >
        <Icon :name="toast.icon" class="w-5 h-5 flex-shrink-0" />
        <div class="flex-1">
          <p class="font-medium">{{ toast.message }}</p>
        </div>
        <button @click="removeToast(toast.id)" class="text-royal-300 hover:text-royal-100">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const toasts = useState<Toast[]>('toasts', () => [])

interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  icon: string
}

const toastClasses = (type: string) => {
  const classes: Record<string, string> = {
    info: 'border-blue-500 bg-blue-950/80 text-blue-100',
    success: 'border-emerald-500 bg-emerald-950/80 text-emerald-100',
    warning: 'border-yellow-500 bg-yellow-950/80 text-yellow-100',
    error: 'border-red-500 bg-red-950/80 text-red-100'
  }
  return classes[type] || classes.info
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.8) rotate(5deg);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.glass-panel {
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  /* animation: toast-glow 2s ease-in-out infinite; */ /* DÉSACTIVÉ */
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4); /* Style statique */
}

/* @keyframes toast-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
} */

/* Animation toast-shine DÉSACTIVÉE - causait des layout shifts */
/* .glass-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: toast-shine 3s ease-in-out infinite;
} */

/* @keyframes toast-shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
} */

/* Types de toasts avec glow spécifique */
.border-blue-500 {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.border-emerald-500 {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.border-yellow-500 {
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
}

.border-red-500 {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}
</style>
