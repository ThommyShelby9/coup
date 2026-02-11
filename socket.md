# Implémentation Socket.io - Loup-Garou

Documentation de l'architecture Socket.io pour la communication temps réel du jeu.

---

## Architecture Générale

Socket.io est utilisé pour la communication bidirectionnelle en temps réel entre le serveur et les clients. Le système gère:
- Authentification JWT
- Gestion des salles de jeu (rooms)
- Chat multi-canaux (global, loups, morts)
- Actions de jeu en temps réel
- Reconnexion automatique

**Fichier principal**: `src/socket/socketHandler.ts`

---

## 1. Authentification

### Middleware d'authentification

Tous les sockets sont authentifiés via JWT **avant** la connexion:

```typescript
io.use((socket: AuthSocket, next) => {
  const token = socket.handshake.auth.token;

  // Bloquer les bots (n'utilisent pas socket)
  if (token.startsWith('BOT_')) {
    return next(new Error('Bots cannot connect via socket'));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = decoded; // Attach user info to socket
  next();
});
```

### Connexion côté client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

**Important**: Les bots ne se connectent **jamais** via socket. Ils utilisent des appels directs aux services.

---

## 2. Système de Salles (Rooms)

### Types de salles

1. **Salle personnelle** (`userId`)
   - Créée automatiquement à la connexion
   - Pour messages privés/notifications personnelles
   ```typescript
   socket.join(socket.user.userId);
   ```

2. **Salle de jeu** (`gameId`)
   - Tous les joueurs d'une partie
   - Pour événements de jeu et chat global
   ```typescript
   socket.join(gameId);
   ```

### Gestion des salles

**Rejoindre une partie**:
```javascript
// Client
socket.emit('join-room', gameId);

// Serveur répond avec:
socket.emit('players-list', { players: [...] });
socket.emit('reconnection-data', { ... }); // Si reconnexion
socket.broadcast.to(gameId).emit('player-joined', { userId, username });
```

**Quitter une partie**:
```javascript
// Client
socket.emit('leave-room', gameId);

// Serveur notifie:
io.to(gameId).emit('player-left', { userId, username });
```

---

## 3. Système de Chat

### Canaux disponibles

| Canal | Qui peut lire | Qui peut écrire | Anonymat |
|-------|---------------|-----------------|----------|
| `global` | Tous les vivants | Tous les vivants | Oui si nuit |
| `werewolf` | Loups-garous | Loups-garous | Non |
| `dead` | Morts | Morts | Non (rôles révélés) |

### Envoi de message

```javascript
// Client
socket.emit('send-message', {
  gameId: 'game123',
  message: 'Bonjour!',
  channel: 'global'
});

// Serveur émet:
io.to(userId).emit('message-received', {
  sender: 'Username',      // ou 'Quelqu\'un' si anonyme
  senderId: 'userId',      // undefined si anonyme
  message: 'Bonjour!',
  channel: 'global',
  timestamp: Date,
  isAnonymous: false,
  senderRole: 'VOYANTE'    // uniquement pour morts (spectateurs)
});
```

### Indicateurs de frappe

```javascript
// Client démarre la frappe
socket.emit('user-typing-start', { gameId, channel: 'global' });

// Serveur notifie les autres
io.to(otherUserId).emit('user-typing', {
  userId: 'userId',        // undefined si anonyme
  username: 'Username',    // 'Quelqu\'un' si anonyme
  channel: 'global',
  isAnonymous: false
});

// Client arrête la frappe
socket.emit('user-typing-stop', { gameId, channel: 'global' });

// Serveur notifie
io.to(otherUserId).emit('user-stopped-typing', { ... });
```

**Note**: Les messages sont anonymes pendant la phase `night` dans le canal `global`.

---

## 4. Actions de Jeu

### Démarrage de partie (hôte uniquement)

```javascript
// Client (hôte)
socket.emit('start-game', gameId);

// Serveur émet à tous:
io.to(gameId).emit('game-started', {
  gameId,
  players: [{ userId, username, isAlive }, ...]
});
```

### Votes

