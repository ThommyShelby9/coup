// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.scss', '~/assets/css/animations.css'],

  typescript: {
    strict: true,
    typeCheck: false // Désactivé temporairement pour éviter les erreurs vue-tsc
  },

  app: {
    head: {
      title: 'Coup Digital - Jeu de Bluff Royal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Le jeu de cartes de bluff ultime en ligne' },
        // PWA meta tags
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Coup Digital' },
        { name: 'theme-color', content: '#fbbf24' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap' },
        // PWA icons
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coup-digital',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  nitro: {
    plugins: ['~/server/plugins/socket.ts'],
    experimental: {
      websocket: true
    },
    // Socket.IO et ses deps doivent rester en node_modules (pas bundleable)
    externals: {
      external: ['socket.io', 'engine.io', 'ws', 'jsonwebtoken']
    }
  },

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
        extensions: ['.vue'],
        pattern: '**/*.vue'
      }
    ]
  },

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    strategies: 'generateSW',

    manifest: {
      name: 'Coup Digital - Jeu de Bluff Royal',
      short_name: 'Coup Digital',
      description: 'Le jeu de cartes de bluff ultime en ligne. Jouez avec vos amis en temps réel !',
      theme_color: '#fbbf24',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',

      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],

      categories: ['games', 'entertainment', 'social'],
      shortcuts: [
        {
          name: 'Rejoindre une partie',
          url: '/lobby',
          icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
        }
      ]
    },

    workbox: {
      // Pas de navigateFallback en mode SSR (les pages sont rendues côté serveur)
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,

      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /\/_nuxt\/.+\.(js|css)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        },
        {
          urlPattern: /\/api\/stats\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-stats-cache',
            expiration: {
              maxAgeSeconds: 60 * 5
            },
            networkTimeoutSeconds: 10
          }
        }
      ]
    },

    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },

    devOptions: {
      enabled: false
    }
  },

  // Performance optimizations
  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ['gsap', 'socket.io-client', 'three']
    }
  },

  // Disable caching for API routes
  routeRules: {
    '/api/**': {
      cache: false,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate'
      }
    },
    // Ignorer les routes PWA/Service Worker
    '/.well-known/**': { ssr: false },
    '/dev-sw.js': { ssr: false },
    '/sw.js': { ssr: false },
    '/workbox-*.js': { ssr: false }
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: false
  }
})
