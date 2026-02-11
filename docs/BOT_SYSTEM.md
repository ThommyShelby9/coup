# 🤖 Système de Bot/IA - Coup Digital

## Vue d'ensemble

Le système de bot permet d'ajouter des joueurs IA intelligents qui peuvent:
- Jouer automatiquement des actions
- Bluffer de manière stratégique
- Contester et bloquer les actions des adversaires
- S'adapter selon la difficulté et la personnalité configurée

## 🎯 Niveaux de difficulté

### Easy (Facile) 🟢
- **Bluff**: 10% du temps
- **Contestation**: Seuil élevé (80%)
- **Comportement**: Prévisible, joue prudemment
- **Actions**: Préfère Income et Foreign Aid
- **Idéal pour**: Débutants, apprentissage des règles

### Medium (Moyen) 🟡
- **Bluff**: 30% du temps
- **Contestation**: Seuil moyen (60%)
- **Comportement**: Équilibré entre sécurité et risque
- **Actions**: Mix d'actions basiques et de rôles
- **Idéal pour**: Joueurs intermédiaires

### Hard (Difficile) 🔴
- **Bluff**: 50% du temps
- **Contestation**: Seuil bas (40%)
- **Comportement**: Agressif et imprévisible
- **Actions**: Utilise toutes les actions tactiquement
- **Analyse**: Mémorise les cartes révélées
- **Idéal pour**: Joueurs expérimentés

## 🎭 Personnalités

### Balanced (Équilibré) ⚖️
- Mix équilibré d'offensive et défensive
- Adapte son jeu selon la situation

### Aggressive (Agressif) ⚔️
- Joue agressivement (Coup, Assassinate, Steal)
- Prend plus de risques
- Bluffe plus fréquemment (60%)

### Defensive (Défensif) 🛡️
- Joue prudemment
- Conteste et bloque plus souvent (70%)
- Préfère les actions sûres

### Bluffer (Bluffeur) 🎭
- Bluffe très fréquemment (80%)
- Conteste moins souvent (30%)
- Déstabilise les adversaires

## 📋 Architecture technique

### Fichiers créés

```
server/
├── ai/
│   └── BotPlayer.ts          # Logique de décision du bot
├── services/
│   └── BotService.ts         # Gestion des bots
└── api/
    └── bot/
        ├── add.post.ts       # Ajouter un bot
        ├── remove.post.ts    # Retirer un bot
        └── execute-turn.post.ts  # Exécuter le tour d'un bot

composables/
└── useBotTurn.ts             # Surveillance automatique des tours

components/
└── lobby/
    └── AddBotButton.vue      # Interface d'ajout de bot

types/
└── bot.ts                    # Types TypeScript
```

### BotPlayer - Algorithmes de décision

**1. Décision d'action (`decideAction`)**
```typescript
// Logique de décision:
1. Si 10+ pièces → Coup obligatoire
2. Si 7+ pièces et agressif → Coup tactique
3. Si a Assassin et 3+ pièces → Assassinate (70%)
4. Si bluff activé → Bluff Assassinate
5. Si a Duke → Tax
6. Si bluff activé → Bluff Tax
7. Si a Captain → Steal
8. Si bluff activé → Bluff Steal
9. Foreign Aid (sûr)
10. Income (toujours sûr)
```

**2. Contestation (`shouldChallenge`)**
```typescript
// Calcul de probabilité:
- Cartes totales de ce type: 3
- Cartes révélées: mémoire bot
- Mes propres cartes: connues
- Probabilité = disponibles / total

// Décision:
if (probabilité < seuil) → Contester
+ Facteur aléatoire pour imprévisibilité
```

**3. Blocage (`shouldBlock`)**
```typescript
// Logique:
1. Déterminer rôles bloquants possibles
2. Si a la carte → 90% bloquer si ciblé, 40% sinon
3. Si bluff activé et ciblé → Bluff de blocage
```

### BotService - Gestion

**Fonctionnalités:**
- Génération de noms uniques
- Création d'utilisateurs bot fictifs
- Stockage des métadonnées (difficulté, personnalité)
- Construction de l'état du jeu pour le bot
- Exécution automatique des tours

### useBotTurn - Automation

**Surveillance automatique:**
```typescript
Toutes les 2 secondes:
1. Vérifier si phase = 'playing'
2. Vérifier si joueur actuel est un bot
3. Vérifier si pas d'action en attente
4. → Exécuter le tour du bot automatiquement
```

## 🎮 Utilisation

### Ajouter un bot via API

```typescript
const response = await $fetch('/api/bot/add', {
  method: 'POST',
  body: {
    gameId: 'game-id-here',
    difficulty: 'medium',  // easy, medium, hard
    personality: 'balanced' // balanced, aggressive, defensive, bluffer
  }
})
```

### Ajouter un bot via UI

1. Créer une partie
2. En tant qu'hôte, dans le lobby
3. Voir le panneau "Ajouter un Bot"
4. Choisir difficulté et personnalité
5. Cliquer "Ajouter Bot"

### Indicateurs visuels

- **Badge BOT**: Affiché à côté du nom
- **Icône robot**: Dans l'avatar du joueur
- **Message "Réflexion..."**: Quand le bot prend sa décision

## 🧠 Mémoire du bot

Le bot mémorise:
- **Cartes révélées**: Map<playerId, CardType[]>
- **Actions des joueurs**: Map<playerId, ActionType[]>
- **Bluffs réussis**: Map<playerId, number>
- **Bluffs échoués**: Map<playerId, number>

Cette mémoire est utilisée pour:
- Calculer la probabilité qu'un joueur ait une carte
- Détecter les patterns de jeu
- Ajuster les décisions

## 🔮 Améliorations futures

- [ ] Apprentissage machine (ML) basé sur les parties
- [ ] Analyse plus poussée des patterns
- [ ] Différentes stratégies selon le nombre de joueurs
- [ ] Système de réputation des joueurs
- [ ] Bots avec des noms de personnages historiques
- [ ] Stats des bots (winrate, etc.)

## 🐛 Debug

Activer les logs du bot:
```javascript
console.log('🤖 Bot decision:', decision)
console.log('🤖 Bot challenge decision:', challengeDecision)
console.log('🤖 Bot block decision:', blockDecision)
```

## 📊 Exemple de partie

```
Partie avec 3 joueurs humains + 1 bot Hard "Clever Claude"

Tour 1: Clever Claude
- État: 2 pièces, 2 cartes (Duke, Captain)
- Décision: Tax (Duke) - Véritable
- Résultat: +3 pièces → 5 pièces

Tour 5: Clever Claude
- État: 8 pièces, 1 carte (Captain)
- Décision: Assassinate (Bluff Assassin)
- Joueur B conteste
- Révélation: N'a pas Assassin
- Résultat: Clever Claude perd sa dernière carte → Éliminé

Clever Claude a bien joué mais a pris un risque calculé!
```

## 🎯 Conclusion

Le système de bot permet:
- ✅ Tests faciles sans plusieurs joueurs
- ✅ Entraînement en solo
- ✅ Parties complètes avec slots manquants
- ✅ Expérience de jeu réaliste et challengeante

Le bot utilise des algorithmes probabilistes et stratégiques qui imitent les décisions humaines tout en restant fair-play et amusant à affronter!
