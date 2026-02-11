<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-900 to-royal-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Retour -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-royal-300 hover:text-gold-400 transition-colors mb-8"
      >
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
        Retour
      </NuxtLink>

      <!-- Formulaire de connexion -->
      <div class="glass-panel p-8">
        <h1 class="font-medieval text-4xl text-gold-400 mb-2 text-center text-glow">
          Entrez dans la Cour
        </h1>
        <p class="text-royal-300 text-center mb-8">
          Connectez-vous pour rejoindre la partie
        </p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-royal-200 mb-2">
              Nom de Cour
            </label>
            <div class="relative">
              <input
                id="username"
                v-model="credentials.username"
                type="text"
                required
                minlength="3"
                maxlength="20"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500
                       text-royal-100 placeholder-royal-500 transition-all"
                placeholder="Entrez votre nom d'utilisateur"
              />
              <Icon
                name="lucide:crown"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 w-5 h-5"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-royal-200 mb-2">
              Mot de Passe
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500
                       text-royal-100 placeholder-royal-500 transition-all"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-royal-400 hover:text-gold-500 transition-colors"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p class="text-red-400 text-sm flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4" />
              {{ error }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full relative overflow-hidden"
          >
            <span v-if="!isLoading">Pénétrer le Château</span>
            <span v-else class="flex items-center justify-center gap-2">
              <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
              Connexion...
            </span>
          </button>
        </form>

        <!-- Inscription -->
        <div class="mt-6 text-center">
          <p class="text-royal-300">
            Pas encore de compte ?
            <NuxtLink
              to="/auth/register"
              class="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              Créer un compte
            </NuxtLink>
          </p>
        </div>

        <!-- Mode invité -->
        <div class="mt-4">
          <button
            @click="loginAsGuest"
            class="w-full py-3 text-royal-300 hover:text-gold-400 border border-royal-600
                   hover:border-gold-500/50 rounded-lg transition-all"
          >
            Continuer en tant qu'invité
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const credentials = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const error = ref('')

const isLoading = computed(() => authStore.isLoading)

const handleLogin = async () => {
  error.value = ''

  try {
    await authStore.login(credentials.username, credentials.password)

    // Rediriger vers le lobby après connexion réussie
    navigateTo('/lobby')
  } catch (e: any) {
    error.value = e.data?.message || 'Identifiants incorrects'
  }
}

const loginAsGuest = () => {
  // Pour l'instant, rediriger directement (à implémenter plus tard)
  navigateTo('/lobby')
}

useHead({
  title: 'Connexion'
})
</script>
