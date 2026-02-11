# Instructions Claude Code - Coup Digital (Nuxt Monolithique)

## 📋 Contexte du projet

Tu vas développer un jeu de cartes **Coup** digital en temps réel. Coup est un jeu de bluff et déduction où chaque joueur a des cartes de rôles secrètes et peut mentir sur ses actions. L'objectif est de créer une expérience visuelle immersive et interactive avec des éléments 3D/2D spectaculaires.

## 🛠 Stack technique

- **Framework** : Nuxt 3 (Vue 3 + SSR)
- **Language** : TypeScript
- **Styling** : Tailwind CSS + SCSS
- **Database** : MongoDB avec Mongoose
- **WebSockets** : Socket.io (intégré Nuxt)
- **3D/Animation** : Three.js + GSAP
- **State** : Pinia (intégré Nuxt)
- **Icons** : Lucide Vue
- **Deploy** : Gratuit (Vercel + MongoDB Atlas)

## 🎯 Règles du jeu Coup

### Objectif
Être le dernier joueur en vie (éliminer tous les autres).

### Setup
- 2-6 joueurs
- Chaque joueur commence avec 2 cartes de rôle (face cachée) et 2 pièces
- 5 types de rôles dans le deck : Duke, Assassin, Captain, Ambassador, Contessa

### Actions de base (toujours disponibles)
- **Income** : +1 pièce
- **Foreign Aid** : +2 pièces (peut être bloqué par Duke)
- **Coup** : Payer 7 pièces pour éliminer quelqu'un

### Actions de rôles (peuvent être bluffées)
- **Duke** : +3 pièces (Tax) | Bloque Foreign Aid
- **Assassin** : Payer 3 pièces pour assassiner | Non bloquable sauf par Contessa
- **Captain** : Voler 2 pièces | Bloque le vol
- **Ambassador** : Échanger cartes avec le deck | Bloque le vol
- **Contessa** : Bloque les assassinats

### Mécanisme de contestation
1. Joueur annonce une action de rôle
2. Autres joueurs peuvent contester ("Tu n'as pas ce rôle !")
3. Si contesté : révéler la carte
   - Si vraie : contesteur perd une carte
   - Si fausse : joueur actuel perd une carte
4. Après révélation vraie : mélanger la carte dans le deck et en piocher une nouvelle

## 🏗 Architecture Nuxt monolithique

```
coup-game/
├── components/
│   ├── game/
│   ├── lobby/
│   ├── ui/
│   └── 3d/
├── pages/
├── server/
│   ├── api/
│   ├── models/
│   ├── middleware/
│   └── socket/
├── stores/
├── assets/
├── public/
├── types/
├── utils/
├── nuxt.config.ts
├── package.json
└── tailwind.config.js
```

## 📋 Livrables détaillés

### Phase 1 - Infrastructure et setup (2-3 jours)

**Configuration technique :**
- Setup Nuxt 3 avec TypeScript strict
- Configuration Tailwind avec thème custom
- Intégration MongoDB avec Mongoose
- Configuration Socket.io serveur/client
- Setup Three.js et GSAP
- Configuration Pinia stores

**Modèles de données :**
```typescript
interface User {
  _id: ObjectId;
  username: string;
  avatar: string; // URL avatar 3D
  stats: {
    gamesPlayed: number;
    wins: number;
    bluffsSuccessful: number;
    contestationsWon: number;
  };
  createdAt: Date;
}

interface Game {
  _id: ObjectId;
  code: string; // 6 caractères
  hostId: ObjectId;
  players: Player[];
  deck: Card[];
  currentPlayer: number;
  phase: 'lobby' | 'playing' | 'ended';
  turn: number;
  lastAction: Action;
  settings: GameSettings;
  createdAt: Date;
}

interface Player {
  userId: ObjectId;
  username: string;
  cards: Card[]; // Cartes en main (secrètes)
  coins: number;
  isAlive: boolean;
  position: number; // Position autour de la table
  avatar: string;
  isReady: boolean;
}

interface Card {
  type: 'Duke' | 'Assassin' | 'Captain' | 'Ambassador' | 'Contessa';
  id: string;
}

interface Action {
  playerId: ObjectId;
  type: 'income' | 'foreign-aid' | 'coup' | 'tax' | 'assassinate' | 'steal' | 'exchange' | 'block';
  target?: ObjectId;
  claimedRole?: Card['type'];
  timestamp: Date;
  contested: boolean;
  resolved: boolean;
}
```

