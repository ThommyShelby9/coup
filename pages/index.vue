<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-900 via-royal-950 to-black overflow-hidden">
    <!-- Arrière-plan avec effets -->
    <div class="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5"></div>

    <!-- Contenu principal -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      <!-- Logo et titre -->
      <div class="text-center mb-12 animate-float">
        <h1 class="font-medieval text-7xl md:text-9xl text-gold-400 mb-4 text-glow">
          COUP
        </h1>
        <p class="font-elegant text-2xl md:text-3xl text-royal-300">
          Le Jeu de Bluff Royal
        </p>
        <div class="mt-4 flex items-center justify-center gap-2 text-royal-400">
          <span class="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
          <span class="text-sm">{{ playersOnline }} joueurs en ligne</span>
        </div>
      </div>

      <!-- Cartes d'exemple avec effet 3D -->
      <div class="flex gap-4 mb-12 perspective-1000">
        <div
          v-for="(card, index) in showcaseCards"
          :key="card"
          class="card-showcase transform transition-transform duration-300 hover:scale-110"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <div class="w-32 h-48 bg-gradient-to-br from-royal-700 to-royal-900 rounded-lg border-2 border-gold-500/50 flex items-center justify-center">
            <span class="font-medieval text-gold-400 text-lg">{{ card }}</span>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <NuxtLink to="/auth/login" class="btn-primary px-12 py-4 text-lg">
          Commencer à Jouer
        </NuxtLink>
        <NuxtLink to="/lobby" class="btn-secondary px-12 py-4 text-lg">
          Rejoindre une Partie
        </NuxtLink>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-3 gap-8 glass-panel p-8 max-w-2xl w-full">
        <div class="text-center">
          <div class="text-3xl font-bold text-gold-400">{{ stats.gamesPlayed }}</div>
          <div class="text-sm text-royal-300 mt-1">Parties jouées</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-gold-400">{{ stats.activePlayers }}</div>
          <div class="text-sm text-royal-300 mt-1">Joueurs actifs</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-gold-400">{{ stats.liveGames }}</div>
          <div class="text-sm text-royal-300 mt-1">Parties en cours</div>
        </div>
      </div>

      <!-- Comment jouer -->
      <div class="mt-12 text-center">
        <button
          @click="showRules = !showRules"
          class="text-royal-300 hover:text-gold-400 transition-colors"
        >
          📖 Comment jouer ?
        </button>
      </div>
    </div>

    <!-- Modal des règles -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showRules = false"
    >
      <div
        class="glass-panel p-8 max-w-2xl max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="font-medieval text-3xl text-gold-400 mb-4">Règles du Coup</h2>

        <div class="space-y-4 text-royal-200">
          <section>
            <h3 class="font-medieval text-xl text-gold-400 mb-2">Objectif</h3>
            <p>Être le dernier joueur en vie en éliminant tous les adversaires.</p>
          </section>

          <section>
            <h3 class="font-medieval text-xl text-gold-400 mb-2">Les Rôles</h3>
            <ul class="space-y-2 list-disc list-inside">
              <li><strong class="text-gold-400">Duke</strong> - Taxe (+3 pièces) | Bloque l'aide étrangère</li>
              <li><strong class="text-gold-400">Assassin</strong> - Assassine (3 pièces)</li>
              <li><strong class="text-gold-400">Captain</strong> - Vole 2 pièces | Bloque le vol</li>
              <li><strong class="text-gold-400">Ambassador</strong> - Échange cartes | Bloque le vol</li>
              <li><strong class="text-gold-400">Contessa</strong> - Bloque les assassinats</li>
            </ul>
          </section>

          <section>
            <h3 class="font-medieval text-xl text-gold-400 mb-2">Bluffer</h3>
            <p>Vous pouvez mentir sur vos rôles ! Mais attention, si quelqu'un conteste et que vous n'avez pas la carte, vous perdez une vie.</p>
          </section>
        </div>

        <button
          @click="showRules = false"
          class="btn-primary w-full mt-6"
        >
          Compris !
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showRules = ref(false)
const playersOnline = ref(0)

const showcaseCards = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa']

const stats = reactive({
  gamesPlayed: 0,
  activePlayers: 0,
  liveGames: 0
})

// Charger les vraies statistiques
const loadStats = async () => {
  try {
    const [globalStats, onlineStats] = await Promise.all([
      $fetch('/api/stats/global'),
      $fetch('/api/stats/online')
    ])

    stats.gamesPlayed = globalStats.stats.gamesPlayed
    stats.activePlayers = globalStats.stats.totalUsers
    stats.liveGames = globalStats.stats.activeGames
    playersOnline.value = onlineStats.onlinePlayers
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

onMounted(() => {
  loadStats()

  // Rafraîchir toutes les 30 secondes
  const interval = setInterval(loadStats, 30000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})

useHead({
  title: 'Accueil'
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.card-showcase {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotateY(0deg);
  }
  50% {
    transform: translateY(-20px) rotateY(10deg);
  }
}
</style>
