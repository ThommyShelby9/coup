# 🎨 Guide des Effets Visuels - Coup Digital

Ce document répertorie toutes les améliorations visuelles spectaculaires ajoutées au jeu.

## ✨ Effets Implémentés

### 1. **Cartes 3D Améliorées** (`components/game/Card3D.vue`)

#### Effets ajoutés:
- ✅ **Rotation 3D au hover** - Les cartes se soulèvent et tournent légèrement
- ✅ **Effet de brillance** - Une lumière traverse la carte périodiquement
- ✅ **Glow animé** - Halo doré qui pulse pour les cartes sélectionnées
- ✅ **Transitions fluides** - Animations avec cubic-bezier pour un mouvement naturel
- ✅ **Shadow dynamique** - Ombres portées qui suivent les mouvements

#### Comment l'utiliser:
```vue
<Card3D
  :card="card"
  :interactive="true"
  :selected="isSelected"
  @click="handleCardClick"
/>
```

### 2. **Background Animé** (`components/effects/AnimatedBackground.vue`)

#### Caractéristiques:
- ✅ **Orbes de gradient** - 3 orbes colorés qui flottent en arrière-plan
- ✅ **Particules flottantes** - 30 petites étoiles qui montent lentement
- ✅ **Grille hexagonale** - Motif subtil de hexagones
- ✅ **Effet de vignette** - Assombrit les bords pour focus central

#### Intégration:
```vue
<template>
  <div class="game-container">
    <AnimatedBackground />
    <!-- Votre contenu ici -->
  </div>
</template>
```

### 3. **Système de Particules** (`components/effects/ParticleEffect.vue`)

#### Types de particules disponibles:
- 💰 **coin** - Pièces dorées qui volent
- ⭐ **star** - Étoiles scintillantes
- ❤️ **heart** - Cœurs qui montent
- ✨ **sparkle** - Étincelles magiques
- 💥 **explosion** - Effet d'explosion

#### Utilisation:
```vue
<ParticleEffect
  :active="showEffect"
  type="coin"
  :count="20"
  :x="50"
  :y="50"
/>
```

### 4. **Animations GSAP Avancées** (`composables/useGameAnimations.ts`)

#### Animations disponibles:

##### Pièces Volantes
```typescript
const animations = useGameAnimations()

// Animer transfert de pièces
animations.animateCoinTransfer(
  fromPlayerElement,
  toPlayerElement,
  amount,
  () => console.log('Terminé!')
)
```

##### Autres animations:
- `animateCardDeal()` - Distribution des cartes
- `animateBluffSuccess()` - Succès d'un bluff (particules vertes)
- `animateBluffFailed()` - Échec d'un bluff (shake)
- `animateCardFlip()` - Retournement de carte 3D
- `animateCardElimination()` - Carte qui disparaît
- `animateAttack()` - Projectile rouge pour attaques
- `animateVictory()` - Confettis de victoire
- `animateTurnChange()` - Highlight du joueur actif

### 5. **Cartes de Joueurs avec Effets** (dans `pages/game/[code].vue`)

#### Effets CSS:
- ✅ **player-active** - Animation de glow doré pulsant
- ✅ **Bordure animée** - Gradient qui tourne autour du joueur actif
- ✅ **Shimmer effect** - Lumière qui traverse la carte
- ✅ **Hover effects** - Élévation au survol

```css
/* Appliqué automatiquement au joueur actif */
.player-active {
  animation: player-glow 2s ease-in-out infinite;
}
```

### 6. **Boutons Améliorés**

#### Classes disponibles:
```html
<!-- Bouton primaire avec glow -->
<button class="btn-primary">
  Jouer
</button>

<!-- Bouton secondaire -->
<button class="btn-secondary">
  Annuler
</button>

<!-- Actions avec effets -->
<button class="action-btn action-role">
  Tax (Duke)
</button>

<button class="action-btn action-danger">
  Assassiner
</button>
```

#### Effets:
- ✅ **Ripple effect** - Onde au clic
- ✅ **Élévation** - Monte au hover
- ✅ **Glow coloré** - Halo selon le type d'action

### 7. **Toasts Améliorés** (`components/ui/ToastNotification.vue`)

