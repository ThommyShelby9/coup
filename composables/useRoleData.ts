import type { CardType } from '~/types'
import { roles, actions } from '~/utils/gameRules'

/**
 * Composable pour centraliser les données des rôles
 * Élimine la duplication dans Card3D.vue, pages/game/[code].vue, etc.
 */
export const useRoleData = () => {
  const getRoleIcon = (cardType: CardType): string => {
    const role = roles.find(r => r.name === cardType)
    return role?.icon || 'lucide:circle'
  }

  const getRoleAbilities = (cardType: CardType): string[] => {
    const role = roles.find(r => r.name === cardType)
    return role?.abilities || []
  }

  const getRoleDescription = (cardType: CardType): string => {
    const role = roles.find(r => r.name === cardType)
    return role?.description || ''
  }

  const getRoleColor = (cardType: CardType): string => {
    const role = roles.find(r => r.name === cardType)
    return role?.color || 'blue'
  }

  const getActionLabel = (actionType: string): string => {
    const action = actions.find(a => a.name.toLowerCase() === actionType.toLowerCase())
    return action?.name || actionType
  }

  const getActionIcon = (actionType: string): string => {
    const action = actions.find(a => a.name.toLowerCase() === actionType.toLowerCase())
    return action?.icon || 'lucide:circle'
  }

  const canBlock = (blockingRole: CardType, actionType: string): boolean => {
    const role = roles.find(r => r.name === blockingRole)
    if (!role) return false

    // Duke peut bloquer Foreign Aid
    if (blockingRole === 'Duke' && actionType === 'foreign-aid') return true

    // Captain et Ambassador peuvent bloquer le vol
    if ((blockingRole === 'Captain' || blockingRole === 'Ambassador') && actionType === 'steal') return true

    // Contessa peut bloquer l'assassinat
    if (blockingRole === 'Contessa' && actionType === 'assassinate') return true

    return false
  }

  return {
    // Getters individuels
    getRoleIcon,
    getRoleAbilities,
    getRoleDescription,
    getRoleColor,
    getActionLabel,
    getActionIcon,
    canBlock,

    // Données brutes (pour les cas où on a besoin de toutes les données)
    roles,
    actions
  }
}