**Pages principales :**
```
/                    → Accueil avec animation 3D
/auth/login          → Connexion
/auth/register       → Inscription  
/lobby              → Liste des parties + création
/game/[code]        → Interface de jeu principale
/profile            → Profil utilisateur avec stats
/leaderboard        → Classements globaux
```

**Thème visuel - "Coup Royal" :**
```javascript
// tailwind.config.js - Thème château/royauté
theme: {
  extend: {
    colors: {
      royal: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      },
      gold: {
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706'
      },
      emerald: '#10b981',
      crimson: '#dc2626',
      purple: '#8b5cf6'
    },
    fontFamily: {
      'medieval': ['Cinzel', 'serif'],
      'elegant': ['Playfair Display', 'serif']
    }
  }
}
```

### Phase 2 - Authentification et lobby (2 jours)

**Système d'auth simple :**
```vue
<!-- pages/auth/login.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-royal-900 to-royal-950">
    <!-- Particules 3D en arrière-plan -->
    <ThreeBackground :scene="'particles'" />
    
    <div class="flex items-center justify-center min-h-screen">
      <div class="bg-royal-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gold-500/20">
        <h1 class="font-medieval text-3xl text-gold-400 mb-6 text-center">
          Entrez dans la Cour
        </h1>
        
        <form @submit.prevent="handleLogin">
          <UiInput 
            v-model="credentials.username"
            label="Nom de Cour"
            icon="crown"
            :glow="true"
          />
          <UiInput 
            v-model="credentials.password" 
            type="password"
            label="Mot de Passe"
            icon="key"
            :glow="true"
          />
          <UiButton 
            type="submit" 
            variant="royal"
            :loading="isLoading"
            class="w-full mt-6"
          >
            Pénétrer le Château
          </UiButton>
        </form>
      </div>
    </div>
  </div>
</template>
```

**Lobby avec visualisation 3D :**
```vue
<!-- pages/lobby.vue -->
<template>
  <div class="min-h-screen bg-royal-900">
    <!-- Château 3D en arrière-plan -->
    <ThreeBackground :scene="'castle'" />
    
    <div class="relative z-10 container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="font-medieval text-6xl text-gold-400 mb-4">
          Salle du Trône
        </h1>
        <p class="text-royal-300 text-lg">
          Rejoignez une partie ou créez la vôtre
        </p>
      </header>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Liste des parties -->
        <div class="lg:col-span-2">
          <GamesList :games="availableGames" />
        </div>
        
        <!-- Actions -->
        <div class="space-y-6">
          <CreateGameCard @created="joinGame" />
          <QuickJoinCard @joined="joinGame" />
          <UserStatsCard :user="currentUser" />
        </div>
      </div>
    </div>
  </div>
</template>
```

**Composants UI avec effets visuels :**
```vue
<!-- components/ui/UiButton.vue -->
<template>
  <button
    :class="buttonClasses"
    @mouseenter="onHover"
    @click="onClick"
  >
    <!-- Particules de hover -->
    <div ref="particles" class="absolute inset-0 pointer-events-none" />
    
    <!-- Contenu -->
    <span class="relative z-10 flex items-center justify-center gap-2">
      <Icon v-if="icon" :name="icon" />
      <slot />
    </span>
    
    <!-- Effet de brillance -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                -skew-x-12 transform scale-x-0 transition-transform duration-700" 
         ref="shine" />
  </button>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

// Animation de hover avec particules
const onHover = () => {
  // Créer des particules dorées au survol
  gsap.to(particles.value, { 
    scale: 1.1, 
    duration: 0.3,
    ease: "power2.out"
  })
}
</script>
```

