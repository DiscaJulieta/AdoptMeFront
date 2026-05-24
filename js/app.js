import './config.js';
import { authService } from './auth/authService.js';

console.log('AdoptMe Frontend Initialized');

// Chat module instance reference
let chatModule = null;

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app) {
        console.log('App mounting...');
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('No session found, redirecting to login...');
            window.location.href = '/login.html';
            return;
        }

        console.log('Session restored from LocalStorage');

        // Global Logout Listener (if profile btn exists)
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.title = 'Click para cerrar sesión';
            profileBtn.addEventListener('click', () => {
                if (confirm('¿Cerrar sesión?')) {
                    authService.logout();
                }
            });
        }
    }
});

// Global Event Listeners
window.addEventListener('app:forbidden', (e) => {
    alert(e.detail.message); // Simple alert for now, can be a toast later
});
