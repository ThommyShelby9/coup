FROM node:22.12.0-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier package.json ET package-lock.json pour des builds deterministes
COPY package.json package-lock.json ./

# Installer les dependances avec ci pour respecter le lockfile
RUN npm ci --no-audit --no-fund

# Copier le code source
COPY . .

# Nettoyer tout ancien build avant de rebuilder
RUN rm -rf .output .nuxt

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
