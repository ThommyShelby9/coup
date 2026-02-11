import { User } from '~/server/models/User'
import { verifyPassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validation
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: 'Username et password sont requis'
      })
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ username: username.toLowerCase() })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Identifiants incorrects'
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Identifiants incorrects'
      })
    }

    // Générer le token JWT
    const token = generateToken(user._id.toString(), user.username)

    // Définir le cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    })

    // Retourner les données utilisateur (sans le password)
    return {
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        stats: user.stats
      },
      token
    }
  } catch (error: any) {
    // Si c'est déjà une erreur HTTP, la relancer
    if (error.statusCode) {
      throw error
    }

    // Sinon, créer une erreur 500
    console.error('Erreur lors de la connexion:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la connexion'
    })
  }
})
