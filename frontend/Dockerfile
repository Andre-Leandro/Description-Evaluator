# Etapa de construcción
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY . .

# Declarar ARG y pasarlo a ENV (para que Next lo tome en el build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Instalar dependencias y construir la aplicación
RUN npm ci
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Puerto en el que se ejecutará la aplicación
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
