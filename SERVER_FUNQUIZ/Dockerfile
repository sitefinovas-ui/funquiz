# --------------------------
# Dockerfile pour FunQuiz Backend (Node + WhatsApp + MySQL)
# Compatible Render + ES6
# --------------------------

FROM node:20-slim

# Installer Chromium et dépendances nécessaires à Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Chemin du binaire Chrome à exposer à Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Créer le répertoire de travail
WORKDIR /app

# Copier le code source
COPY . .

# Installer les dépendances
RUN npm install

# Exposer le port du backend
EXPOSE 5100

# Commande de démarrage
CMD ["npm", "start"]
