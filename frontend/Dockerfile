# Etapa 1: Construir la app
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package.json y package-lock.json / pnpm-lock.yaml si lo usas
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Construir la app para producción
RUN npm run build

# Etapa 2: Servir la app
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar solo lo necesario del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exponer el puerto de Next.js
EXPOSE 3000

# Arrancar la app en modo producción
CMD ["npm", "run", "start"]
