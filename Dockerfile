FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
#COPY .env .env
#RUN npm install
COPY . .
#RUN npm run build 

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app /app
#RUN npm install --omit=dev

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium
RUN apt-get update && apt-get install -y chromium && rm -rf /var/lib/apt/lists/*

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Point Puppeteer to Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "backend/server.js"]
