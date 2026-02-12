<template>
  <div class="home-page">
    <!-- Background Three.js (uniquement desktop) -->
    <ClientOnly>
      <ThreeBackground />
    </ClientOnly>

    <!-- Fallback animé pour mobile/pas de WebGL -->
    <div class="animated-background"></div>

    <!-- 1. Hero Section -->
    <section id="hero" class="hero-section">
      <div class="hero-content">
        <!-- Logo et titre -->
        <div class="hero-title-wrapper">
          <h1 class="hero-title font-medieval text-glow">
            COUP
          </h1>
          <p class="hero-subtitle font-elegant">
            Le Jeu de Bluff Royal
          </p>
          <div class="online-indicator">
            <span class="online-dot"></span>
            <span class="online-text">{{ playersOnline }} joueurs en ligne</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="hero-cta">
          <NuxtLink to="/auth/login" class="btn-primary btn-large">
            <Icon name="lucide:play" class="w-6 h-6" />
            <span>Commencer à Jouer</span>
            <div class="shine-effect"></div>
          </NuxtLink>
          <NuxtLink to="/lobby" class="btn-secondary btn-large">
            <Icon name="lucide:users" class="w-6 h-6" />
            <span>Rejoindre une Partie</span>
            <div class="shine-effect"></div>
          </NuxtLink>
        </div>

        <!-- Statistiques en temps réel -->
        <div class="stats-grid glass-panel">
          <!-- Loading state -->
          <template v-if="statsLoading">
            <div v-for="i in 3" :key="i" class="stat-item">
              <div class="stat-value">
                <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-gold-400" />
              </div>
              <div class="stat-label">Chargement...</div>
            </div>
          </template>

          <!-- Stats normales -->
          <template v-else>
            <div class="stat-item">
              <div class="stat-value" ref="statGamesPlayed">0</div>
              <div class="stat-label">Parties jouées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" ref="statActivePlayers">0</div>
              <div class="stat-label">Joueurs actifs</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" ref="statLiveGames">0</div>
              <div class="stat-label">Parties en cours</div>
            </div>
          </template>
        </div>

        <!-- Scroll indicator -->
        <div class="scroll-indicator">
          <Icon name="lucide:chevron-down" class="w-6 h-6 text-gold-400" />
          <span class="text-royal-300 text-sm">Découvrez les règles</span>
        </div>
      </div>
    </section>

    <!-- 2. Rules Section -->
    <RulesSection />

    <!-- 3. Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <h2 class="section-title font-medieval text-5xl text-gold-400 text-center mb-4">
          Pourquoi Jouer à Coup Digital ?
        </h2>
        <p class="section-subtitle text-royal-200 text-center text-lg mb-16 max-w-2xl mx-auto">
          Une expérience de jeu moderne et immersive, fidèle au jeu de cartes original
        </p>

        <div class="features-grid">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            class="feature-card"
          />
        </div>
      </div>
    </section>

    <!-- 4. Final CTA Section -->
    <section id="final-cta" class="final-cta-section">
      <div class="container">
        <div class="cta-content glass-panel">
          <Icon name="lucide:crown" class="cta-icon" />
          <h2 class="cta-title font-medieval">
            Prêt à Entrer dans la Cour ?
          </h2>
          <p class="cta-description">
            Rejoignez des milliers de joueurs dans des parties intenses de bluff et de stratégie.
            Gratuit, rapide, et accessible partout.
          </p>
          <div class="cta-buttons">
            <NuxtLink to="/auth/register" class="btn-primary btn-large">
              <Icon name="lucide:user-plus" class="w-6 h-6" />
              <span>Créer un Compte</span>
              <div class="shine-effect"></div>
            </NuxtLink>
            <NuxtLink to="/lobby" class="btn-secondary btn-large">
              <Icon name="lucide:gamepad-2" class="w-6 h-6" />
              <span>Jouer Maintenant</span>
              <div class="shine-effect"></div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="font-medieval text-gold-400 text-xl mb-3">Coup Digital</h3>
            <p class="text-royal-300 text-sm">
              Le jeu de bluff et stratégie en ligne
            </p>
          </div>
          <div class="footer-section">
            <h4 class="text-royal-200 font-medium mb-2">Navigation</h4>
            <ul class="footer-links">
              <li><a href="#hero" class="smooth-scroll">Accueil</a></li>
              <li><a href="#rules" class="smooth-scroll">Règles</a></li>
              <li><a href="#features" class="smooth-scroll">Fonctionnalités</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4 class="text-royal-200 font-medium mb-2">Jouer</h4>
            <ul class="footer-links">
              <li><NuxtLink to="/auth/login">Connexion</NuxtLink></li>
              <li><NuxtLink to="/auth/register">Inscription</NuxtLink></li>
              <li><NuxtLink to="/lobby">Parties</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="text-royal-400 text-sm">
            &copy; 2026 Coup Digital. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { features } from '~/utils/gameRules'
import ThreeBackground from '~/components/3d/ThreeBackground.vue'
import RulesSection from '~/components/home/RulesSection.vue'
import FeatureCard from '~/components/home/FeatureCard.vue'

const playersOnline = ref(0)
const statGamesPlayed = ref<HTMLElement>()
const statActivePlayers = ref<HTMLElement>()
const statLiveGames = ref<HTMLElement>()

const stats = reactive({
  gamesPlayed: 0,
  activePlayers: 0,
  liveGames: 0
})

// Stocker les références pour le cleanup
let scrollIndicatorAnimation: gsap.core.Tween | null = null
const buttonListeners = new Map<Element, () => void>()
const scrollListeners = new Map<Element, (e: Event) => void>()

// Loading state
const statsLoading = ref(true)