### Phase 3 - Logique de jeu backend (3-4 jours)

**Server API endpoints :**
```typescript
// server/api/game/create.post.ts
export default defineEventHandler(async (event) => {
  const { settings } = await readBody(event)
  const userId = await requireAuth(event)
  
  const game = new Game({
    code: generateGameCode(),
    hostId: userId,
    players: [{
      userId,
      username: user.username,
      cards: [],
      coins: 2,
      isAlive: true,
      position: 0,
      isReady: false
    }],
    deck: shuffleDeck(createDeck()),
    settings
  })
  
  await game.save()
  return { gameCode: game.code }
})
```

**Game Service avec logique métier :**
```typescript
// server/services/GameService.ts
export class GameService {
  
  static async dealCards(gameId: string) {
    const game = await Game.findById(gameId)
    
    // Distribuer 2 cartes à chaque joueur
    game.players.forEach(player => {
      player.cards = [
        game.deck.pop()!,
        game.deck.pop()!
      ]
    })
    
    await game.save()
    return game
  }
  
  static async executeAction(gameId: string, action: ActionInput) {
    const game = await Game.findById(gameId)
    
    // Vérifications
    if (game.currentPlayer !== action.playerId) {
      throw new Error('Not your turn')
    }
    
    switch (action.type) {
      case 'income':
        return await this.handleIncome(game, action)
      case 'tax':
        return await this.handleTax(game, action)
      case 'assassinate':
        return await this.handleAssassinate(game, action)
      // ... autres actions
    }
  }
  
  static async handleChallenge(gameId: string, challengerId: string, actionId: string) {
    // Logique de contestation
    const game = await Game.findById(gameId)
    const action = game.lastAction
    
    if (action.claimedRole) {
      const player = game.players.find(p => p.userId === action.playerId)
      const hasRole = player.cards.some(card => card.type === action.claimedRole)
      
      if (hasRole) {
        // Challenger perd une carte
        await this.eliminateCard(game, challengerId)
        // Mélanger la carte révélée et en piocher une nouvelle
        await this.shuffleAndDraw(game, action.playerId, action.claimedRole)
      } else {
        // Joueur actuel perd une carte
        await this.eliminateCard(game, action.playerId)
      }
    }
    
    await game.save()
    return game
  }
}
```

**Socket.io events :**
```typescript
// server/socket/gameHandler.ts
export default (io: Server) => {
  io.on('connection', (socket) => {
    
    socket.on('join-game', async (gameCode: string) => {
      socket.join(`game-${gameCode}`)
      const game = await Game.findOne({ code: gameCode })
      socket.emit('game-state', game)
    })
    
    socket.on('execute-action', async (data: ActionInput) => {
      try {
        const game = await GameService.executeAction(data.gameId, data)
        io.to(`game-${game.code}`).emit('action-executed', {
          game,
          action: data,
          needsResponse: data.canBeChallenged || data.canBeBlocked
        })
      } catch (error) {
        socket.emit('action-error', error.message)
      }
    })
    
    socket.on('challenge-action', async (data) => {
      const game = await GameService.handleChallenge(data.gameId, data.challengerId, data.actionId)
      io.to(`game-${game.code}`).emit('challenge-result', game)
    })
  })
}
```

### Phase 4 - Interface 3D/2D immersive (4-5 jours)

