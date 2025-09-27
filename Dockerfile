# ===============================
# Etapa 1: build
# ===============================
FROM node:18-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (solo necesarias para build)
RUN npm install

# Copiar todo el código fuente
COPY . .

# ===============================
# Etapa 2: producción
# ===============================
FROM node:18-alpine

WORKDIR /app

# Instalar tini (para manejar procesos correctamente en Docker)
RUN apk add --no-cache tini

# Copiar dependencias desde la etapa build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

# Variables de entorno por defecto (se pueden sobreescribir en runtime)
ENV NODE_ENV=production
ENV PORT=4003

# Exponer el puerto
EXPOSE 4003

# Usar tini para manejar señales correctamente
ENTRYPOINT ["/sbin/tini", "--"]

# Comando de arranque
CMD ["node", "src/app.js"]
