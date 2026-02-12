FROM node:22.12.0-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier package.json uniquement (pas le lockfile Windows qui manque les binaires Linux)
COPY package.json ./

# Installer les dependances - npm install resout les bons binaires natifs pour Linux
RUN npm install --no-audit --no-fund --ignore-scripts

# Installer les binaires natifs rollup pour Linux musl
RUN npm install @rollup/rollup-linux-x64-musl --no-save 2>/dev/null || true

# Executer les scripts postinstall maintenant
RUN npm run --if-present postinstall || true

# Copier le code source
COPY . .

# Nettoyer tout ancien build
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