**Table de jeu 3D avec Three.js :**
```vue
<!-- components/game/GameTable3D.vue -->
<template>
  <div ref="container" class="w-full h-screen relative">
    <!-- Overlay UI par-dessus la 3D -->
    <div class="absolute inset-0 z-10 pointer-events-none">
      <PlayerHUD 
        v-for="player in players" 
        :key="player.id"
        :player="player"
        :position="getPlayerScreenPosition(player)"
        class="pointer-events-auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { gsap } from 'gsap'

const container = ref<HTMLElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let table: THREE.Group

onMounted(() => {
  initScene()
  createTable()
  createPlayers()
  animate()
})

const initScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  container.value?.appendChild(renderer.domElement)
  
  // Éclairage dramatique
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
  scene.add(ambientLight)
  
  const pointLight = new THREE.PointLight(0xffd700, 1, 100)
  pointLight.position.set(0, 10, 0)
  scene.add(pointLight)
  
  camera.position.set(0, 15, 20)
  camera.lookAt(0, 0, 0)
}

const createTable = () => {
  // Table royale octogonale
  const tableGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 8)
  const tableMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8b4513,
    shininess: 100
  })
  
  const tableTop = new THREE.Mesh(tableGeometry, tableMaterial)
  table = new THREE.Group()
  table.add(tableTop)
  
  // Bordure dorée
  const borderGeometry = new THREE.TorusGeometry(8, 0.1, 8, 100)
  const borderMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 })
  const border = new THREE.Mesh(borderGeometry, borderMaterial)
  border.position.y = 0.3
  table.add(border)
  
  scene.add(table)
}

const createPlayers = () => {
  players.value.forEach((player, index) => {
    const angle = (index / players.value.length) * Math.PI * 2
    const radius = 12
    
    // Position du joueur
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    
    // Avatar 3D du joueur
    createPlayerAvatar(player, x, z)
  })
}

const createPlayerAvatar = (player: Player, x: number, z: number) => {
  // Créer un avatar 3D stylisé
  const avatarGroup = new THREE.Group()
  
  // Corps (cylindre)
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a5568 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1
  avatarGroup.add(body)
  
  // Tête (sphère)
  const headGeometry = new THREE.SphereGeometry(0.4, 16, 16)
  const headMaterial = new THREE.MeshPhongMaterial({ color: 0xfdbcb4 })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 2.5
  avatarGroup.add(head)
  
  // Couronne (si joueur royal)
  if (player.role === 'king') {
    const crownGeometry = new THREE.ConeGeometry(0.3, 0.6, 6)
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 })
    const crown = new THREE.Mesh(crownGeometry, crownMaterial)
    crown.position.y = 3.2
    avatarGroup.add(crown)
  }
  
  avatarGroup.position.set(x, 0, z)
  scene.add(avatarGroup)
  
  // Stocker la référence pour les animations
  playerAvatars.set(player.id, avatarGroup)
}

// Animations des actions
const animateAction = (action: Action) => {
  const playerAvatar = playerAvatars.get(action.playerId)
  
  if (action.type === 'assassinate') {
    // Animation d'attaque
    gsap.to(playerAvatar.position, {
      y: 2,
      duration: 0.5,
      yoyo: true,
      repeat: 1
    })
    
    // Particules d'épée
    createSwordParticles(playerAvatar.position)
  }
}
</script>
```

