# Utiliser Node.js 22.12.0 LTS
FROM node:22.12.0-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./
COPY .npmrc ./

# Variables d'environnement pour le build
ENV NODE_ENV=production

# Installer les dépendances (skip optional dependencies qui causent problème)
RUN npm ci --omit=optional || npm install --omit=optional

# Copier le reste des fichiers
COPY . .

# Build l'application (nuxt prepare est dans le script build maintenant)
RUN npm run build

# Exposer le port
EXPOSE 3000

# Variables d'environnement runtime
ENV HOST=0.0.0.0
ENV PORT=3000

# Démarrer l'application
CMD ["node", ".output/server/index.mjs"]
