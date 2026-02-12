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
    typeCheck: false
  },

  app: {
    head: {
      title: 'Coup Digital - Jeu de Bluff Royal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Le jeu de cartes de bluff ultime en ligne' },
        { name: 'theme-color', content: '#fbbf24' }
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

  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ['gsap', 'socket.io-client', 'three']
    }
  },

  routeRules: {
    '/api/**': {
      cache: false,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate'
      }
    },
    '/_nuxt/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    },
    '/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    }
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: false
  }
})
