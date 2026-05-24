import { APP_CONFIG } from './config.js';
import { SwipeContainer } from './components/SwipeContainer.js';
import { mockPets } from './mockData.js';

let swipeContainer = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 AdoptMe Frontend Inicializando (Fase 2)...');

    // Inicializar contenedor de swipe (vacío al inicio)
    swipeContainer = new SwipeContainer('swipe-container', []);

    // Escuchar eventos de error de autorización
    window.addEventListener('unauthorized', () => {
        console.warn('🔐 Sesión expirada. Redirigiendo a login...');
        // Redirigir a login (será Persona C - Auth)
        window.location.href = '/login';
    });

    // Cargar mascotas de la API
    const loaded = await swipeContainer.loadMorePets();

    if (loaded) {
        swipeContainer.render();
        console.log(`✅ App montada con ${swipeContainer.getRemainingCount()} mascotas.`);
    } else {
        // Fallback a mock data si API no está disponible
        console.warn('⚠️ API no disponible. Usando mock data para desarrollo...');
        swipeContainer.petsList = mockPets;
        swipeContainer.render();
    }

    // Listeners para botones de acción
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');

    likeBtn?.addEventListener('click', handleLike);
    dislikeBtn?.addEventListener('click', handleDislike);
});

/**
 * Manejo de like desde botón
 */
async function handleLike() {
    const current = swipeContainer.getCurrentPet();
    if (current) {
        console.log(`❤️ Like a: ${current.name}`);
        await swipeContainer.handleSwipeRight();
    }
}

/**
 * Manejo de dislike desde botón
 */
async function handleDislike() {
    const current = swipeContainer.getCurrentPet();
    if (current) {
        console.log(`✖️ Dislike a: ${current.name}`);
        await swipeContainer.handleSwipeLeft();
    }
}
