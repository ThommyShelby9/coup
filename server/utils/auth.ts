import { createHash, randomBytes, pbkdf2Sync } from 'crypto'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

/**
 * Hash un mot de passe avec PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Vérifie si un mot de passe correspond au hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(userId: string, username: string): string {
  const config = useRuntimeConfig()

  return jwt.sign(
    {
      userId,
      username
    },
    config.jwtSecret,
    {
      expiresIn: '7d'
    }
  )
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): { userId: string; username: string } | null {
  const config = useRuntimeConfig()

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; username: string }
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Extrait le token JWT de l'événement H3
 */
export function getTokenFromEvent(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Vérifier aussi les cookies
  const cookie = getCookie(event, 'auth-token')
  return cookie || null
}

/**
 * Middleware pour exiger l'authentification
 */
export async function requireAuth(event: H3Event): Promise<{ userId: string; username: string }> {
  const token = getTokenFromEvent(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    throw createError({
      statusCode: 401,
      message: 'Token invalide ou expiré'
    })
  }

  return decoded
}

/**
 * Middleware optionnel pour récupérer l'utilisateur si authentifié
 */
export function getAuthUser(event: H3Event): { userId: string; username: string } | null {
  const token = getTokenFromEvent(event)

  if (!token) {
    return null
  }

  return verifyToken(token)
}
