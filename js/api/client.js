import { API_BASE_URL } from '../config.js';

function buildAuthHeader(token) {
    if (!token || typeof token !== 'string') return null;
    const normalized = token.replace(/^Bearer\s+/i, '').trim();
    if (!normalized) return null;
    return `Bearer ${normalized}`;
}

/**
 * Basic API client wrapper with interceptor-like behavior
 */
export const apiClient = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('adoptme_token');
        const authHeader = buildAuthHeader(token);
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            // Global error handling (Interceptors)
            if (response.status === 401) {
                console.warn('Session expired (401). Redirecting to login...');
                localStorage.removeItem('adoptme_token');
                
                // Redirect with query param for feedback
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    window.location.href = `/login.html?reason=expired&returnUrl=${encodeURIComponent(currentPath)}`;
                }
                return null;
            }

            if (response.status === 403) {
                console.error('Forbidden (403). Access denied.');
                // Custom event for UI notification
                window.dispatchEvent(new CustomEvent('app:forbidden', { 
                    detail: { message: 'No tenés permisos para realizar esta acción.' } 
                }));
            }

            return response;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
};