**Vote pour maire**:
```javascript
// Client
socket.emit('vote-mayor', {
  gameId: 'game123',
  candidateId: 'userId'
});

// Serveur émet:
io.to(gameId).emit('vote-cast', {
  voterId: 'userId',
  targetId: 'candidateId'
});
```

**Vote d'élimination**:
```javascript
// Client
socket.emit('vote-player', {
  gameId: 'game123',
  targetId: 'userId'
});

// Serveur émet:
io.to(gameId).emit('vote-cast', {
  voterId: 'userId',
  targetId: 'targetId'
});
```

**Vote automatique**: Si tous les joueurs ont voté, la phase se termine automatiquement.

### Capacités spéciales

```javascript
// Client
socket.emit('use-ability', {
  gameId: 'game123',
  action: 'seer-inspect',    // ou 'werewolf-target', 'witch-save', etc.
  targetId: 'userId',        // optionnel selon l'action
  target2Id: 'userId2'       // pour Cupidon uniquement
});

// Serveur répond:
socket.emit('seer-result', { targetId, role });  // Pour voyante
socket.emit('ability-confirmed', { action, targetId });  // Autres
io.to(gameId).emit('ability-used', { userId, action });  // Loups
```

**Actions disponibles**:
- `werewolf-target` - Loup choisit victime
- `seer-inspect` - Voyante inspecte joueur
- `witch-save` - Sorcière sauve la victime
- `witch-poison` - Sorcière empoisonne
- `hunter-kill` - Chasseur élimine (quand mort)
- `cupidon-bond` - Cupidon lie deux amoureux

### Maire

**Candidature**:
```javascript
socket.emit('submit-candidacy', gameId);
```

**Démarrer vote (maire uniquement)**:
```javascript
socket.emit('mayor-start-vote', gameId);
```

**Décider en cas d'égalité (maire uniquement)**:
```javascript
socket.emit('mayor-decide-elimination', {
  gameId: 'game123',
  eliminatedPlayerId: 'userId'
});
```

**Choisir successeur (maire mort uniquement)**:
```javascript
socket.emit('choose-successor', {
  gameId: 'game123',
  successorId: 'userId'
});
```

---

## 5. Événements Serveur → Client

### Événements de phase

Émis par `GameService` via `io.to(gameId).emit()`:

```javascript
// Changement de phase
socket.on('phase-changed', (data) => {
  // data.phase: 'night' | 'day' | 'voting' | 'ended'
  // data.subPhase: 'candidacy' | 'election' | 'runoff-election' | null
  // data.duration: number (secondes)
});

// Mise à jour timer
socket.on('timer-update', (data) => {
  // data.timeRemaining: number (secondes)
});

// Phase terminée
socket.on('phase-ended', (data) => {
  // data.phase: string
  // data.nextPhase: string
});
```

### Événements de rôle (messages privés)

Émis via `io.to(userId).emit()`:

```javascript
// Révélation de rôle au démarrage
socket.on('role-assigned', (data) => {
  // data.role: 'LOUP_GAROU' | 'VOYANTE' | 'VILLAGEOIS' | etc.
});

// Loups-garous peuvent agir
socket.on('werewolf-can-act', (data) => {
  // data.message: string
});

// Voyante peut inspecter
socket.on('seer-can-act', (data) => {
  // data.message: string
});

// Sorcière peut agir
socket.on('witch-can-act', (data) => {
  // data.victimId: string | null
  // data.hasSavePotion: boolean
  // data.hasPoisonPotion: boolean
});

// Chasseur peut éliminer (quand meurt)
socket.on('hunter-can-act', (data) => {
  // data.message: string
});

// Cupidon doit lier
socket.on('cupidon-must-bond', (data) => {
  // data.message: string
});

// Notification amoureux
socket.on('lover-notification', (data) => {
  // data.message: string
  // data.partnerId: string (optionnel)
});

// Maire peut démarrer vote
socket.on('mayor-can-start-vote', (data) => {
  // data.message: string
});

// Maire doit choisir successeur
socket.on('mayor-succession-required', (data) => {
  // data.message: string
  // data.alivePlayers: [{ userId, username }, ...]
});

// Maire doit décider en cas d'égalité
socket.on('mayor-must-decide', (data) => {
  // data.tiedPlayers: [{ userId, username }, ...]
});
```

