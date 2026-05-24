/**
 * API Client with JWT Interceptor
 * 
 * Reusable fetch wrapper that automatically:
 * - Reads JWT from localStorage key "adoptme_token"
 * - Adds Authorization header when token exists
 * - Handles 401/403 responses by dispatching auth:invalid event
 * - Returns parsed JSON response
 * - Throws on non-ok responses
 */

const API_BASE_URL = 'http://localhost:8080/api';
const JWT_STORAGE_KEY = 'adoptme_token';

/**
 * Reads the JWT token from localStorage
 * @returns {string|null} The token or null if not found
 */
function getToken() {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

/**
 * Dispatches an auth:invalid custom event for global auth error handling
 * @param {number} statusCode - The HTTP status code (401 or 403)
 */
function dispatchAuthInvalid(statusCode) {
  const event = new CustomEvent('auth:invalid', {
    detail: { statusCode }
  });
  window.dispatchEvent(event);
}

/**
 * Makes an API request with automatic JWT handling
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/chat/conversations')
 * @param {RequestInit} [options] - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On non-ok responses or network errors
 */
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge headers into options
  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401/403 by dispatching auth:invalid event
    if (response.status === 401 || response.status === 403) {
      dispatchAuthInvalid(response.status);
      throw new Error(`Authentication failed: ${response.status}`);
    }

    // Throw on non-ok responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse and return JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Return empty object for non-JSON responses (e.g., 204 No Content)
    return {};
  } catch (error) {
    // Re-throw auth errors, wrap network errors
    if (error.message.includes('Authentication failed')) {
      throw error;
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach the server');
    }
    throw error;
  }
}

// Export getToken for services that need direct access
export { getToken };
