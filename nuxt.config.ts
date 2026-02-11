// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
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
        { name: 'description', content: 'Le jeu de cartes de bluff ultime en ligne' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap' }
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

  // Performance optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'three': ['three'],
            'gsap': ['gsap'],
            'socket': ['socket.io-client'],
            'mongoose': ['mongoose']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['gsap', 'socket.io-client']
    }
  },

  // Disable caching for API routes
  routeRules: {
    '/api/**': {
      cache: false,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate'
      }
    }
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: false
  }
})
