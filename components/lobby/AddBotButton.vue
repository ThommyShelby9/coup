<template>
  <button
    @click="addBot"
    :disabled="isAdding"
    class="btn-secondary w-full"
  >
    <Icon v-if="!isAdding" name="lucide:bot" class="w-5 h-5" />
    <Icon v-else name="lucide:loader-2" class="w-5 h-5 animate-spin" />
    <span>{{ isAdding ? 'Ajout...' : 'Ajouter un Bot' }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  gameId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'bot-added': [bot: any] }>()

const isAdding = ref(false)

const addBot = async () => {
  isAdding.value = true
  try {
    const response = await $fetch(`/api/game/bot`, {
      method: 'POST',
      body: {
        gameId: props.gameId,
        difficulty: 'medium'
      }
    })

    emit('bot-added', response.bot)
  } catch (error: any) {
    console.error('Error adding bot:', error)
    alert(error.data?.message || 'Erreur lors de l'\''ajout du bot')
  } finally {
    isAdding.value = false
  }
}
</script>