**Cartes 3D interactives :**
```vue
<!-- components/game/Card3D.vue -->
<template>
  <div 
    ref="cardContainer"
    class="card-3d"
    @mouseenter="onHover"
    @mouseleave="onLeave"
    @click="onSelect"
  >
    <!-- Recto de la carte -->
    <div class="card-face card-front">
      <div class="card-border">
        <div class="card-header">
          <h3 class="font-medieval text-gold-400">{{ card.type }}</h3>
          <Icon :name="roleIcons[card.type]" class="text-2xl" />
        </div>
        
        <div class="card-artwork">
          <!-- Artwork 3D ou illustration -->
          <component :is="roleArtworks[card.type]" />
        </div>
        
        <div class="card-abilities">
          <div v-for="ability in roleAbilities[card.type]" :key="ability">
            <span class="text-royal-200">{{ ability }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Verso de la carte -->
    <div class="card-face card-back">
      <div class="card-back-pattern"></div>
    </div>
  </div>
</template>

<style scoped>
.card-3d {
  width: 180px;
  height: 260px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.card-3d:hover {
  transform: rotateY(15deg) rotateX(5deg) translateZ(20px);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.card-front {
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #ffd700;
}

.card-back {
  background: linear-gradient(135deg, #7c2d12, #9a3412);
  transform: rotateY(180deg);
}

.card-border {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  text-align: center;
  border-bottom: 1px solid #ffd700;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.card-artwork {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

**Animations fluides avec GSAP :**
```typescript
// composables/useGameAnimations.ts
export const useGameAnimations = () => {
  
  const animateCardDeal = (playerPositions: Position[]) => {
    const cards = document.querySelectorAll('.dealt-card')
    
    gsap.fromTo(cards, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0
    }, {
      x: (i) => playerPositions[i].x,
      y: (i) => playerPositions[i].y,
      rotation: (i) => Math.random() * 20 - 10,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    })
  }
  
  const animateCoinTransfer = (from: Position, to: Position, amount: number) => {
    for (let i = 0; i < amount; i++) {
      const coin = createCoinElement()
      
      gsap.fromTo(coin, {
        x: from.x,
        y: from.y,
        scale: 0,
        rotation: 0
      }, {
        x: to.x,
        y: to.y,
        scale: 1,
        rotation: 360 * 3,
        duration: 1,
        delay: i * 0.1,
        ease: "power2.inOut",
        onComplete: () => coin.remove()
      })
    }
  }
  
  const animateBluff = (playerId: string, success: boolean) => {
    const player = document.querySelector(`[data-player-id="${playerId}"]`)
    
    if (success) {
      // Animation de réussite
      gsap.to(player, {
        boxShadow: "0 0 30px #10b981",
        duration: 0.5,
        yoyo: true,
        repeat: 3
      })
    } else {
      // Animation d'échec
      gsap.to(player, {
        x: -10,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: "power2.inOut"
      })
    }
  }
  
  return {
    animateCardDeal,
    animateCoinTransfer,
    animateBluff
  }
}
```

### Phase 5 - Interface de jeu avancée (3 jours)

**HUD principal du jeu :**
```vue
<!-- pages/game/[code].vue -->
<template>
  <div class="min-h-screen bg-royal-950 overflow-hidden">
    <!-- Table 3D principale -->
    <GameTable3D :players="game.players" :current-action="currentAction" />
    
    <!-- Interface utilisateur overlay -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Header avec infos partie -->
      <GameHeader 
        :game="game" 
        :current-player="currentPlayer"
        class="pointer-events-auto"
      />
      
      <!-- Action en cours -->
      <ActionDisplay 
        v-if="pendingAction"
        :action="pendingAction"
        :can-challenge="canChallenge"
        :can-block="canBlock"
        @challenge="handleChallenge"
        @block="handleBlock"
        @accept="handleAccept"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      />
      
      <!-- Mes cartes (bottom) -->
      <PlayerHand 
        :cards="myCards"
        :coins="myCoins"
        :is-my-turn="isMyTurn"
        @play-action="handleAction"
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto"
      />
      
      <!-- Chat latéral -->
      <GameChat 
        :messages="chatMessages"
        @send="sendMessage"
        class="absolute right-4 bottom-4 pointer-events-auto"
      />
      
      <!-- Historique des actions -->
      <ActionHistory 
        :actions="game.actionHistory"
        class="absolute left-4 top-20 pointer-events-auto"
      />
    </div>
    
    <!-- Modals -->
    <CharacterRevealModal v-if="revealModal" :card="revealModal.card" />
    <VictoryModal v-if="gameEnded" :winner="winner" :stats="gameStats" />
  </div>
</template>

<script setup lang="ts">
const { $socket } = useNuxtApp()
const route = useRoute()
const gameStore = useGameStore()

const { game, currentPlayer, myCards, isMyTurn } = storeToRefs(gameStore)

// Rejoindre la partie au montage
onMounted(() => {
  $socket.emit('join-game', route.params.code)
})

