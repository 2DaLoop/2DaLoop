FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
COPY .env .env
RUN npm install
COPY . .
#RUN npm run build 
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app /app
RUN npm install --omit=dev
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
# Install necessary dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
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
    libu2f-udev \
    libxshmfence1 \
    libglu1-mesa \
    chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
CMD ["node", "backend/server.js"]








