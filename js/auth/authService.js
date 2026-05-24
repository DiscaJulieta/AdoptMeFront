import { apiClient } from '../api/client.js';

/**
 * Authentication Service for real API interaction
 */
export const authService = {
    /**
     * Authenticates user and stores JWT
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            
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
     * Removes session data
     */
    logout() {
        localStorage.removeItem('adoptme_token');
        window.location.href = '/login.html';
    },

    /**
     * Persists token to LocalStorage
     * @param {string} token 
     */
    saveToken(token) {
        localStorage.setItem('adoptme_token', token);
    },

    /**
     * Retrieves token from LocalStorage
     */
    getToken() {
        return localStorage.getItem('adoptme_token');
    },

    /**
     * Checks if a session exists
     */
    isAuthenticated() {
        return !!this.getToken();
    }
};
