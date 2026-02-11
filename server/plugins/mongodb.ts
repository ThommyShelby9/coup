import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  try {
    await mongoose.connect(config.mongodbUri)
    console.log('✅ [NUXT-SERVER] MongoDB connected')
    console.log(`[NUXT-SERVER] Database: ${mongoose.connection.name}`)
    console.log(`[NUXT-SERVER] Host: ${mongoose.connection.host}`)
    console.log(`[NUXT-SERVER] Connection ID: ${mongoose.connection.id}`)
  } catch (error) {
    console.error('❌ [NUXT-SERVER] MongoDB connection error:', error)
  }
})
