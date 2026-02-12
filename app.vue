<template>
  <div>
    <NuxtPage />

    <!-- Composants PWA -->
    <ClientOnly>
      <InstallPrompt />
      <UpdatePrompt />
      <OfflineBanner />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s - Coup Digital',
  htmlAttrs: {
    lang: 'fr'
  }
})
</script>
