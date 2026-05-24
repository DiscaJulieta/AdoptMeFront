/**
 * Hash-based Router
 * 
 * Lightweight client-side router using URL hash navigation.
 * Provides route definitions, parameter extraction, and auth guard integration.
 */

import { authGuard } from './authGuard.js';

// Route definitions with page mappings
const routes = [
  { path: '/login', page: 'login.html', protected: false },
  { path: '/swipe', page: 'index.html', protected: true },
  { path: '/chat/:id', page: 'chat.html', protected: true }
];

// Current route state
let currentRoute = null;

// Route change subscribers
const subscribers = [];

/**
 * Parse hash URL into route components
 * @param {string} hash - URL hash (e.g., '#/chat/123')
 * @returns {Object} Route object with path, params, and query
 */
function parseHash(hash) {
  // Remove leading # and split path from query
  const cleanHash = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = cleanHash.split('?');
  
  const path = pathPart || '/';
  const query = {};
  
  // Parse query parameters
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
  }
  
  return { path, query };
}

/**
 * Match a path against route definitions and extract parameters
 * @param {string} path - Path to match
 * @returns {Object|null} Match result with route info and params, or null if no match
 */
function matchRoute(path) {
  for (const route of routes) {
    const routeParts = route.path.split('/');
    const pathParts = path.split('/');
    
    // Skip if different number of segments
    if (routeParts.length !== pathParts.length) {
      continue;
    }
    
    const params = {};
    let matches = true;
    
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      
      // Check if this is a parameter (starts with :)
      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        params[paramName] = pathPart;
      } else if (routePart !== pathPart) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return {
        path: route.path,
        page: route.page,
        params,
        protected: route.protected
      };
    }
  }
  
  return null;
}

/**
 * Navigate to a hash route
 * @param {string} hash - Target hash route (e.g., '#/swipe' or '#/chat/123')
 */
function navigate(hash) {
  const { path } = parseHash(hash);
  const matched = matchRoute(path);
  
  if (!matched) {
    console.warn('[Router] Cannot navigate to unknown route:', path);
    return;
  }
  
  // Get current page from URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // If target page is different from current page, navigate to it
  if (matched.page !== currentPage) {
    window.location.href = matched.page + hash;
  } else if (window.location.hash !== hash) {
    // Same page, just change hash
    window.location.hash = hash;
  } else {
    // Force route change event even if hash is the same
    handleHashChange();
  }
}

/**
 * Get current route information
 * @returns {Object|null} Current route object with path, params, and query
 */
function getCurrentRoute() {
  return currentRoute;
}

/**
 * Subscribe to route changes
 * @param {Function} callback - Function to call on route change, receives route object
 * @returns {Function} Unsubscribe function
 */
function onRouteChange(callback) {
  subscribers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

/**
 * Notify all subscribers of a route change
 * @param {Object} route - Route object to pass to subscribers
 */
function notifySubscribers(route) {
  subscribers.forEach(callback => {
    try {
      callback(route);
    } catch (error) {
      console.error('[Router] Error in route change subscriber:', error);
    }
  });
}

/**
 * Handle hash change events
 */
function handleHashChange() {
  const hash = window.location.hash;
  const { path, query } = parseHash(hash);
  const matched = matchRoute(path);
  
  // Handle empty/default route
  if (!hash || hash === '' || hash === '#') {
    if (authGuard.isAuthenticated()) {
      navigate('#/swipe');
    } else {
      window.location.href = 'login.html';
    }
    return;
  }
  
  if (!matched) {
    // Unknown route - redirect based on auth status
    if (authGuard.isAuthenticated()) {
      navigate('#/swipe');
    } else {
      window.location.href = 'login.html';
    }
    return;
  }
  
  // Check auth guard for protected routes
  if (matched.protected && !authGuard.canAccess()) {
    // Redirect to login for protected routes when not authenticated
    authGuard.redirectToLogin();
    return;
  }
  
  // Check if authenticated user is trying to access login page
  if (!matched.protected && path === '/login' && authGuard.isAuthenticated()) {
    // Redirect authenticated users away from login
    authGuard.redirectIfAuthenticated();
    return;
  }
  
  // Route is valid and authorized
  currentRoute = {
    path: matched.path,
    params: matched.params,
    query,
    protected: matched.protected,
    page: matched.page
  };
  
  notifySubscribers(currentRoute);
}

/**
 * Initialize the router
 * Sets up hashchange event listener and processes initial route
 * @param {Object} options - Optional configuration
 * @param {boolean} options.skipGuards - Skip auth guard checks (for standalone pages)
 */
function init(options = {}) {
  const { skipGuards = false } = options;
  
  // Listen to hash changes (browser back/forward)
  window.addEventListener('hashchange', handleHashChange);
  
  // Process initial route
  if (!skipGuards) {
    handleHashChange();
  }
}

// Export router API
export const router = {
  navigate,
  getCurrentRoute,
  onRouteChange,
  init
};

// Initialize router when module loads (with guards enabled by default)
// Standalone pages (like chat.html) should import and call router.init({ skipGuards: true }) manually
// and handle auth themselves
init();

export default router;