### Événements de résultat

```javascript
// Résultat vote
socket.on('vote-results', (data) => {
  // data.eliminated: { userId, username, role } | null
  // data.votes: { [userId]: voteCount }
  // data.isTie: boolean
});

// Annonce mort(s)
socket.on('night-deaths', (data) => {
  // data.deaths: [{ userId, username, role }, ...]
});

// Fin de partie
socket.on('game-ended', (data) => {
  // data.winner: 'werewolves' | 'villagers' | 'lovers'
  // data.players: [{ userId, username, role, isAlive }, ...]
});
```

### Événements maire

```javascript
// Nouveau maire élu
socket.on('mayor-elected', (data) => {
  // data.mayorId: string
  // data.mayorName: string
});

// Candidature soumise
socket.on('candidate-submitted', (data) => {
  // data.candidateId: string
  // data.candidateName: string
});

// Nouveau maire (succession)
socket.on('mayor-succeeded', (data) => {
  // data.newMayorId: string
  // data.newMayorName: string
});
```

### Événements d'erreur

```javascript
socket.on('error', (data) => {
  // data.message: string
});
```

---

## 6. Reconnexion

### Gestion automatique

Quand un joueur rejoint une partie via `join-room`, le serveur:

1. Vérifie si c'est une reconnexion
2. Envoie les données de reconnexion:

```javascript
socket.on('reconnection-data', (data) => {
  // data.game: état complet de la partie
  // data.player: infos du joueur
  // data.missedEvents: événements manqués pendant déconnexion
});
```

3. Met à jour le statut de reconnexion dans la DB

**Service responsable**: `ReconnectionService`

---

## 7. Émission Ciblée vs Broadcast

### Types d'émissions

```typescript
// 1. À un utilisateur spécifique (salle personnelle)
io.to(userId).emit('role-assigned', { role: 'VOYANTE' });

// 2. À toute la partie
io.to(gameId).emit('phase-changed', { phase: 'night' });

// 3. À toute la partie SAUF l'émetteur
socket.broadcast.to(gameId).emit('player-joined', { ... });

// 4. Uniquement à l'émetteur
socket.emit('seer-result', { targetId, role });
```

### Filtrage manuel pour canaux spéciaux

Pour certains événements (chat loups, actions spécifiques), le serveur filtre manuellement:

```typescript
// Exemple: message loups-garous
game.players.forEach(player => {
  if (ChatService.canReadMessage(player, 'werewolf')) {
    io.to(player.userId).emit('message-received', chatMessage);
  }
});
```

---

## 8. Intégration avec les Bots

**Les bots n'utilisent PAS Socket.io**:
- Connexion socket bloquée par middleware (`token.startsWith('BOT_')`)
- Actions exécutées via appels directs aux services:
  - `GameService.processWerewolfAction()`
  - `VotingService.castVote()`
  - `GameService.processWitchAction()`
  - etc.

- Notifications envoyées uniquement aux joueurs humains
- Bots agissent avec délais aléatoires (2-8 secondes)

**Service responsable**: `BotActionService`

---

## 9. Flux Typique d'une Partie

```
1. Client: socket.emit('join-room', gameId)
   Server: socket.emit('players-list', ...)

2. Hôte: socket.emit('start-game', gameId)
   Server: io.to(gameId).emit('game-started', ...)
   Server: io.to(userId).emit('role-assigned', ...)

3. Server: io.to(gameId).emit('phase-changed', { phase: 'night' })
   Server: io.to(werewolfId).emit('werewolf-can-act', ...)

4. Client: socket.emit('use-ability', { action: 'werewolf-target', ... })
   Server: io.to(gameId).emit('ability-used', ...)

5. Server: io.to(gameId).emit('phase-changed', { phase: 'day' })
   Server: io.to(gameId).emit('night-deaths', ...)

6. Client: socket.emit('send-message', { channel: 'global', ... })
   Server: io.to(userId).emit('message-received', ...)

7. Server: io.to(gameId).emit('phase-changed', { phase: 'voting' })

8. Client: socket.emit('vote-player', { targetId, ... })
   Server: io.to(gameId).emit('vote-cast', ...)

9. Server: io.to(gameId).emit('vote-results', ...)

10. Server: io.to(gameId).emit('game-ended', { winner: 'villagers' })
```

