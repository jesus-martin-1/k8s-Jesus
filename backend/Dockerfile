FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# CORRECCIÓN: Añadir usuario no-root para evitar ejecutar como root
# KICS: "Missing User Instruction" - corregida
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 3000
CMD ["node", "index.js"]