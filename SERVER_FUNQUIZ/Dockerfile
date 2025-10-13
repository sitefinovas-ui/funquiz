# ... existing code ...
FROM node:20-slim

RUN apt-get update && apt-get install -y \
  chromium \
  libnss3 libatk-bridge2.0-0 libx11-6 libxcomposite1 libxrandr2 libgbm1 libxss1 libgtk-3-0 libasound2 \
  fonts-liberation xdg-utils \
  && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV HEADLESS=true

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node","server.js"]