---

## 10. Bonnes Pratiques

### Côté Client

```javascript
// Toujours gérer les erreurs
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  // Afficher à l'utilisateur
});

// Vérifier la connexion avant émission
if (socket.connected) {
  socket.emit('vote-player', data);
}

// Nettoyer les listeners
useEffect(() => {
  socket.on('phase-changed', handlePhaseChange);

  return () => {
    socket.off('phase-changed', handlePhaseChange);
  };
}, []);
```

### Côté Serveur

```typescript
// Toujours valider les données
if (!game) {
  socket.emit('error', { message: 'Game not found' });
  return;
}

// Toujours vérifier les permissions
if (game.hostId !== socket.user?.userId) {
  socket.emit('error', { message: 'Only host can start' });
  return;
}

// Logger les actions importantes
logger.info(`${socket.user?.username} voted in game ${gameId}`);
```

---

## 11. Débogage

### Logs Winston

Tous les événements socket sont loggés:

```
[info]: User connected: JohnDoe (abc123)
[info]: JohnDoe joined room game-456
[info]: Message from JohnDoe in game-456 (global): Hello!
[info]: JohnDoe voted for player789 in game game-456
```

### Socket.io Debug Mode

Activer les logs détaillés côté client:

```javascript
localStorage.debug = 'socket.io-client:socket';
```

---

## Résumé

Socket.io dans ce projet gère:
- ✅ Authentification JWT obligatoire
- ✅ Salles dynamiques (personnelles + parties)
- ✅ Chat multi-canaux avec filtrage intelligent
- ✅ Actions de jeu en temps réel
- ✅ Reconnexion automatique avec état complet
- ✅ Émissions ciblées (privées, partie, broadcast)
- ✅ Intégration avec système de bots (exclusion)
- ✅ Gestion complète du cycle de vie d'une partie

**Fichiers clés**:
- **Backend**:
  - `src/socket/socketHandler.ts` - Configuration et événements Socket.io
  - `src/services/GameService.ts` - Logique de jeu + émissions
  - `src/services/ChatService.ts` - Validation et filtrage chat
  - `src/services/ReconnectionService.ts` - Gestion reconnexions
- **Frontend**:
  - `src/services/socket.ts` - Service Socket.io client
  - `src/stores/auth.ts` - Connexion/déconnexion socket
  - `src/views/GamePage.vue` - Écoute des événements de jeu
  - `src/components/game/ChatContainer.vue` - Chat temps réel

---

## 12. Implémentation Frontend - Vue 3 + TypeScript

### Architecture

Le frontend utilise un **service singleton** (`SocketService`) qui encapsule toutes les interactions Socket.io. Ce service est utilisé par les stores Pinia et les composants Vue.

**Fichier**: `src/services/socket.ts`

### Structure du Service

```typescript
class SocketService {
  private socket: Socket | null = null
  private connected = false

  // Méthodes de connexion
  connect(token: string): void
  disconnect(): void
  isConnected(): boolean

  // Méthodes d'émission (emit)
  joinRoom(gameId: string): void
  startGame(gameId: string): void
  votePlayer(gameId: string, targetId: string): void
  voteMayor(gameId: string, candidateId: string): void
  submitCandidacy(gameId: string): void
  chooseSuccessor(gameId: string, successorId: string): void
  mayorStartVote(gameId: string): void
  mayorDecideElimination(gameId: string, eliminatedPlayerId: string): void
  useAbility(data: AbilityData): void
  sendMessage(data: SendMessageData): void
  emitTypingStart(gameId: string, channel: string): void
  emitTypingStop(gameId: string, channel: string): void

  // Méthodes d'écoute (on)
  onRoleAssigned(callback: Function): void
  onPhaseChanged(callback: Function): void
  onTimerUpdate(callback: Function): void
  onVoteResults(callback: Function): void
  onGameEnded(callback: Function): void
  // ... 40+ méthodes onEventName()

  // Nettoyage
  off(event: string, callback?: Function): void
  removeAllListeners(): void
}

// Export singleton
export const socketService = new SocketService()
```

