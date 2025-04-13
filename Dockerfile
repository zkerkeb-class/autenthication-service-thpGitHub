FROM node:18-alpine AS builder

# Installer pnpm
RUN npm install -g pnpm

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le reste du code source
COPY . .

# Compiler l'application TypeScript
RUN pnpm build

# Stage de production - image plus légère
FROM node:18-alpine

# Installer pnpm
RUN npm install -g pnpm

# Créer un utilisateur non-root pour plus de sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'exécution
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Installer uniquement les dépendances de production
RUN pnpm install --prod --frozen-lockfile

# Créer le dossier pour les logs
RUN mkdir -p logs

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/index.js"] 