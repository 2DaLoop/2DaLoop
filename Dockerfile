FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
COPY .env .env
RUN npm install
COPY . .
RUN npm run build 
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app /app
RUN npm install --omit=dev
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
CMD ["node", "backend/server.js"]








