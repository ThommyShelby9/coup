<template>
  <div class="glass-panel w-80 flex flex-col h-96">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-royal-700">
      <h3 class="font-medieval text-lg text-gold-400 flex items-center gap-2">
        <Icon name="lucide:message-circle" class="w-5 h-5" />
        Chat
      </h3>
      <button
        @click="isMinimized = !isMinimized"
        class="text-royal-300 hover:text-gold-400 transition-colors"
      >
        <Icon :name="isMinimized ? 'lucide:maximize-2' : 'lucide:minimize-2'" class="w-4 h-4" />
      </button>
    </div>

    <div v-if="!isMinimized" class="flex flex-col flex-1 min-h-0">
      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="text-sm"
        >
          <div class="flex items-start gap-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-bold text-royal-900">{{ message.username[0] }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2">
                <span class="font-medium text-gold-400">{{ message.username }}</span>
                <span class="text-xs text-royal-500">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="text-royal-200 break-words">{{ message.text }}</div>
            </div>
          </div>
        </div>

        <div v-if="messages.length === 0" class="text-royal-400 text-center py-8">
          Aucun message pour le moment
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-royal-700">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Écrire un message..."
            maxlength="200"
            class="flex-1 px-3 py-2 bg-royal-900/50 border border-royal-600 rounded-lg
                   focus:outline-none focus:border-gold-500 text-royal-100 text-sm
                   placeholder-royal-500"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim()"
            class="p-2 bg-gold-600 hover:bg-gold-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="lucide:send" class="w-5 h-5 text-royal-950" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  username: string
  text: string
  timestamp: Date
}

interface Props {
  messages: Message[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  send: [text: string]
}>()

const isMinimized = ref(false)
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const sendMessage = () => {
  if (newMessage.value.trim()) {
    emit('send', newMessage.value.trim())
    newMessage.value = ''

    // Auto-scroll to bottom
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Auto-scroll on new messages
watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})
</script>
