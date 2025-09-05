const API_KEY = import.meta.env.VITE_API_KEY;
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