// Créer une instance unique de useScrollAnimations
const { countUp, heroTitleEntrance, slideUp, staggerFadeIn, buttonShine, cleanup } = useScrollAnimations()
const { showToast } = useToast()

// Charger les vraies statistiques
const loadStats = async () => {
  statsLoading.value = true
  try {
    const [globalStats, onlineStats] = await Promise.all([
      $fetch('/api/stats/global'),
      $fetch('/api/stats/online')
    ])

    stats.gamesPlayed = globalStats.stats.gamesPlayed
    stats.activePlayers = globalStats.stats.totalUsers
    stats.liveGames = globalStats.stats.activeGames
    playersOnline.value = onlineStats.onlinePlayers

    // Animer les compteurs
    if (process.client) {
      animateCounters()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    showToast({
      type: 'error',
      message: 'Impossible de charger les statistiques. Veuillez réessayer.',
      duration: 5000
    })

    // Fallback : afficher des valeurs par défaut
    stats.gamesPlayed = 0
    stats.activePlayers = 0
    stats.liveGames = 0
  } finally {
    statsLoading.value = false
  }
}

// Animer les compteurs avec GSAP
const animateCounters = () => {
  if (statGamesPlayed.value) {
    countUp(statGamesPlayed.value, stats.gamesPlayed, { duration: 2 })
  }
  if (statActivePlayers.value) {
    countUp(statActivePlayers.value, stats.activePlayers, { duration: 2 })
  }
  if (statLiveGames.value) {
    countUp(statLiveGames.value, stats.liveGames, { duration: 2 })
  }
}

let statsInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadStats()

  // Rafraîchir toutes les 30 secondes
  statsInterval = setInterval(loadStats, 30000)

  // Animations GSAP
  if (process.client) {

    nextTick(() => {
      // Hero title entrance
      heroTitleEntrance('.hero-title-wrapper')

      // Hero CTA buttons
      slideUp('.hero-cta', {
        delay: 0.5,
        duration: 1,
        distance: 60
      })

      // Stats grid
      slideUp('.stats-grid', {
        delay: 0.8,
        duration: 1,
        distance: 60
      })

      // Features cards - Animation désactivée temporairement
      // staggerFadeIn('.feature-card', {
      //   trigger: '.features-section',
      //   start: 'top 70%',
      //   stagger: 0.15,
      //   duration: 0.7
      // })

      // Scroll indicator animation avec référence
      const scrollIndicator = document.querySelector('.scroll-indicator')
      if (scrollIndicator) {
        scrollIndicatorAnimation = gsap.to(scrollIndicator, {
          y: 10,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })
      }

      // Button shine effect on hover avec Map
      const buttons = document.querySelectorAll('.btn-primary, .btn-secondary')
      buttons.forEach(button => {
        const handler = () => buttonShine(button as HTMLElement)
        button.addEventListener('mouseenter', handler)
        buttonListeners.set(button, handler)
      })
    })
  }

  // Smooth scroll pour les liens avec Map
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]')
  smoothScrollLinks.forEach(link => {
    const handler = (e: Event) => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href') || '')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
    link.addEventListener('click', handler)
    scrollListeners.set(link, handler)
  })
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }

  // Kill scroll indicator animation
  if (scrollIndicatorAnimation) {
    scrollIndicatorAnimation.kill()
  }

  // Remove button listeners
  buttonListeners.forEach((handler, button) => {
    button.removeEventListener('mouseenter', handler)
  })
  buttonListeners.clear()

  // Remove scroll listeners
  scrollListeners.forEach((handler, link) => {
    link.removeEventListener('click', handler)
  })
  scrollListeners.clear()

  // Cleanup GSAP animations from composable
  cleanup()
})

useHead({
  title: 'Coup Digital - Le Jeu de Bluff Royal',
  meta: [
    { name: 'description', content: 'Jouez à Coup en ligne ! Jeu de bluff et stratégie avec graphismes 3D, multijoueur en temps réel. Gratuit et accessible partout.' }
  ]
})
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow-x: hidden;
}

.animated-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: animated-bg 20s ease infinite;
}

@keyframes animated-bg {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.hero-content {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.hero-title-wrapper {
  text-align: center;
}

.hero-title {
  font-size: clamp(4rem, 10vw, 8rem);
  color: #fbbf24;
  margin-bottom: 1rem;
  line-height: 1;
  letter-spacing: 0.05em;
}

.hero-subtitle {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.online-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
}

.online-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.online-text {
  font-size: 0.875rem;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.shine-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%) skewX(-12deg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fbbf24;
  font-family: 'Cinzel', serif;
}

.stat-label {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin-top: 0.5rem;
}

.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.scroll-indicator:hover {
  opacity: 0.7;
}

/* Features Section */
.features-section {
  position: relative;
  z-index: 10;
  padding: 6rem 2rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
  min-height: 600px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
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
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.section-subtitle {
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  margin: 0 auto;
}

/* Final CTA Section */
.final-cta-section {
  position: relative;
  z-index: 10;
  padding: 6rem 2rem;
}

.cta-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem;
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 2rem;
}

.cta-icon {
  width: 4rem;
  height: 4rem;
  color: #fbbf24;
  margin: 0 auto 2rem;
}

.cta-title {
  font-size: 3rem;
  color: #fbbf24;
  margin-bottom: 1.5rem;
}

.cta-description {
  font-size: 1.25rem;
  color: #cbd5e1;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

/* Footer */
.site-footer {
  position: relative;
  z-index: 10;
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(251, 191, 36, 0.2);
  padding: 3rem 2rem 1.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #fbbf24;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(251, 191, 36, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-cta {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-content {
    padding: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-background,
  .online-dot,
  .scroll-indicator {
    animation: none;
  }
}
</style>
