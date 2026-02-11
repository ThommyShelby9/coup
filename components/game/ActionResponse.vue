<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="action-response-modal glass-panel p-8 max-w-lg w-full border-2 border-gold-500/50 shadow-2xl">
      <!-- Action annoncée -->
      <div class="text-center mb-6">
        <div class="mb-3">
          <span class="text-royal-300 text-lg">{{ playerName }} annonce :</span>
        </div>

        <div class="bg-royal-700/50 rounded-lg p-5 border border-gold-500/30">
          <div class="flex items-center justify-center gap-4">
            <Icon :name="actionIcon" class="w-10 h-10 text-gold-400" />
            <div>
              <div class="font-medieval text-2xl text-gold-400">
                {{ actionLabel }}
              </div>
              <div v-if="claimedRole" class="text-royal-300 text-sm mt-1">
                en tant que <span class="text-gold-400">{{ claimedRole }}</span>
              </div>
              <div v-if="targetName" class="text-royal-300 text-sm mt-1">
                cible: <span class="text-gold-400">{{ targetName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timer -->
      <div class="mb-6">
        <div class="w-full bg-royal-700 rounded-full h-3 overflow-hidden">
          <div
            class="bg-gradient-to-r from-gold-400 to-gold-600 h-3 rounded-full transition-all duration-1000 ease-linear"
            :style="{ width: `${timeProgress}%` }"
          ></div>
        </div>
        <div class="text-center mt-2 text-royal-300 text-sm">
          {{ timeLeft }}s restantes pour répondre
        </div>
      </div>

      <!-- Options de réponse -->
      <div class="space-y-3">
        <!-- Contester -->
        <button
          v-if="canChallenge"
          @click="challenge"
          class="w-full p-4 bg-gradient-to-r from-red-600 to-red-700
                 hover:from-red-500 hover:to-red-600 rounded-lg font-medium
                 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
        >
          <div class="flex items-center justify-center gap-2">
            <Icon name="lucide:shield-x" class="w-5 h-5" />
            <span>Contester (Je ne crois pas qu'il/elle ait {{ claimedRole }})</span>
          </div>
        </button>

        <!-- Bloquer -->
        <button
          v-if="canBlock"
          @click="showBlockOptions = true"
          class="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700
                 hover:from-blue-500 hover:to-blue-600 rounded-lg font-medium
                 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50"
        >
          <div class="flex items-center justify-center gap-2">
            <Icon name="lucide:shield" class="w-5 h-5" />
            <span>Bloquer avec {{ blockingRoles.join(' ou ') }}</span>
          </div>
        </button>

        <!-- Options de blocage -->
        <div v-if="showBlockOptions && canBlock" class="space-y-2 pl-4">
          <button
            v-for="role in blockingRoles"
            :key="role"
            @click="block(role)"
            class="w-full p-3 bg-blue-600/80 hover:bg-blue-500 rounded-lg transition-colors text-sm"
          >
            Bloquer avec {{ role }}
          </button>
        </div>

        <!-- Accepter -->
        <button
          @click="accept"
          class="w-full p-4 bg-gradient-to-r from-royal-600 to-royal-700
                 hover:from-royal-500 hover:to-royal-600 rounded-lg font-medium
                 transition-all duration-200"
        >
          <div class="flex items-center justify-center gap-2">
            <Icon name="lucide:check" class="w-5 h-5" />
            <span>Accepter l'action</span>
          </div>
        </button>
      </div>

      <!-- Conseil -->
      <div v-if="hint" class="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
        <div class="text-yellow-400 text-sm flex items-start gap-2">
          <Icon name="lucide:lightbulb" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{{ hint }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  playerName: string
  actionType: string
  claimedRole?: string
  targetName?: string
  canChallenge: boolean
  canBlock: boolean
  blockingRoles: string[]
  maxTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTime: 10
})

const emit = defineEmits<{
  challenge: []
  block: [role: string]
  accept: []
}>()

const timeLeft = ref(props.maxTime)
const showBlockOptions = ref(false)

const timeProgress = computed(() => {
  return (timeLeft.value / props.maxTime) * 100
})

const actionIcon = computed(() => {
  const icons: Record<string, string> = {
    income: 'lucide:plus',
    'foreign-aid': 'lucide:hand-heart',
    coup: 'lucide:sword',
    tax: 'lucide:crown',
    assassinate: 'lucide:zap',
    steal: 'lucide:hand',
    exchange: 'lucide:refresh-cw'
  }
  return icons[props.actionType] || 'lucide:circle'
})

const actionLabel = computed(() => {
  const labels: Record<string, string> = {
    income: 'Income (+1)',
    'foreign-aid': 'Aide étrangère (+2)',
    coup: 'Coup',
    tax: 'Taxe (+3)',
    assassinate: 'Assassinat',
    steal: 'Vol',
    exchange: 'Échange'
  }
  return labels[props.actionType] || props.actionType
})

const hint = computed(() => {
  if (props.actionType === 'tax' && props.canChallenge) {
    return 'Contestez si vous pensez que le joueur n\'a pas le Duke'
  }
  if (props.actionType === 'assassinate' && props.canBlock) {
    return 'Vous pouvez bloquer avec Contessa si vous en avez une'
  }
  return null
})

const challenge = () => {
  emit('challenge')
}

const block = (role: string) => {
  emit('block', role)
}

const accept = () => {
  emit('accept')
}

// Timer countdown
onMounted(() => {
  const timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      accept() // Auto-accept après timeout
    }
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>