// Écouter les événements de jeu
$socket.on('action-executed', (data: ActionEvent) => {
  gameStore.updateGame(data.game)
  
  if (data.needsResponse) {
    showActionResponse(data.action)
  }
})

const handleAction = async (action: ActionInput) => {
  $socket.emit('execute-action', {
    gameId: game.value._id,
    ...action
  })
}
</script>
```

**Composant main du joueur :**
```vue
<!-- components/game/PlayerHand.vue -->
<template>
  <div class="flex flex-col items-center space-y-4 p-6">
    <!-- Informations joueur -->
    <div class="bg-royal-800/80 backdrop-blur-lg rounded-xl p-4 border border-gold-500/30">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <Icon name="coins" class="text-gold-400" />
          <span class="text-gold-400 font-bold text-xl">{{ coins }}</span>
        </div>
        
        <div v-if="isMyTurn" class="px-3 py-1 bg-emerald-500 rounded-full text-sm font-medium">
          À votre tour
        </div>
      </div>
    </div>
    
    <!-- Cartes en main -->
    <div class="flex space-x-4">
      <Card3D 
        v-for="(card, index) in cards" 
        :key="`${card.type}-${index}`"
        :card="card"
        :interactive="isMyTurn"
        @select="selectCard"
      />
    </div>
    
    <!-- Actions disponibles -->
    <div v-if="isMyTurn" class="flex space-x-3">
      <!-- Actions de base -->
      <ActionButton 
        action="income"
        label="+1 Pièce"
        icon="plus"
        @click="playAction('income')"
      />
      
      <ActionButton 
        action="foreign-aid"
        label="+2 Pièces"
        icon="hand-heart"
        :disabled="!canForeignAid"
        @click="playAction('foreign-aid')"
      />
      
      <ActionButton 
        v-if="coins >= 7"
        action="coup"
        label="Coup (7)"
        icon="sword"
        variant="danger"
        @click="selectTarget('coup')"
      />
      
      <!-- Actions de rôles -->
      <ActionButton 
        action="tax"
        label="Impôt (Duke)"
        icon="crown"
        variant="royal"
        @click="playAction('tax', 'Duke')"
      />
      
      <ActionButton 
        v-if="coins >= 3"
        action="assassinate"
        label="Assassiner (3)"
        icon="dagger"
        variant="danger"
        @click="selectTarget('assassinate')"
      />
      
      <ActionButton 
        action="steal"
        label="Voler (Captain)"
        icon="hand"
        variant="warning"
        @click="selectTarget('steal')"
      />
      
      <ActionButton 
        action="exchange"
        label="Échanger"
        icon="refresh"
        variant="info"
        @click="playAction('exchange', 'Ambassador')"
      />
    </div>
  </div>
</template>
```

**Sélection de cible interactive :**
```vue
<!-- components/game/TargetSelector.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-royal-800 rounded-2xl p-6 border border-gold-500/50 max-w-md">
      <h3 class="font-medieval text-xl text-gold-400 mb-4 text-center">
        Choisissez votre cible
      </h3>
      
      <div class="space-y-3">
        <button
          v-for="player in targetablePlayers"
          :key="player.id"
          @click="selectTarget(player)"
          class="w-full p-4 bg-royal-700 hover:bg-royal-600 rounded-lg border border-royal-500 
                 transition-all duration-200 hover:border-gold-500/50 hover:shadow-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 
                        flex items-center justify-center">
              <span class="font-bold text-royal-900">{{ player.username[0] }}</span>
            </div>
            
            <div class="flex-1 text-left">
              <div class="font-medium text-royal-100">{{ player.username }}</div>
              <div class="text-sm text-royal-300 flex items-center space-x-2">
                <Icon name="coins" class="w-4 h-4" />
                <span>{{ player.coins }} pièces</span>
                <span class="mx-2">•</span>
                <span>{{ player.cards.length }} cartes</span>
              </div>
            </div>
            
            <!-- Indicateur de risque -->
            <div class="text-right">
              <div v-if="player.coins >= 7" class="text-red-400 text-xs">
                ⚠️ Peut faire Coup
              </div>
            </div>
          </div>
        </button>
      </div>
      
      <button 
        @click="cancel"
        class="w-full mt-4 p-3 bg-royal-600 hover:bg-royal-500 rounded-lg transition-colors"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