#### Améliorations:
- ✅ **Entrée dynamique** - Glisse depuis la droite avec rotation
- ✅ **Glow selon le type** - Couleur adaptée (bleu/vert/jaune/rouge)
- ✅ **Effet de brillance** - Lumière qui traverse
- ✅ **Animation de sortie** - Disparaît en douceur

### 8. **Indicateur de Tour** (`components/game/TurnIndicator.vue`)

#### Caractéristiques:
- ✅ **Animation spectaculaire** - Zoom avec rotation
- ✅ **Couronne qui saute** - Icône animée
- ✅ **Texte qui brille** - Effet de glow sur le nom
- ✅ **Particules explosives** - 20 particules qui s'éloignent
- ✅ **Auto-hide** - Disparaît après 2 secondes

#### Utilisation:
```vue
<TurnIndicator
  :show="showTurnIndicator"
  :player-name="currentPlayer.username"
/>
```

### 9. **Classes CSS Utilitaires** (`assets/css/animations.css`)

#### Classes disponibles:

##### Effets de Glow
```html
<div class="glow-gold">Halo doré</div>
<div class="glow-blue">Halo bleu</div>
<div class="glow-red">Halo rouge</div>
<div class="glow-green">Halo vert</div>
```

##### Animations
```html
<div class="float">Flotte doucement</div>
<div class="pulse-glow">Pulse</div>
<div class="shake">Tremble</div>
<div class="bounce-in">Entre en rebondissant</div>
<div class="shimmer">Effet de brillance</div>
<div class="spin">Tourne</div>
```

##### Texte
```html
<h1 class="text-glow-gold">Texte qui brille</h1>
```

##### Hover
```html
<div class="perspective-hover">Rotation 3D au hover</div>
```

## 🎮 Intégration dans le Jeu

### Page de Jeu Principale

Le fichier `pages/game/[code].vue` utilise maintenant:
1. **AnimatedBackground** - Fond animé permanent
2. **Effets sur les cartes de joueurs** - Glow pour le joueur actif
3. **Boutons avec animations** - Tous les boutons d'action
4. **Toasts améliorés** - Notifications spectaculaires

### Effets Automatiques

Certains effets sont déjà intégrés et se déclenchent automatiquement:
- ✅ Tour du joueur → Glow doré animé
- ✅ Transfert de pièces → Animations de pièces volantes
- ✅ Victoire → Confettis
- ✅ Notifications → Toasts animés

## 🚀 Prochaines Améliorations Possibles

### Effets Sonores
- 🔲 Bruitages pour chaque action
- 🔲 Musique d'ambiance
- 🔲 Son de pièces qui tombent

### Effets Visuels Avancés
- 🔲 Trainées de lumière pour les actions
- 🔲 Explosion de particules pour les éliminations
- 🔲 Effet de "fumée" pour les contestations
- 🔲 Aura différente pour chaque rôle de carte

### Animations de Personnages
- 🔲 Avatars 3D des joueurs
- 🔲 Expressions faciales animées
- 🔲 Gestes pour chaque action

### Effets de Table
- 🔲 Table 3D avec Three.js
- 🔲 Cartes posées sur la table
- 🔲 Effet de profondeur de champ

## 📝 Notes de Performance

Tous les effets ont été optimisés pour:
- ✅ **60 FPS stable** - Animations fluides
- ✅ **GPU acceleration** - Utilisation de transform et opacity
- ✅ **Lazy loading** - Particules créées à la demande
- ✅ **Cleanup automatique** - Suppression des éléments DOM inutiles

## 🎨 Personnalisation

### Modifier les Couleurs

Les couleurs principales sont dans `tailwind.config.js`:
```javascript
colors: {
  royal: { /* ... */ },
  gold: { /* ... */ }
}
```

### Ajuster les Timings

Les durées d'animation peuvent être modifiées dans:
- CSS: `duration` des keyframes
- GSAP: paramètre `duration` des animations
- Particules: props `duration` des composants

### Désactiver des Effets

Pour désactiver un effet, commentez simplement le composant:
```vue
<!-- <AnimatedBackground /> -->
```

## 🐛 Debugging

Pour voir les performances des animations:
1. Ouvrez les DevTools
2. Performance tab
3. Enregistrez pendant une partie
4. Vérifiez que le FPS reste ≥ 60

---

**Créé avec ❤️ pour Coup Digital**
