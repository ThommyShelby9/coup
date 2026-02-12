// Données centralisées pour les règles du jeu Coup

export interface RoleData {
  name: string
  icon: string
  color: string
  abilities: string[]
  description: string
}

export interface ActionData {
  name: string
  cost: number
  effect: string
  blockable: boolean
  blocker?: string
  challengeable: boolean
  role?: string
}

export interface SetupItem {
  icon: string
  text: string
}

export interface TurnStep {
  number: number
  icon: string
  title: string
  description: string
}

export const roles: RoleData[] = [
  {
    name: 'Duke',
    icon: 'lucide:crown',
    color: 'purple',
    abilities: ['Taxe: +3 pièces', 'Bloque: Aide étrangère'],
    description: 'Maître de l\'économie et des finances du royaume'
  },
  {
    name: 'Assassin',
    icon: 'lucide:zap',
    color: 'crimson',
    abilities: ['Assassine un joueur (coût: 3 pièces)'],
    description: 'Élimine silencieusement ses adversaires'
  },
  {
    name: 'Captain',
    icon: 'lucide:anchor',
    color: 'blue',
    abilities: ['Vole 2 pièces à un joueur', 'Bloque: Vol'],
    description: 'Pirate des mers, maître du vol et du pillage'
  },
  {
    name: 'Ambassador',
    icon: 'lucide:globe',
    color: 'emerald',
    abilities: ['Échange cartes avec le deck', 'Bloque: Vol'],
    description: 'Diplomate rusé capable de changer d\'identité'
  },
  {
    name: 'Contessa',
    icon: 'lucide:shield',
    color: 'gold',
    abilities: ['Bloque: Assassinat'],
    description: 'Protection royale contre les assassins'
  }
]

export const actions: ActionData[] = [
  {
    name: 'Income',
    cost: 0,
    effect: '+1 pièce',
    blockable: false,
    challengeable: false
  },
  {
    name: 'Foreign Aid',
    cost: 0,
    effect: '+2 pièces',
    blockable: true,
    blocker: 'Duke',
    challengeable: false
  },
  {
    name: 'Coup',
    cost: 7,
    effect: 'Éliminer 1 influence',
    blockable: false,
    challengeable: false
  },
  {
    name: 'Tax',
    cost: 0,
    effect: '+3 pièces',
    blockable: false,
    challengeable: true,
    role: 'Duke'
  },
  {
    name: 'Assassinate',
    cost: 3,
    effect: 'Éliminer 1 influence',
    blockable: true,
    blocker: 'Contessa',
    challengeable: true,
    role: 'Assassin'
  },
  {
    name: 'Steal',
    cost: 0,
    effect: '+2 pièces (volées)',
    blockable: true,
    blocker: 'Captain/Ambassador',
    challengeable: true,
    role: 'Captain'
  },
  {
    name: 'Exchange',
    cost: 0,
    effect: 'Échanger cartes avec le deck',
    blockable: false,
    challengeable: true,
    role: 'Ambassador'
  }
]

export const setupItems: SetupItem[] = [
  {
    icon: 'lucide:users',
    text: '2-6 joueurs'
  },
  {
    icon: 'lucide:coins',
    text: '2 pièces par joueur au départ'
  },
  {
    icon: 'lucide:layers',
    text: '2 cartes de rôle secrètes par joueur'
  },
  {
    icon: 'lucide:shuffle',
    text: 'Deck de 15 cartes (3 de chaque rôle)'
  }
]

export const turnSteps: TurnStep[] = [
  {
    number: 1,
    icon: 'lucide:play',
    title: 'Annonce',
    description: 'Le joueur actif annonce son action (peut bluffer sur son rôle)'
  },
  {
    number: 2,
    icon: 'lucide:shield-question',
    title: 'Contestation',
    description: 'Les autres joueurs peuvent contester si l\'action nécessite un rôle'
  },
  {
    number: 3,
    icon: 'lucide:shield-check',
    title: 'Blocage',
    description: 'Si l\'action est bloquable, un joueur peut la bloquer avec son rôle'
  },
  {
    number: 4,
    icon: 'lucide:check-circle',
    title: 'Résolution',
    description: 'L\'action s\'exécute si non contestée/bloquée, ou résolution du conflit'
  },
  {
    number: 5,
    icon: 'lucide:rotate-cw',
    title: 'Tour suivant',
    description: 'Passe au joueur suivant (sens horaire)'
  }
]

export const challengeSteps = [
  {
    title: 'Annonce d\'action',
    description: 'Un joueur prétend avoir un rôle et annonce une action',
    icon: 'lucide:megaphone',
    color: 'blue'
  },
  {
    title: 'Contestation',
    description: 'Un adversaire conteste : "Tu n\'as pas ce rôle !"',
    icon: 'lucide:alert-circle',
    color: 'orange'
  },
  {
    title: 'Révélation',
    description: 'Le joueur contesté doit révéler sa carte',
    icon: 'lucide:eye',
    color: 'purple'
  },
  {
    title: 'Résolution',
    description: 'Si la carte est vraie, le contesteur perd une influence. Sinon, le joueur contesté perd une influence.',
    icon: 'lucide:gavel',
    color: 'red'
  }
]

export const features = [
  {
    icon: 'lucide:zap',
    title: 'Temps Réel',
    description: 'Jouez instantanément avec vos amis grâce à WebSocket'
  },
  {
    icon: 'lucide:box',
    title: 'Graphismes 3D',
    description: 'Cartes et animations 3D pour une expérience immersive'
  },
  {
    icon: 'lucide:users',
    title: 'Multijoueur',
    description: 'De 2 à 6 joueurs dans chaque partie'
  },
  {
    icon: 'lucide:brain',
    title: 'Bluff et Stratégie',
    description: 'Mentez, déduisez, et survivez dans ce jeu de psychologie'
  },
  {
    icon: 'lucide:trophy',
    title: 'Système de Stats',
    description: 'Suivez vos victoires, bluffs réussis et classements'
  },
  {
    icon: 'lucide:smartphone',
    title: 'Responsive',
    description: 'Jouez sur ordinateur, tablette ou smartphone'
  }
]