### Connexion et Déconnexion

**Connexion automatique au login** (`src/stores/auth.ts`):

```typescript
// Dans le store auth
async function login(credentials: LoginData) {
  const response = await apiClient.login(credentials)

  user.value = response.user
  token.value = response.token
  localStorage.setItem('token', response.token)

  // Connexion Socket.io automatique
  socketService.connect(response.token)

  return response
}

// Déconnexion
function logout() {
  socketService.disconnect()
  localStorage.removeItem('token')
  user.value = null
  token.value = null
}
```

**Configuration de la connexion**:

```typescript
connect(token: string): void {
  if (this.connected) {
    console.warn('Socket already connected')
    return
  }

  this.socket = io(WS_URL, {
    auth: { token }  // JWT token envoyé au serveur
  })

  // Événements de connexion
  this.socket.on('connect', () => {
    this.connected = true
    console.log('Socket connected:', this.socket?.id)
  })

  this.socket.on('disconnect', () => {
    this.connected = false
    console.log('Socket disconnected')
  })

  this.socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })
}
```

### Émission d'Événements (Client → Serveur)

**Méthodes d'émission typées**:

```typescript
// Rejoindre une partie
joinRoom(gameId: string): void {
  this.socket?.emit('join-room', gameId)
}

// Voter pour un joueur
votePlayer(gameId: string, targetId: string): void {
  this.socket?.emit('vote-player', { gameId, targetId })
}

// Utiliser un pouvoir
useAbility(data: {
  gameId: string
  action: 'werewolf-target' | 'seer-inspect' | 'witch-save' | 'witch-poison' | 'hunter-kill' | 'cupidon-bond'
  targetId?: string
  target2Id?: string
}): void {
  this.socket?.emit('use-ability', data)
}

// Envoyer un message
sendMessage(data: SendMessageData): void {
  this.socket?.emit('send-message', data)
}
```

**Utilisation depuis un composant**:

```vue
<script setup lang="ts">
import { socketService } from '@/services/socket'

// Voter pour un joueur
function handleVote(playerId: string) {
  socketService.votePlayer(gameId, playerId)
}

// Utiliser pouvoir voyante
function inspectPlayer(targetId: string) {
  socketService.useAbility({
    gameId: gameId,
    action: 'seer-inspect',
    targetId: targetId
  })
}
</script>
```

### Écoute d'Événements (Serveur → Client)

**Méthodes d'écoute avec callbacks typés**:

```typescript
// Écouter l'assignation de rôle
onRoleAssigned(callback: (data: RoleAssignedEvent) => void): void {
  this.socket?.on('role-assigned', callback)
}

// Écouter les changements de phase
onPhaseChanged(callback: (data: PhaseChangedEvent) => void): void {
  this.socket?.on('phase-changed', callback)
}

// Écouter les messages chat
onMessageReceived(callback: (data: ChatMessage) => void): void {
  this.socket?.on('message-received', callback)
}
```

**Utilisation dans GamePage.vue** (exemple complet):

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { socketService } from '@/services/socket'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// Handlers
const handleRoleAssigned = (data: RoleAssignedEvent) => {
  console.log('Rôle assigné:', data.role)
  gameStore.setMyRole(data.role)
  showRoleReveal.value = true
}

const handlePhaseChanged = (data: PhaseChangedEvent) => {
  console.log('Phase changée:', data.phase)
  gameStore.updatePhase(data.phase)
  gameStore.setTimer(data.duration)

  if (data.eliminatedPlayers) {
    nightDeaths.value = data.eliminatedPlayers
    showNightDeath.value = true
  }
}

