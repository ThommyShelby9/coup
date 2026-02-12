FROM node:22.12.0-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier les fichiers de config
COPY package.json ./

# Installer les dependances (sans lock file pour resoudre les bons binaires linux)
RUN npm install --no-audit --no-fund

# Copier le code source
COPY . .

# Build Nuxt
RUN npm run build

# --- Stage production ---
FROM node:22.12.0-alpine

WORKDIR /app

# Copier tout le build output
COPY --from=build /app/.output .output

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
