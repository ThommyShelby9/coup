<template>
  <div
    class="card-3d"
    :class="{ 'card-interactive': interactive, 'card-selected': selected }"
    @click="handleClick"
  >
    <div class="card-inner" :class="{ 'card-flipped': flipped }">
      <!-- Front -->
      <div class="card-face card-front">
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
      <div class="card-face card-back">
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

const roleIcon = computed(() => {
  const icons: Record<string, string> = {
    Duke: 'lucide:crown',
    Assassin: 'lucide:zap',
    Captain: 'lucide:anchor',
    Ambassador: 'lucide:globe',
    Contessa: 'lucide:shield'
  }
  return icons[props.card.type] || 'lucide:circle'
})

const abilities = computed(() => {
  const abilities: Record<string, string[]> = {
    Duke: ['Taxe: +3 pièces', 'Bloque: Aide étrangère'],
    Assassin: ['Assassine (3 pièces)'],
    Captain: ['Vole 2 pièces', 'Bloque: Vol'],
    Ambassador: ['Échange cartes', 'Bloque: Vol'],
    Contessa: ['Bloque: Assassinat']
  }
  return abilities[props.card.type] || []
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
  perspective: 1000px;
  cursor: default;
  position: relative;
}

.card-interactive {
  cursor: pointer;
}

.card-interactive:hover .card-inner {
  transform: rotateY(10deg) rotateX(-8deg) translateZ(30px) scale(1.05);
  filter: brightness(1.2);
}

.card-interactive:hover .card-front {
  box-shadow:
    0 20px 60px rgba(251, 191, 36, 0.4),
    0 0 40px rgba(251, 191, 36, 0.3),
    inset 0 0 20px rgba(251, 191, 36, 0.1);
}

.card-selected .card-inner {
  transform: scale(1.1) translateY(-10px);
  animation: card-glow 2s ease-in-out infinite;
}

@keyframes card-glow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(251, 191, 36, 0.5),
      0 0 40px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow:
      0 0 40px rgba(251, 191, 36, 0.8),
      0 0 60px rgba(251, 191, 36, 0.5);
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(251, 191, 36, 0.2);
  transition: all 0.4s ease;
}

.card-front {
  background:
    linear-gradient(135deg, rgba(251, 191, 36, 0.05), transparent 60%),
    linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #fbbf24;
  position: relative;
  overflow: visible;
}

.card-front::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(251, 191, 36, 0.1) 50%,
    transparent 70%
  );
  animation: card-shine 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes card-shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.card-back {
  background:
    radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.2), transparent 50%),
    linear-gradient(135deg, #7c2d12, #9a3412);
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #92400e;
}

.card-back-pattern {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pattern-pulse 2s ease-in-out infinite;
}

@keyframes pattern-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.card-border {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
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
  position: relative;
}

.role-icon {
  opacity: 0.3;
  transition: all 0.3s ease;
}

.card-interactive:hover .role-icon {
  opacity: 0.5;
  transform: scale(1.1) rotate(5deg);
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
  transition: all 0.2s ease;
}

.card-interactive:hover .ability-item {
  color: #fbbf24;
  transform: translateX(2px);
}
</style>
