<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-900 to-royal-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Retour -->
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-2 text-royal-300 hover:text-gold-400 transition-colors mb-8"
      >
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
        Retour à la connexion
      </NuxtLink>

      <!-- Formulaire d'inscription -->
      <div class="glass-panel p-8">
        <h1 class="font-medieval text-4xl text-gold-400 mb-2 text-center text-glow">
          Rejoignez la Cour
        </h1>
        <p class="text-royal-300 text-center mb-8">
          Créez votre compte pour commencer à jouer
        </p>

        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-royal-200 mb-2">
              Nom de Cour
            </label>
            <div class="relative">
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                minlength="3"
                maxlength="20"
                pattern="[a-zA-Z0-9_]+"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500
                       text-royal-100 placeholder-royal-500 transition-all"
                placeholder="Choisissez un nom (3-20 caractères)"
              />
              <Icon
                name="lucide:user"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 w-5 h-5"
              />
            </div>
            <p class="text-xs text-royal-400 mt-1">
              Lettres, chiffres et underscores uniquement
            </p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-royal-200 mb-2">
              Mot de Passe
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500
                       text-royal-100 placeholder-royal-500 transition-all"
                placeholder="Minimum 6 caractères"
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

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-royal-200 mb-2">
              Confirmer le Mot de Passe
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-royal-900/50 border border-royal-600 rounded-lg
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500
                       text-royal-100 placeholder-royal-500 transition-all"
                :class="{ 'border-red-500': passwordMismatch }"
                placeholder="Répétez votre mot de passe"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-royal-400 hover:text-gold-500 transition-colors"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
            <p v-if="passwordMismatch" class="text-xs text-red-400 mt-1">
              Les mots de passe ne correspondent pas
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p class="text-red-400 text-sm flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4" />
              {{ error }}
            </p>
          </div>

          <!-- Success message -->
          <div v-if="success" class="p-3 bg-emerald-900/30 border border-emerald-600/50 rounded-lg">
            <p class="text-emerald-400 text-sm flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-4 h-4" />
              {{ success }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading || passwordMismatch"
            class="btn-primary w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Créer mon Compte</span>
            <span v-else class="flex items-center justify-center gap-2">
              <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
              Création...
            </span>
          </button>
        </form>

        <!-- Login -->
        <div class="mt-6 text-center">
          <p class="text-royal-300">
            Vous avez déjà un compte ?
            <NuxtLink
              to="/auth/login"
              class="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const success = ref('')

const isLoading = computed(() => authStore.isLoading)

const passwordMismatch = computed(() => {
  return formData.confirmPassword.length > 0 &&
         formData.password !== formData.confirmPassword
})

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (passwordMismatch.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    await authStore.register(formData.username, formData.password)

    success.value = 'Compte créé avec succès ! Redirection...'

    setTimeout(() => {
      navigateTo('/lobby')
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la création du compte'
  }
}

useHead({
  title: 'Inscription'
})
</script>