const handleTimerUpdate = (data: TimerUpdateEvent) => {
  gameStore.setTimer(data.remainingTime)
}

const handleVoteResults = (data: VoteResultsEvent) => {
  voteResultData.value = {
    eliminatedPlayer: data.eliminatedPlayer,
    isTie: data.isTie,
    voteCount: data.votes
  }
  showVoteResult.value = true
}

const handleGameEnded = (data: GameEndedEvent) => {
  gameWinner.value = data.winner
  finalPlayers.value = data.players
  showGameEnded.value = true
}

// Setup listeners
onMounted(() => {
  // Rejoindre la room de jeu
  socketService.joinRoom(gameId)

  // Écouter les événements
  socketService.onRoleAssigned(handleRoleAssigned)
  socketService.onPhaseChanged(handlePhaseChanged)
  socketService.onTimerUpdate(handleTimerUpdate)
  socketService.onVoteResults(handleVoteResults)
  socketService.onGameEnded(handleGameEnded)
  socketService.onMayorElected(handleMayorElected)
  socketService.onCupidonCanAct(handleCupidonCanAct)
  socketService.onHunterCanAct(handleHunterCanAct)
  socketService.onMessageReceived(handleMessageReceived)
  // ... 30+ événements
})

// Cleanup listeners
onUnmounted(() => {
  socketService.off('role-assigned', handleRoleAssigned)
  socketService.off('phase-changed', handlePhaseChanged)
  socketService.off('timer-update', handleTimerUpdate)
  // ... nettoyer tous les listeners
})
</script>
```

### Événements Implémentés (50+ événements)

**Événements de base**:
- ✅ `role-assigned` - Assignation du rôle
- ✅ `phase-changed` - Changement de phase (night/day/voting)
- ✅ `timer-update` - Mise à jour du timer
- ✅ `vote-results` - Résultats du vote
- ✅ `game-ended` - Fin de partie

**Événements maire (12 événements)**:
- ✅ `mayor-candidacy-started` - Début candidatures
- ✅ `candidate-added` - Nouveau candidat
- ✅ `mayor-all-candidates` - Liste complète candidats
- ✅ `mayor-campaign-started` - Campagne maire
- ✅ `mayor-voting-started` - Vote maire
- ✅ `mayor-elected` - Maire élu
- ✅ `mayor-election-failed` - Échec élection
- ✅ `mayor-election-skipped` - Élection sautée
- ✅ `mayor-can-start-vote` - Maire peut démarrer vote
- ✅ `mayor-must-decide` - Maire doit décider égalité
- ✅ `mayor-succession-required` - Succession requise
- ✅ `mayor-succeeded` - Nouveau maire par succession

**Événements Cupidon (7 événements)**:
- ✅ `cupidon-can-act` - Cupidon peut agir
- ✅ `cupidon-phase-started` - Phase Cupidon
- ✅ `waiting-for-cupidon` - En attente Cupidon
- ✅ `you-are-lover` - Notification amoureux
- ✅ `lover-died` - Mort d'un amoureux (cascade)
- ✅ `cupidon-phase-ended` - Fin phase Cupidon
- ✅ `cupidon-phase-skipped` - Phase Cupidon sautée

**Événements rôles spéciaux**:
- ✅ `seer-result` - Résultat voyante
- ✅ `witch-victim-info` - Info victime pour sorcière
- ✅ `hunter-can-act` - Chasseur peut agir
- ✅ `hunter-killed` - Chasseur a éliminé

**Événements chat**:
- ✅ `message-received` - Message reçu
- ✅ `user-typing` - Utilisateur en train d'écrire
- ✅ `user-stopped-typing` - Utilisateur a arrêté

**Événements lobby**:
- ✅ `player-joined` - Joueur a rejoint
- ✅ `player-left` - Joueur a quitté
- ✅ `players-list` - Liste des joueurs
- ✅ `game-updated` - Partie mise à jour

**Événements système**:
- ✅ `reconnection-data` - Données de reconnexion
- ✅ `error` - Erreur socket

### Gestion du Chat Temps Réel

**Component**: `src/components/game/ChatContainer.vue`

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { socketService } from '@/services/socket'
import type { ChatMessage } from '@/types'

const messages = ref<ChatMessage[]>([])
const typingUsers = ref<string[]>([])

// Recevoir messages
const handleMessageReceived = (data: ChatMessage) => {
  messages.value.push({
    id: `${Date.now()}-${Math.random()}`,
    userId: data.userId,
    username: data.username,
    message: data.message,
    channel: data.channel,
    timestamp: data.timestamp,
    isSystem: data.isSystem,
    isAnonymous: data.isAnonymous,
    senderRole: data.senderRole
  })
}

// Indicateurs de frappe
const handleUserTyping = (data: { username: string }) => {
  if (!typingUsers.value.includes(data.username)) {
    typingUsers.value.push(data.username)
  }
}

const handleUserStoppedTyping = (data: { username: string }) => {
  typingUsers.value = typingUsers.value.filter(u => u !== data.username)
}

// Envoyer message
const sendMessage = (text: string, channel: ChatChannel) => {
  socketService.sendMessage({
    gameId: gameId,
    message: text,
    channel: channel
  })
}

// Indicateurs de frappe (debounced)
let typingTimeout: number | null = null

const handleTypingStart = (channel: ChatChannel) => {
  socketService.emitTypingStart(gameId, channel)

  // Auto-stop après 3 secondes
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    socketService.emitTypingStop(gameId, channel)
  }, 3000)
}

onMounted(() => {
  socketService.onMessageReceived(handleMessageReceived)
  socketService.onUserTyping(handleUserTyping)
  socketService.onUserStoppedTyping(handleUserStoppedTyping)
})

onUnmounted(() => {
  socketService.off('message-received', handleMessageReceived)
  socketService.off('user-typing', handleUserTyping)
  socketService.off('user-stopped-typing', handleUserStoppedTyping)
})
</script>
```