```

### Phase 6 - Système de contestation et bluff (2 jours)

**Interface de réponse aux actions :**
```vue
<!-- components/game/ActionResponse.vue -->
<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-gradient-to-br from-royal-800 to-royal-900 rounded-2xl p-8 
                border-2 border-gold-500/50 max-w-lg mx-4 shadow-2xl">
      
      <!-- Action annoncée -->
      <div class="text-center mb-6">
        <div class="mb-2">
          <span class="text-royal-300">{{ action.playerName }} annonce :</span>
        </div>
        
        <div class="bg-royal-700/50 rounded-lg p-4 border border-gold-500/30">
          <div class="flex items-center justify-center space-x-3">
            <Icon :name="actionIcons[action.type]" class="text-3xl text-gold-400" />
            <div>
              <div class="font-medieval text-xl text-gold-400">
                {{ actionLabels[action.type] }}
              </div>
              <div v-if="action.claimedRole" class="text-royal-300 text-sm">
                en tant que {{ action.claimedRole }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Timer de décision -->
      <div class="mb-6">
        <div class="w-full bg-royal-700 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full transition-all duration-1000"
            :style="{ width: `${(timeLeft / maxTime) * 100}%` }"
          ></div>
        </div>
        <div class="text-center mt-2 text-royal-300 text-sm">
          {{ Math.ceil(timeLeft) }}s restantes
        </div>
      </div>
      
      <!-- Options de réponse -->
      <div class="space-y-3">
        <!-- Contester -->
        <button
          v-if="canChallenge"
          @click="challenge"
          class="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 
                 hover:from-red-500 hover:to-red-600 rounded-lg font-medium 
                 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="shield-x" />
            <span>Contester (Je ne crois pas qu'il/elle ait {{ action.claimedRole }})</span>
          </div>
        </button>
        
        <!-- Bloquer -->
        <button
          v-if="canBlock"
          @click="selectBlockRole"
          class="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 
                 hover:from-blue-500 hover:to-blue-600 rounded-lg font-medium 
                 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="shield" />
            <span>Bloquer avec {{ blockingRoles.join(' ou ') }}</span>
          </div>
        </button>
        
        <!-- Accepter -->
        <button
          @click="accept"
          class="w-full p-4 bg-gradient-to-r from-royal-600 to-royal-700 
                 hover:from-royal-500 hover:to-royal-600 rounded-lg font-medium 
                 transition-all duration-200"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="check" />
            <span>Accepter l'action</span>
          </div>
        </button>
      </div>
      
      <!-- Indicateur de risque -->
      <div v-if="riskAssessment" class="mt-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
        <div class="text-yellow-400 text-sm">
          <Icon name="alert-triangle" class="inline mr-1" />
          {{ riskAssessment }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timeLeft = ref(10) // 10 secondes pour répondre
const maxTime = 10

// Auto-accept si pas de réponse
onMounted(() => {
  const timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      accept() // Auto-accepter
    }
  }, 1000)
})

// Évaluation du risque
const riskAssessment = computed(() => {
  if (action.type === 'tax' && action.playerName === suspiciousPlayer.value) {
    return "Ce joueur a déjà utilisé Duke récemment. Risqué ?"
  }
  
  if (action.type === 'assassinate' && myCards.value.some(c => c.type === 'Contessa')) {
    return "Vous pouvez bloquer avec Contessa"
  }
  
  return null
})
</script>
```

### Phase 7 - Polish et features avancées (3-4 jours)

**Système d'achievements :**
```typescript
// types/achievements.ts
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: PlayerStats) => boolean;
  reward?: {
    title?: string;
    avatar?: string;
    badge?: string;
  };
}

