# Dockerfile for 2DaLoop-dev application
# This Dockerfile sets up a Node.js environment with Puppeteer for web scraping and Google Maps
# Use official Node.js base with full OS
FROM node:20-slim

# Puppeteer needs dependencies to run Chromium
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
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /suggestionengine

# Copy and install dependencies
COPY package.json ./
RUN npm install

# Copy app source code
COPY 
const API_KEY = window.ENV.API_KEY;
(g => {var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => {await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a)})); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))})({
    key: API_KEY,
    v: "weekly",
});

import { initializeRoutes } from "./utils/pageRouter.js";
import { loadSidebar } from './components/sidebar.js';

loadSidebar();
initializeRoutes();

// Show cookie popup if not accepted
if (!localStorage.getItem('cookieAccepted')) {
    const cookieEl = document.getElementById('cookie-popup');
    if (cookieEl) {
        cookieEl.classList.remove('hidden');
        fetch('src/components/cookie-popup.html')
            .then(response => response.text())
            .then(html => {
                cookieEl.innerHTML = html;

                const script = document.createElement('script');
                script.src = 'src/components/cookie-popup.js';
                document.body.appendChild(script);
            })
    }
}

# Puppeteer: avoid re-downloading Chromium (optional)
ENV PUPPETEER_SKIP_DOWNLOAD=false

# Install Chromium via Puppeteer (optional fallback)
RUN npm install puppeteer

# Allow puppeteer to run as root
ENV PUPPETEER_EXECUTABLE_PATH=\2DaLoop-dev\2DaLoop-dev\node_modules\puppeteer
ENV NODE_ENV=production

# Expose the port your Express app listens on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