### Types TypeScript

**Fichier**: `src/types/index.ts`

Tous les événements sont typés pour la sécurité TypeScript:

```typescript
// Événements Socket.io
export interface RoleAssignedEvent {
  role: RoleName
  description: string
}

export interface PhaseChangedEvent {
  phase: GamePhase
  phaseNumber: number
  duration: number
  eliminatedPlayers?: Player[]
  message?: string
}

export interface TimerUpdateEvent {
  remainingTime: number
}

export interface VoteResultsEvent {
  eliminatedPlayer: Player | null
  isTie: boolean
  votes: { [playerId: string]: number }
}

export interface GameEndedEvent {
  winner: 'village' | 'werewolf' | 'lovers'
  players: Player[]
}

export interface SeerResultEvent {
  targetId: string
  role: RoleName
}

export interface ChatMessage {
  id: string
  userId?: string
  username: string
  avatar?: string | null
  message: string
  channel: ChatChannel
  timestamp: string
  isSystem?: boolean
  senderRole?: string
  isAnonymous?: boolean
}

export interface SendMessageData {
  gameId: string
  message: string
  channel: ChatChannel
}

// ... 20+ interfaces d'événements
```

### Bonnes Pratiques Utilisées

**1. Pattern Singleton**
```typescript
// Un seul service socket pour toute l'app
export const socketService = new SocketService()
```

**2. Nettoyage des listeners**
```vue
onUnmounted(() => {
  // Évite les memory leaks
  socketService.off('phase-changed', handlePhaseChanged)
  socketService.off('timer-update', handleTimerUpdate)
})
```

**3. Typage strict**
```typescript
// Callbacks typés pour chaque événement
onPhaseChanged(callback: (data: PhaseChangedEvent) => void): void
```

**4. Vérification de connexion**
```typescript
votePlayer(gameId: string, targetId: string): void {
  // Emit seulement si connecté (? = optional chaining)
  this.socket?.emit('vote-player', { gameId, targetId })
}
```

**5. Logs de débogage**
```typescript
voteMayor(gameId: string, candidateId: string): void {
  console.log('📤 Sending vote-mayor event:', { gameId, candidateId })
  this.socket?.emit('vote-mayor', { gameId, candidateId })
}
```

