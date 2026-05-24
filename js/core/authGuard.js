/**
 * Auth Guard Middleware
 * 
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to login and authenticated users away from login.
 */

import { authService } from '../services/authService.js';

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
function isAuthenticated() {
  return authService.isAuthenticated();
}

/**
 * Check if user can access the current route
 * @returns {boolean} True if access is allowed
 */
function canAccess() {
  // For now, simple check - if authenticated, can access protected routes
  // The router handles the actual route protection logic
  return isAuthenticated();
}

/**
 * Redirect unauthenticated user to login page
 * Preserves the current URL for post-login redirect
 */
function redirectToLogin() {
  const currentUrl = window.location.href;
  
  // Store return URL for redirect after successful login
  sessionStorage.setItem('redirectAfterLogin', currentUrl);
  
  // Navigate to login.html
  window.location.href = 'login.html';
}

/**
 * Redirect authenticated user away from login page
 * Redirects to swipe page by default
 */
function redirectIfAuthenticated() {
  window.location.href = 'index.html#/swipe';
}

/**
 * Check authentication and redirect if needed
 * @returns {boolean} True if authenticated, false if redirect happened
 */
function checkAuth() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return false;
  }
  return true;
}

// Export auth guard API
export const authGuard = {
  isAuthenticated,
  canAccess,
  redirectToLogin,
  redirectIfAuthenticated,
  checkAuth
};

export default authGuard;
