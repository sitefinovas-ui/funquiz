# Base Node.js
FROM node:20-slim

# Dépendances système nécessaires pour Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    unzip \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du projet
COPY . .

# Variables d'environnement Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

# Exposer le port de ton app
EXPOSE 3000

# Lancer l’application
CMD ["node", "server.js"]