import { ROUTES } from './routes.js';

const app = document.querySelector('#app');
let currentRoute = location.hash || '#/'; // default to home

// load content for a route
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

        // remove previously loaded script
        const existingScript = document.querySelector(`script[data-route-script]`);
        if (existingScript) {
            existingScript.remove();
        }

        // load current script for a route
        if (routeInfo.script) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = `${routeInfo.script}?t=${Date.now()}`;
            script.setAttribute("data-route-script", "true");
            document.body.appendChild(script);
        }
    } catch (error) {
        console.error(error);
        app.innerHTML = '<p>Error loading content.</p>';
    }
};

// use to navigate to new route
const navigate = async (route) => {
    const routeInfo = ROUTES[route];

    if (location.hash !== route) {
        location.hash = route;
    }
};

window.addEventListener('hashchange', async () => {
    const newRoute = location.hash || '#/';
    const routeInfo = ROUTES[newRoute];
    if (newRoute !== currentRoute) {
        currentRoute = newRoute;
        renderContent(newRoute);
    }
});

// load initial content
const initializeRoutes = async () => {
    const initialRoute = location.hash || '#/';
    renderContent(initialRoute);
}

export { initializeRoutes, navigate };