import { ROUTES } from './routes.js';

const app = document.querySelector('#app');

// Always render content for the current route
const renderContent = async (route) => {
    try {
        const routeInfo = ROUTES[route];
        if (!routeInfo) {
            throw new Error('Route not found');
        }

        const response = await fetch(`${routeInfo.page}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Error loading ${routeInfo.filePath}: ${response.statusText}`);
        }

        const content = await response.text();
        app.innerHTML = content;

        // Remove previously loaded route script
        const existingScript = document.querySelector(`script[data-route-script]`);
        if (existingScript) {
            existingScript.remove();
        }

        // Load current script for the route
        if (routeInfo.script) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = routeInfo.script + `?t=${Date.now()}`; // cache busting
            script.setAttribute("data-route-script", "true");
            document.body.appendChild(script);
        }
    } catch (error) {
        console.error(error);
        app.innerHTML = '<p>Error loading content.</p>';
    }
};

// Use to navigate to a new route
const navigate = (route) => {
    if (location.hash !== route) {
        location.hash = route;
    } else {
        renderContent(route);
    }
};

// Always render content on hash change
window.addEventListener('hashchange', () => {
    const newRoute = location.hash || '#/';
    renderContent(newRoute);
});

// Load initial content
const initializeRoutes = () => {
    const initialRoute = location.hash || '#/';
    renderContent(initialRoute);
};

window.navigate = navigate;
window.initializeRoutes = initializeRoutes;