export const achievements: Achievement[] = [
  {
    id: 'first-bluff',
    name: 'Premier Mensonge',
    description: 'Réussir votre premier bluff',
    icon: 'mask',
    rarity: 'common',
    condition: (stats) => stats.bluffsSuccessful >= 1
  },
  {
    id: 'master-deceiver',
    name: 'Maître Trompeur',
    description: 'Réussir 10 bluffs consécutifs',
    icon: 'crown',
    rarity: 'legendary',
    condition: (stats) => stats.consecutiveBluffs >= 10
  }
  // ... plus d'achievements
]
```

**Système de replay :**
```vue
<!-- pages/replay/[gameId].vue -->
<template>
  <div class="min-h-screen bg-royal-950">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="font-medieval text-3xl text-gold-400">Replay de Partie</h1>
        <p class="text-royal-300">{{ replayData.date }} • {{ replayData.duration }}</p>
      </header>
      
      <!-- Contrôles de lecture -->
      <div class="bg-royal-800/50 rounded-xl p-4 mb-8 flex items-center space-x-4">
        <button @click="togglePlay" class="p-2 bg-gold-600 rounded-lg">
          <Icon :name="isPlaying ? 'pause' : 'play'" />
        </button>
        
        <div class="flex-1">
          <input 
            type="range" 
            v-model="currentStep" 
            :max="totalSteps" 
            class="w-full"
          />
        </div>
        
        <select v-model="playbackSpeed" class="bg-royal-700 rounded px-3 py-1">
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
        </select>
      </div>
      
      <!-- État de jeu au moment sélectionné -->
      <GameStateVisualization :state="currentGameState" />
      
      <!-- Timeline des actions -->
      <ActionTimeline :actions="replayData.actions" :current="currentStep" />
    </div>
  </div>
</template>
```

**PWA Configuration :**
```javascript
// nuxt.config.ts - Configuration PWA
export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt'
  ],
  
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Coup Digital - Jeu de Bluff Royal',
      short_name: 'Coup Digital',
      description: 'Le jeu de cartes de bluff ultime en ligne',
      theme_color: '#ffd700',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    }
  }
})
```

## 🚀 Plan de déploiement gratuit

### Hébergement recommandé
- **Frontend + SSR** : Vercel (gratuit avec domaine custom)
- **Base de données** : MongoDB Atlas (gratuit 512MB)
- **Assets/Images** : Cloudinary (gratuit)
- **Analytics** : Google Analytics 4 (gratuit)

### Configuration production
```bash
# Variables d'environnement production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://yoursite.vercel.app
```

## 🎯 Métriques de succès

### Techniques
- **Performance** : Lighthouse score > 90
- **Temps de chargement** : < 2s
- **Latence WebSocket** : < 100ms
- **Responsive** : Fonctionne parfaitement mobile

### Gameplay
- **Rétention** : 70%+ reviennent dans les 7 jours
- **Durée moyenne** : Parties de 8-15 minutes
- **Engagement** : 3+ parties par session

## 💡 Fonctionnalités futures (v2)

- **Mode tournoi** avec éliminations
- **Spectateur mode** pour regarder les parties
- **Cartes personnalisées** avec éditeur
- **Chat vocal** intégré
- **Défis quotidiens** avec récompenses
- **Système de league/ranking**
- **Mode IA** pour s'entraîner

## 🧪 Tests recommandés

### Tests unitaires
- Logique de jeu (actions, contestations)
- Composants Vue (props, events)
- Services (API calls)

### Tests d'intégration
- Flow complet d'une partie
- Gestion des déconnexions
- Synchronisation temps réel

### Tests de charge
- 100+ joueurs simultanés
- Latence sous charge
- Gestion mémoire

Commence par l'infrastructure de base puis ajoute les fonctionnalités une par une. Focus sur l'expérience utilisateur et les animations fluides !

Le jeu doit être **visuellement impressionnant**, **techniquement solide** et **addictif** à jouer ! 🃏✨
