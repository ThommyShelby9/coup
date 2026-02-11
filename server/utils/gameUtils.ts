import type { Card, CardType } from '~/types'
import { randomBytes } from 'crypto'

/**
 * Génère un code de partie aléatoire de 6 caractères
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclut I, O, 0, 1 pour éviter confusion
  let code = ''
  const bytes = randomBytes(6)

  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length]
  }

  return code
}

/**
 * Crée un deck de cartes Coup standard
 * 3 exemplaires de chaque rôle (15 cartes au total)
 */
export function createDeck(): Card[] {
  const roles: CardType[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa']
  const deck: Card[] = []

  roles.forEach((role) => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        type: role,
        id: `${role}-${i + 1}`
      })
    }
  })

  return deck
}

/**
 * Mélange un deck de cartes (algorithme Fisher-Yates)
 */
export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Détermine si une action peut être bloquée
 */
export function canBlockAction(actionType: string): boolean {
  return ['foreign-aid', 'assassinate', 'steal'].includes(actionType)
}

/**
 * Détermine quels rôles peuvent bloquer une action
 */
export function getBlockingRoles(actionType: string): CardType[] {
  const blockingMap: Record<string, CardType[]> = {
    'foreign-aid': ['Duke'],
    'assassinate': ['Contessa'],
    'steal': ['Captain', 'Ambassador']
  }

  return blockingMap[actionType] || []
}

/**
 * Détermine si une action nécessite un rôle spécifique
 */
export function requiresRole(actionType: string): boolean {
  return ['tax', 'assassinate', 'steal', 'exchange'].includes(actionType)
}

/**
 * Obtient le rôle requis pour une action
 */
export function getRequiredRole(actionType: string): CardType | null {
  const roleMap: Record<string, CardType> = {
    'tax': 'Duke',
    'assassinate': 'Assassin',
    'steal': 'Captain',
    'exchange': 'Ambassador'
  }

  return roleMap[actionType] || null
}

/**
 * Calcule le coût d'une action
 */
export function getActionCost(actionType: string): number {
  const costMap: Record<string, number> = {
    'income': 0,
    'foreign-aid': 0,
    'coup': 7,
    'tax': 0,
    'assassinate': 3,
    'steal': 0,
    'exchange': 0
  }

  return costMap[actionType] || 0
}

/**
 * Vérifie si un joueur a assez de pièces pour une action
 */
export function canAffordAction(coins: number, actionType: string): boolean {
  return coins >= getActionCost(actionType)
}

/**
 * Vérifie si un joueur DOIT faire un coup (10+ pièces)
 */
export function mustCoup(coins: number): boolean {
  return coins >= 10
}