### Flux Complet - Exemple Concret

**Scénario**: Joueur vote pour éliminer quelqu'un

```
1. USER clicks sur PlayerCard
   ↓
2. GamePage.vue appelle handleVote(playerId)
   ↓
3. handleVote() appelle socketService.votePlayer(gameId, playerId)
   ↓
4. socketService émet 'vote-player' → SERVEUR
   ↓
5. SERVEUR traite le vote
   ↓
6. SERVEUR émet 'vote-cast' → TOUS LES CLIENTS
   ↓
7. socketService déclenche callback onVoteCast
   ↓
8. GamePage.vue met à jour l'UI (joueur a voté ✓)
   ↓
9. Quand tous ont voté → SERVEUR émet 'vote-results'
   ↓
10. socketService déclenche onVoteResults(data)
    ↓
11. GamePage.vue affiche VoteResultModal avec le résultat
```

### Gestion des Erreurs

**Erreurs socket**:

```vue
<script setup lang="ts">
const handleSocketError = (data: ErrorEvent) => {
  console.error('Socket error:', data.message)

  // Afficher toast d'erreur
  toast.error(data.message)

  // Gérer erreurs spécifiques
  if (data.message.includes('déjà voté')) {
    alreadyVoted.value = true
  }
}

onMounted(() => {
  socketService.onError(handleSocketError)
})
</script>
```

### Reconnexion Automatique

Socket.io gère la reconnexion automatiquement. Le service envoie `reconnection-data`:

```typescript
onReconnectionData(callback: (data: ReconnectionDataEvent) => void): void {
  this.socket?.on('reconnection-data', callback)
}
```

**Utilisation**:

```vue
<script setup lang="ts">
const handleReconnection = (data: ReconnectionDataEvent) => {
  console.log('Reconnecté ! Restauration état:', data)

  // Restaurer l'état du jeu
  gameStore.currentGame = data.game
  gameStore.myPlayer = data.player
  gameStore.setTimer(data.remainingTime)

  // Restaurer l'historique des actions
  actionHistory.value = data.actionHistory
}
</script>
```

### Performances et Optimisations

**1. Debouncing des événements de frappe**:
```typescript
let typingTimeout: number | null = null

const onInputChange = () => {
  if (!typingTimeout) {
    socketService.emitTypingStart(gameId, channel)
  }

  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    socketService.emitTypingStop(gameId, channel)
    typingTimeout = null
  }, 3000)
}
```

**2. Vérification de connexion avant emit**:
```typescript
if (socketService.isConnected()) {
  socketService.votePlayer(gameId, targetId)
} else {
  toast.error('Connexion perdue, reconnexion...')
}
```

**3. Singleton pour éviter multiples connexions**:
```typescript
connect(token: string): void {
  if (this.connected) {
    console.warn('Socket already connected')
    return  // Évite les doublons
  }
  // ...
}
```

### Résumé Frontend

**Socket.io côté frontend**:
- ✅ Service singleton TypeScript (`SocketService`)
- ✅ Connexion automatique au login (store auth)
- ✅ 50+ événements typés
- ✅ Nettoyage automatique des listeners (onUnmounted)
- ✅ Chat temps réel avec indicateurs de frappe
- ✅ Reconnexion automatique
- ✅ Gestion d'erreurs centralisée
- ✅ Logs de débogage
- ✅ Optional chaining pour sécurité

**Architecture**:
```
User Action
    ↓
Vue Component (GamePage.vue)
    ↓
Socket Service (socketService.votePlayer())
    ↓
Socket.io Client (emit)
    ↓
━━━━━ NETWORK ━━━━━
    ↓
Socket.io Server
    ↓
Game Logic (GameService)
    ↓
Socket.io Server (emit/broadcast)
    ↓
━━━━━ NETWORK ━━━━━
    ↓
Socket.io Client (on event)
    ↓
Socket Service (callback)
    ↓
Vue Component (update UI)
    ↓
User sees update
```
