# Utiliser Node.js 22.12.0 LTS
FROM node:22.12.0-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./
COPY .npmrc ./

# Installer les dépendances
RUN npm ci --include=optional

# Copier le reste des fichiers
COPY . .

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Démarrer l'application
CMD ["node", ".output/server/index.mjs"]
