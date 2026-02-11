import { User } from '~/server/models/User'
import { hashPassword, generateToken } from '~/server/utils/auth'

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

    // Validation du username
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        message: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères'
      })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw createError({
        statusCode: 400,
        message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'
      })
    }

    // Validation du password
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username: username.toLowerCase() })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Ce nom d\'utilisateur est déjà pris'
      })
    }

    // Créer l'utilisateur
    const hashedPassword = hashPassword(password)

    const newUser = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      avatar: 'default-avatar.png',
      stats: {
        gamesPlayed: 0,
        wins: 0,
        bluffsSuccessful: 0,
        contestationsWon: 0
      }
    })

    // Générer le token JWT
    const token = generateToken(newUser._id.toString(), newUser.username)

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
        id: newUser._id,
        username: newUser.username,
        avatar: newUser.avatar,
        stats: newUser.stats
      },
      token
    }
  } catch (error: any) {
    // Si c'est déjà une erreur HTTP, la relancer
    if (error.statusCode) {
      throw error
    }

    // Sinon, créer une erreur 500
    console.error('Erreur lors de l\'inscription:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du compte'
    })
  }
})
