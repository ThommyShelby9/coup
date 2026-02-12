<template>
  <div class="challenge-flow-container">
    <h3 class="section-title font-medieval text-2xl text-gold-400 text-center mb-8">
      Mécanique de Contestation
    </h3>

    <div class="flow-diagram">
      <div
        v-for="(step, index) in challengeSteps"
        :key="index"
        class="flow-step"
        :class="`flow-step-${index + 1}`"
      >
        <!-- Icône de l'étape -->
        <div class="step-icon" :style="{ '--step-color': getStepColor(step.color) }">
          <Icon :name="step.icon" class="w-8 h-8" />
        </div>

        <!-- Contenu de l'étape -->
        <div class="step-content glass-panel">
          <div class="step-number">Étape {{ index + 1 }}</div>
          <h4 class="step-title font-medieval">{{ step.title }}</h4>
          <p class="step-description">{{ step.description }}</p>
        </div>

        <!-- Flèche vers l'étape suivante -->
        <div v-if="index < challengeSteps.length - 1" class="flow-arrow">
          <Icon name="lucide:arrow-down" class="w-6 h-6 text-gold-400" />
        </div>
      </div>
    </div>

    <!-- Exemple pratique -->
    <div class="example-section glass-panel mt-8 p-6">
      <div class="flex items-start gap-3 mb-4">
        <Icon name="lucide:lightbulb" class="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
        <div>
          <h4 class="font-medieval text-lg text-gold-400 mb-2">Exemple Pratique</h4>
          <p class="text-royal-200 text-sm leading-relaxed mb-3">
            Alice annonce "Je prends 3 pièces avec le Duke". Bob suspecte qu'Alice bluffe
            et décide de contester.
          </p>
        </div>
      </div>

      <div class="example-outcomes space-y-3">
        <div class="outcome-case">
          <div class="outcome-header">
            <Icon name="lucide:check-circle" class="w-5 h-5 text-emerald-400" />
            <span class="font-medium text-emerald-400">Cas 1 : Alice a vraiment le Duke</span>
          </div>
          <p class="outcome-description">
            Alice révèle sa carte Duke, Bob perd une influence. Alice mélange son Duke
            dans le deck et en pioche une nouvelle carte.
          </p>
        </div>

        <div class="outcome-case">
          <div class="outcome-header">
            <Icon name="lucide:x-circle" class="w-5 h-5 text-red-400" />
            <span class="font-medium text-red-400">Cas 2 : Alice bluffait</span>
          </div>
          <p class="outcome-description">
            Alice ne peut pas montrer de Duke, elle perd une influence. Bob a bien
            démasqué le bluff !
          </p>
        </div>
      </div>
    </div>

    <!-- Tips stratégiques -->
    <div class="tips-section mt-6">
      <div class="tips-grid">
        <div class="tip-card glass-panel">
          <Icon name="lucide:brain" class="w-6 h-6 text-purple-400 mb-2" />
          <h5 class="font-medium text-royal-100 mb-1">Bluffer avec Prudence</h5>
          <p class="text-royal-300 text-xs">
            Plus vous bluffez souvent, plus les autres seront suspicieux
          </p>
        </div>

        <div class="tip-card glass-panel">
          <Icon name="lucide:eye" class="w-6 h-6 text-blue-400 mb-2" />
          <h5 class="font-medium text-royal-100 mb-1">Observer les Patterns</h5>
          <p class="text-royal-300 text-xs">
            Notez quelles actions chaque joueur utilise fréquemment
          </p>
        </div>

        <div class="tip-card glass-panel">
          <Icon name="lucide:target" class="w-6 h-6 text-red-400 mb-2" />
          <h5 class="font-medium text-royal-100 mb-1">Timing de Contestation</h5>
          <p class="text-royal-300 text-xs">
            Contester tôt pour éliminer les menaces, ou tard pour les prendre par surprise
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { challengeSteps } from '~/utils/gameRules'

const getStepColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: '#3b82f6',
    orange: '#f97316',
    purple: '#8b5cf6',
    red: '#dc2626',
    emerald: '#10b981',
    gold: '#fbbf24'
  }
  return colors[color] || colors.blue
}

const { staggerFadeIn, cleanup } = useScrollAnimations()

onMounted(() => {
  if (process.client) {
    nextTick(() => {
      staggerFadeIn('.flow-step', {
        trigger: '.challenge-flow-container',
        start: 'top 70%',
        duration: 0.7,
        stagger: 0.25,
        distance: 80
      })
    })
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.challenge-flow-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.section-title {
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.flow-step {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--step-color, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 0 20px var(--step-color, #3b82f6);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px var(--step-color, #3b82f6);
  }
  50% {
    box-shadow: 0 0 30px var(--step-color, #3b82f6), 0 0 40px var(--step-color, #3b82f6);
  }
}

.step-content {
  width: 100%;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.step-content:hover {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(30, 41, 59, 0.7);
  transform: translateY(-2px);
}

.step-number {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.step-title {
  font-size: 1.25rem;
  color: #fbbf24;
  margin-bottom: 0.75rem;
}

.step-description {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.flow-arrow {
  margin: 0.5rem 0;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

.example-section {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
}

.example-outcomes {
  margin-left: 2.25rem;
}

.outcome-case {
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.outcome-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.outcome-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-left: 1.75rem;
}

.tips-section {
  margin-top: 2rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tip-card {
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 0.75rem;
  text-align: center;
  transition: all 0.3s ease;
}

.tip-card:hover {
  border-color: rgba(251, 191, 36, 0.4);
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 768px) {
  .challenge-flow-container {
    padding: 1rem;
  }

  .flow-step {
    max-width: 100%;
  }

  .step-icon {
    width: 3rem;
    height: 3rem;
  }

  .step-content {
    padding: 1rem;
  }

  .step-title {
    font-size: 1rem;
  }

  .example-section {
    padding: 1rem;
  }

  .example-outcomes {
    margin-left: 0;
  }

  .outcome-description {
    margin-left: 0;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-step {
    opacity: 1;
    transform: none;
  }

  .step-icon {
    animation: none;
  }

  .flow-arrow {
    animation: none;
  }

  .step-content:hover,
  .tip-card:hover {
    transform: none;
  }
}
</style>
