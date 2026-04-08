# VULNERABILIDAD INTRODUCIDA: Imagen con tag "latest" en lugar de versión fija
# KICS: "Image Tag Should Be Fixed" - introducida
FROM node:latest

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

# VULNERABILIDAD INTRODUCIDA: Ejecutar como root (sin USER)
# KICS: "Container Running As Root" - introducida
CMD ["node", "index.js"]