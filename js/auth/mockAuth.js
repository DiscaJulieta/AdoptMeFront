/**
 * Mock Auth Service to unblock UI development
 */
export const mockAuth = {
    /**
     * Simulates a login and stores a fake JWT
     */
    login() {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
        localStorage.setItem('adoptme_token', fakeToken);
        return { success: true, token: fakeToken };
    },

    logout() {
        localStorage.removeItem('adoptme_token');
    },

    isAuthenticated() {
        return !!localStorage.getItem('adoptme_token');
    }
};
