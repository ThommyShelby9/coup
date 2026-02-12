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
  },
  script: [
    {
      innerHTML: `
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            registrations.forEach(function(registration) {
              registration.unregister();
              console.log('[SW] Unregistered stale service worker');
            });
          });
          if (caches) {
            caches.keys().then(function(names) {
              names.forEach(function(name) {
                caches.delete(name);
                console.log('[SW] Deleted cache:', name);
              });
            });
          }
        }
      `,
      type: 'text/javascript'
    }
  ]
})
</script>
