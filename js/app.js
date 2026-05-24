import './config.js';
import { createChatModule } from './modules/ChatModule.js';
import { authService } from './services/authService.js';

console.log('AdoptMe Frontend Initialized');

// Chat module instance reference
let chatModule = null;

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App container #app not found');
        return;
    }

    console.log('App mounting...');

    // Check if user is authenticated
    if (authService.isAuthenticated()) {
        // Get chatId from URL hash or default to '1' for testing
        const chatId = window.location.hash.slice(1) || '1';
        
        // Initialize and mount chat module
        chatModule = createChatModule();
        chatModule.mount(chatId, app);
        
        console.log(`Chat module mounted with chatId: ${chatId}`);
    } else {
        // Show message for unauthenticated users
        app.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <div class="text-gray-500 text-6xl mb-6">🐾</div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Bienvenido a AdoptMe</h1>
                <p class="text-gray-600 mb-6">Inicia sesión para comenzar a chatear</p>
                <a href="/login" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    Iniciar sesión
                </a>
            </div>
        `;
        console.log('User not authenticated - showing login prompt');
    }
});
