/**
 * Auth Service
 * 
 * Handles JWT token management and authentication state.
 * Provides methods for token storage, retrieval, and auth error handling.
 */

const JWT_STORAGE_KEY = 'adoptme_token';

/**
 * Auth service object with methods for managing authentication state
 */
export const authService = {
  /**
   * Reads the JWT token from localStorage
   * @returns {string|null} The token or null if not found
   */
  getJwt() {
    return localStorage.getItem(JWT_STORAGE_KEY);
  },

  /**
   * Saves the JWT token to localStorage
   * @param {string} token - The JWT token to store
   */
  setJwt(token) {
    localStorage.setItem(JWT_STORAGE_KEY, token);
  },

  /**
   * Removes the JWT token from localStorage
   */
  clearAuth() {
    localStorage.removeItem(JWT_STORAGE_KEY);
  },

  /**
   * Checks if the user is authenticated (has a valid token)
   * @returns {boolean} True if token exists, false otherwise
   */
  isAuthenticated() {
    return this.getJwt() !== null;
  },

  /**
   * Handles authentication errors (401/403 responses)
   * - Clears the stored token
   * - Shows error message (console for now)
   * - Redirects to login page
   */
  handleAuthError() {
    // Clear authentication state
    this.clearAuth();

    // Show error message (console for now - will be replaced with toast)
    console.error('[AuthService] Authentication failed. Redirecting to login...');

    // Prevent redirect loop by checking current path
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && !currentPath.endsWith('login.html')) {
      // Store the current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.href);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }
};

// Set up global auth:invalid event listener
function initAuthListener() {
  window.addEventListener('auth:invalid', (event) => {
    console.log('[AuthService] Received auth:invalid event:', event.detail);
    authService.handleAuthError();
  });
}

// Initialize the listener when this module loads
initAuthListener();

export default authService;
