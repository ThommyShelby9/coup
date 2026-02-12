FROM node:22.12.0-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier package.json uniquement
COPY package.json ./

# Installer les dependances sans scripts (source pas encore copiee)
RUN npm install --no-audit --no-fund --ignore-scripts

# Copier le code source AVANT nuxt prepare
COPY . .

# Nettoyer tout ancien build
RUN rm -rf .output .nuxt

# Maintenant que le source est la, executer nuxt prepare
RUN npx nuxt prepare

# Build Nuxt
RUN npm run build

# Verifier que les assets sont bien generes
RUN ls -la .output/public/_nuxt/ | head -20

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
