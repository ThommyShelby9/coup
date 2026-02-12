<template>
  <div
    class="card-3d"
    :class="{ 'card-interactive': interactive, 'card-selected': selected }"
    :role="interactive ? 'button' : undefined"
    :aria-label="ariaLabel"
    :tabindex="interactive ? 0 : -1"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div
      class="card-inner"
      :style="{ transform: `scaleX(${flipScale})` }"
    >
      <!-- Front -->
      <div v-if="!displayBack" class="card-face card-front">
        <div class="card-border">
          <div class="card-header">
            <h3 class="font-medieval text-xl text-gold-400">{{ card.type }}</h3>
            <Icon :name="roleIcon" class="w-6 h-6 text-gold-400" />
          </div>

          <div class="card-artwork">
            <div class="role-icon">
              <Icon :name="roleIcon" class="w-20 h-20 text-gold-400 opacity-20" />
            </div>
          </div>

          <div class="card-abilities">
            <div
              v-for="(ability, index) in abilities"
              :key="index"
              class="ability-item"
            >
              <Icon name="lucide:chevron-right" class="w-3 h-3" />
              <span>{{ ability }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back -->
      <div v-else class="card-face card-back">
        <div class="card-back-pattern">
          <Icon name="lucide:crown" class="w-24 h-24 text-gold-400 opacity-30" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '~/types'

interface Props {
  card: Card
  interactive?: boolean
  selected?: boolean
  flipped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
  selected: false,
  flipped: false
})

const emit = defineEmits<{
  click: [card: Card]
}>()

const { getRoleIcon, getRoleAbilities } = useRoleData()

const roleIcon = computed(() => getRoleIcon(props.card.type))
const abilities = computed(() => getRoleAbilities(props.card.type))

// Flip 2D : scaleX(1) → scaleX(0) → switch face → scaleX(1)
const displayBack = ref(props.flipped)
const flipScale = ref(1)
let flipTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.flipped, (newVal) => {
  if (flipTimeout) clearTimeout(flipTimeout)

  // Phase 1 : rétrécir à 0
  flipScale.value = 0

  // Phase 2 : à mi-chemin, changer la face affichée puis agrandir
  flipTimeout = setTimeout(() => {
    displayBack.value = newVal
    nextTick(() => {
      flipScale.value = 1
    })
  }, 200)
})

const ariaLabel = computed(() => {
  if (props.flipped) {
    return 'Carte face cachée'
  }
  const abilitiesText = abilities.value.join(', ')
  return `Carte ${props.card.type} - Capacités: ${abilitiesText}`
})

const handleClick = () => {
  if (props.interactive) {
    emit('click', props.card)
  }
}
</script>

<style scoped>
.card-3d {
  width: 180px;
  height: 260px;
  cursor: default;
  position: relative;
}

.card-interactive {
  cursor: pointer;
}

.card-interactive:hover .card-inner {
  filter: brightness(1.2);
}

.card-interactive:hover .card-front {
  box-shadow:
    0 20px 60px rgba(251, 191, 36, 0.4),
    0 0 40px rgba(251, 191, 36, 0.3),
    inset 0 0 20px rgba(251, 191, 36, 0.1);
}

.card-selected .card-inner {
  transform: scale(1.1) translateY(-10px) !important;
  box-shadow:
    0 0 30px rgba(251, 191, 36, 0.65),
    0 0 50px rgba(251, 191, 36, 0.4);
  animation: card-selected-pulse 1.5s ease-in-out infinite;
}

@keyframes card-selected-pulse {
  0%, 100% {
    transform: scale(1.1) translateY(-10px);
  }
  50% {
    transform: scale(1.12) translateY(-12px);
  }
}

.card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease;
}

.card-face {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(251, 191, 36, 0.2);
}

.card-front {
  background:
    linear-gradient(135deg, rgba(251, 191, 36, 0.05), transparent 60%),
    linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #fbbf24;
}

.card-back {
  background:
    radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.2), transparent 50%),
    linear-gradient(135deg, #7c2d12, #9a3412);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #92400e;
}

.card-back-pattern {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
}

.card-border {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #fbbf24;
  padding-bottom: 8px;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(251, 191, 36, 0.5);
}

.card-artwork {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon {
  opacity: 0.3;
}

.card-interactive:hover .role-icon {
  opacity: 0.5;
}

.card-abilities {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.card-interactive:hover .ability-item {
  color: #fbbf24;
}
</style>
