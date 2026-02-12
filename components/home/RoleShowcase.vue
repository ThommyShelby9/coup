<template>
  <div class="role-showcase">
    <h3 class="section-title font-medieval text-3xl text-gold-400 text-center mb-12">
      Les Cinq Rôles
    </h3>

    <div class="cards-container">
      <div
        v-for="(role, index) in roleCards"
        :key="role.id"
        class="role-card-wrapper"
        :style="{ '--index': index }"
      >
        <Card3D
          :card="role"
          :interactive="true"
          class="role-showcase-card"
        />

        <!-- Description du rôle -->
        <div class="role-description glass-panel mt-4 p-4">
          <h4 class="font-medieval text-lg text-gold-400 mb-2">
            {{ roleData[role.type].name }}
          </h4>
          <p class="text-royal-200 text-sm mb-3">
            {{ roleData[role.type].description }}
          </p>
          <div class="abilities-list space-y-1">
            <div
              v-for="(ability, idx) in roleData[role.type].abilities"
              :key="idx"
              class="ability-item text-royal-300 text-xs flex items-start gap-2"
            >
              <Icon name="lucide:star" class="w-3 h-3 text-gold-400 mt-0.5 flex-shrink-0" />
              <span>{{ ability }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card, CardType } from '~/types'
import { roles } from '~/utils/gameRules'
import Card3D from '~/components/game/Card3D.vue'

// Créer les cartes depuis les données de rôles
const roleCards = computed<Card[]>(() => {
  return roles.map((role, index) => ({
    type: role.name as CardType,
    id: `showcase-${role.name.toLowerCase()}-${index}`
  }))
})

// Créer un map des données de rôles pour accès facile
const roleData = computed(() => {
  const map: Record<string, typeof roles[0]> = {}
  roles.forEach(role => {
    map[role.name] = role
  })
  return map
})

// Animation d'entrée avec GSAP
const { staggerFadeIn, cleanup } = useScrollAnimations()

onMounted(() => {
  if (process.client) {
    // Animer les cartes en cascade
    nextTick(() => {
      staggerFadeIn('.role-card-wrapper', {
        trigger: '.role-showcase',
        start: 'top 70%',
        duration: 0.8,
        stagger: 0.2,
        distance: 100
      })
    })
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.role-showcase {
  padding: 4rem 2rem;
}

.section-title {
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.role-card-wrapper {
  flex: 0 0 auto;
  width: 220px;
}

.role-showcase-card {
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.role-showcase-card:hover {
  transform: translateY(-10px) scale(1.05);
}

.role-description {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.role-description:hover {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(30, 41, 59, 0.8);
}

.abilities-list {
  border-top: 1px solid rgba(251, 191, 36, 0.2);
  padding-top: 0.75rem;
}

.ability-item {
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 1024px) {
  .cards-container {
    gap: 1.5rem;
  }

  .role-card-wrapper {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .role-showcase {
    padding: 3rem 1rem;
  }

  .cards-container {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .role-card-wrapper {
    width: 100%;
    max-width: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .role-showcase-card:hover {
    transform: none;
  }
}
</style>
