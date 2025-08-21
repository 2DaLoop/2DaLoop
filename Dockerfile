# Use a Puppeteer-compatible image with Chromium dependencies
FROM node:20

# Install required libraries for Puppeteer / Chromium
RUN apt-get update && apt-get install -y \
  wget \
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
  --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /2daloopengine

# Copy package files and install
COPY package.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose port (Cloud Run expects port 8080)
ENV PORT=8080
ENV NODE_ENV=production

# Puppeteer requirement: disable sandbox in cloud environments
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Launch app
CMD ["node backend/server.js"]
