# 🃏 Coup Digital

Jeu de cartes **Coup** en temps réel avec interface 3D immersive.

## 🚀 Quick Start

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

Le jeu sera accessible sur `http://localhost:3000`

## 🛠 Stack Technique

- **Framework**: Nuxt 3 (Vue 3 + SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + SCSS
- **Database**: MongoDB avec Mongoose
- **WebSockets**: Socket.io
- **3D/Animation**: Three.js + GSAP
- **State**: Pinia
- **Icons**: Lucide Vue

## 📁 Structure du Projet

```
coup-digital/
├── components/       # Composants Vue
│   ├── game/        # Composants de jeu
│   ├── lobby/       # Composants de lobby
│   ├── ui/          # Composants UI réutilisables
│   └── 3d/          # Composants 3D
├── pages/           # Pages Nuxt
├── server/          # Backend Nuxt
│   ├── api/         # Endpoints API
│   ├── models/      # Modèles MongoDB
│   ├── services/    # Logique métier
│   └── socket/      # Handlers WebSocket
├── stores/          # Stores Pinia
├── types/           # Types TypeScript
└── utils/           # Fonctions utilitaires
```

## 🎮 Comment Jouer

1. Créez un compte ou connectez-vous
2. Créez une partie ou rejoignez-en une
3. Attendez que tous les joueurs soient prêts
4. Bluffez, contestez et éliminez vos adversaires !

## 📝 Scripts

```bash
npm run dev      # Développement
npm run build    # Production build
npm run preview  # Preview production
```

## 🔧 Configuration

Les variables d'environnement sont dans `.env`:
- `MONGODB_URI`: URI de connexion MongoDB
- `JWT_SECRET`: Secret pour JWT (à changer en production!)
- `NUXT_PUBLIC_SITE_URL`: URL du site

## 📄 Licence

MIT
