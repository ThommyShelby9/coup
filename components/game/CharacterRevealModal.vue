<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="glass-panel p-8 max-w-md w-full border-2 border-gold-500/50">
      <h2 class="font-medieval text-3xl text-gold-400 text-center mb-6">
        {{ revealData.success ? 'Carte Révélée!' : 'Bluff Échoué!' }}
      </h2>

      <div class="flex justify-center mb-6">
        <Card3D
          :card="revealData.card"
          :flipped="false"
        />
      </div>

      <p class="text-royal-200 text-center text-lg">
        {{ revealData.playerName }}
        {{ revealData.success ? 'avait bien' : "n'avait pas" }}
        <span class="text-gold-400 font-bold">{{ revealData.card.type }}</span>
      </p>

      <div class="mt-6 text-center">
        <button @click="$emit('close')" class="btn-primary px-8">
          Continuer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  revealData: {
    playerName: string
    card: { type: string }
    success: boolean
  }
}

defineProps<Props>()
defineEmits<{ close: [] }>()
</script>

<style scoped>
/* Animation d'entrée */
.glass-panel {
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
