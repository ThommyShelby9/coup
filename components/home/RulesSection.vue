<template>
  <section id="rules" class="rules-section">
    <div class="container">
      <!-- Header de la section -->
      <div class="rules-header">
        <h2 class="main-title font-medieval text-5xl text-gold-400 text-center mb-4">
          Règles du Jeu
        </h2>
        <p class="subtitle text-royal-200 text-center text-lg mb-16 max-w-2xl mx-auto">
          Maîtrisez l'art du bluff et de la déduction pour survivre dans cette
          cour royale pleine de traîtres et de conspirateurs.
        </p>
      </div>

      <!-- A. Objectif du jeu -->
      <div class="objective-section mb-20">
        <div class="glass-panel p-8 text-center max-w-3xl mx-auto">
          <Icon name="lucide:trophy" class="w-16 h-16 text-gold-400 mx-auto mb-4" />
          <h3 class="font-medieval text-3xl text-gold-400 mb-4">Objectif</h3>
          <p class="text-royal-100 text-xl leading-relaxed">
            Être le dernier joueur en vie en éliminant tous les adversaires.
            Chaque joueur commence avec 2 cartes de rôle (influences) - perdre
            les deux signifie l'élimination !
          </p>
        </div>
      </div>

      <!-- B. Setup et démarrage -->
      <div class="setup-section mb-20">
        <h3 class="section-heading font-medieval text-3xl text-gold-400 text-center mb-8">
          Configuration de la Partie
        </h3>
        <div class="setup-grid">
          <div
            v-for="item in setupItems"
            :key="item.text"
            class="setup-card glass-panel"
          >
            <div class="setup-icon">
              <Icon :name="item.icon" class="w-8 h-8 text-gold-400" />
            </div>
            <p class="setup-text">{{ item.text }}</p>
          </div>
        </div>
      </div>

      <!-- C. Rôles interactifs -->
      <div class="roles-section mb-20">
        <RoleShowcase />
      </div>

      <!-- D. Actions disponibles -->
      <div class="actions-section mb-20">
        <ActionTable />
      </div>

      <!-- E. Mécanique de bluff/challenge -->
      <div class="challenge-section mb-20">
        <ChallengeFlow />
      </div>

      <!-- F. Déroulement d'un tour -->
      <div class="turn-flow-section">
        <h3 class="section-heading font-medieval text-3xl text-gold-400 text-center mb-12">
          Déroulement d'un Tour
        </h3>
        <div class="turn-steps">
          <div
            v-for="step in turnSteps"
            :key="step.number"
            class="turn-step glass-panel"
          >
            <div class="step-number-badge">{{ step.number }}</div>
            <div class="step-icon-container">
              <Icon :name="step.icon" class="w-10 h-10 text-gold-400" />
            </div>
            <div class="step-details">
              <h4 class="step-title font-medieval text-xl text-gold-400 mb-2">
                {{ step.title }}
              </h4>
              <p class="step-description text-royal-200">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section de synthèse -->
      <div class="summary-section glass-panel mt-20 p-8">
        <div class="flex items-start gap-4">
          <Icon name="lucide:sparkles" class="w-8 h-8 text-gold-400 flex-shrink-0 mt-1" />
          <div>
            <h3 class="font-medieval text-2xl text-gold-400 mb-3">
              L'Essence de Coup
            </h3>
            <p class="text-royal-200 leading-relaxed mb-4">
              Coup est un jeu rapide et intense où le bluff est roi. Vous pouvez
              prétendre avoir n'importe quel rôle à n'importe quel moment, mais
              attention : un adversaire peut vous contester et vous forcer à révéler
              vos cartes. Mentez avec assurance, déduisez avec précision, et survivez
              jusqu'au bout !
            </p>
            <div class="key-points grid md:grid-cols-3 gap-4">
              <div class="key-point">
                <Icon name="lucide:shield" class="w-5 h-5 text-emerald-400 mb-2" />
                <p class="text-sm text-royal-300">
                  Bluffez pour utiliser des rôles que vous n'avez pas
                </p>
              </div>
              <div class="key-point">
                <Icon name="lucide:eye" class="w-5 h-5 text-blue-400 mb-2" />
                <p class="text-sm text-royal-300">
                  Observez les patterns de vos adversaires
                </p>
              </div>
              <div class="key-point">
                <Icon name="lucide:zap" class="w-5 h-5 text-orange-400 mb-2" />
                <p class="text-sm text-royal-300">
                  Parties rapides de 5 à 15 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { setupItems, turnSteps } from '~/utils/gameRules'
import RoleShowcase from './RoleShowcase.vue'
import ActionTable from './ActionTable.vue'
import ChallengeFlow from './ChallengeFlow.vue'

const { staggerFadeIn, cleanup } = useScrollAnimations()

onMounted(() => {
  if (process.client) {
    nextTick(() => {
      // Animation centralisée : Un seul ScrollTrigger pour toute la section
      // Anime tous les enfants directs avec un effet stagger
      staggerFadeIn('.rules-section > .container > *', {
        trigger: '.rules-section',
        start: 'top 80%',
        stagger: 0.1,
        duration: 0.8
      })
    })
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.rules-section {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.5), transparent);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.rules-header {
  margin-bottom: 4rem;
}

.main-title {
  position: relative;
  display: inline-block;
  width: 100%;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.section-heading {
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.objective-section .glass-panel {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.setup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.setup-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.setup-card:hover {
  border-color: rgba(251, 191, 36, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.1);
}

.setup-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 1rem;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.setup-text {
  font-size: 1rem;
  font-weight: 500;
  color: #cbd5e1;
  text-align: center;
  line-height: 1.5;
}

.turn-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.turn-step {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.turn-step:hover {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(30, 41, 59, 0.6);
  transform: translateX(8px);
}

.step-number-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fbbf24;
  color: #0f172a;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 50%;
}

.step-icon-container {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 1rem;
}

.step-details {
  flex: 1;
}

.step-title {
  margin-bottom: 0.5rem;
}

.step-description {
  font-size: 0.95rem;
  line-height: 1.6;
}

.summary-section {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 1.5rem;
}

.key-points {
  margin-top: 1rem;
}

.key-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

/* Responsive */
@media (max-width: 1024px) {
  .rules-section {
    padding: 4rem 0;
  }

  .container {
    padding: 0 1.5rem;
  }

  .main-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .rules-section {
    padding: 3rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .section-heading {
    font-size: 1.75rem;
  }

  .setup-grid {
    grid-template-columns: 1fr;
  }

  .turn-step {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .turn-step:hover {
    transform: translateY(-4px);
  }

  .step-number-badge {
    top: 0.75rem;
    left: 0.75rem;
  }

  .key-points {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .setup-card:hover,
  .turn-step:hover {
    transform: none;
  }
}
</style>
