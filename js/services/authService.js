/**
 * Auth Service
 * 
 * Handles JWT token management and authentication state.
 * Provides methods for token storage, retrieval, login, logout, and auth error handling.
 */

import { apiClient } from '../api/client.js';

const JWT_STORAGE_KEY = 'adoptme_token';

function normalizeToken(token) {
  if (!token || typeof token !== 'string') return null;
  return token.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Decode JWT token payload to extract user information
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Auth service object with methods for managing authentication state
 */
export const authService = {
  /**
   * Reads the JWT token from localStorage
   * @returns {string|null} The token or null if not found
   */
  getJwt() {
    const stored = localStorage.getItem(JWT_STORAGE_KEY);
    const normalized = normalizeToken(stored);

    if (stored && normalized && stored !== normalized) {
      localStorage.setItem(JWT_STORAGE_KEY, normalized);
    }

    return normalized;
  },

  /**
   * Alias for getJwt() - returns the token from localStorage
   * @returns {string|null} The token or null if not found
   */
  getToken() {
    return this.getJwt();
  },

  /**
   * Saves the JWT token to localStorage
   * @param {string} token - The JWT token to store
   */
  setJwt(token) {
    const normalized = normalizeToken(token);
    if (!normalized) {
      localStorage.removeItem(JWT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(JWT_STORAGE_KEY, normalized);
  },

  /**
   * Alias for setJwt() - saves token to localStorage
   * @param {string} token - The JWT token to store
   */
  saveToken(token) {
    this.setJwt(token);
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
   * Authenticates user and stores JWT token
   * Backend expects `username` in the request payload.
   * @param {string} email - User email/username value
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, token: string}>} Login result
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        username: email,
        password,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token } = data;

      if (token) {
        this.saveToken(token);
        return { success: true, token };
      }
      
      throw new Error('No token received from backend');
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  /**
   * Logs out the user by clearing auth state and redirecting to login
   */
  logout() {
    this.clearAuth();
    window.location.href = '/login.html';
  },

  /**
   * Gets the current user information from the JWT token
   * @returns {Object|null} User object with id, email, etc. or null if not authenticated
   */
  getCurrentUser() {
    const token = this.getToken();
    const payload = decodeToken(token);
    
    if (!payload) return null;
    
    return {
      id: payload.sub || payload.userId || payload.id,
      email: payload.email,
      ...payload
    };
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
    authService.handleAuthError();
  });
}

// Initialize the listener when this module loads
initAuthListener();

export default authService;
