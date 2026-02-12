import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const mongoUri = config.mongodbUri

  if (!mongoUri || mongoUri === 'mongodb://localhost:27017/coup-digital') {
    console.warn('⚠️ [NUXT-SERVER] MONGODB_URI not configured, skipping MongoDB connection')
    return
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    })
    console.log('✅ [NUXT-SERVER] MongoDB connected')
    console.log(`[NUXT-SERVER] Database: ${mongoose.connection.name}`)
    console.log(`[NUXT-SERVER] Host: ${mongoose.connection.host}`)
  } catch (error: any) {
    console.error('❌ [NUXT-SERVER] MongoDB connection error:', error?.message || error)
    console.warn('⚠️ [NUXT-SERVER] Server will continue without MongoDB')
  }
})
