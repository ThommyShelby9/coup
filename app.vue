<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

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
