# Imagen base
FROM node:18-alpine

# Definir el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 4003

# Comando para arrancar
CMD ["node", "src/app.js"]
