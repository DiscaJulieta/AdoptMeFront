import { APP_CONFIG } from './config.js';
import { SwipeContainer } from './components/SwipeContainer.js';
import { mockPets } from './mockData.js';
import { router } from './core/router.js';

let swipeContainer = null;
let isMounted = false;

/**
 * Mount swipe view to DOM
 */
function mountSwipeView() {
    if (isMounted) {
        return;
    }
    
    // Initialize swipe container
    const container = document.getElementById('swipe-container');
    if (!container) {
        console.error('[App] swipe-container element not found');
        return;
    }

    swipeContainer = new SwipeContainer('swipe-container', []);

    // Listen for authorization errors
    window.addEventListener('unauthorized', () => {
        console.warn('🔐 Sesión expirada. Redirigiendo a login...');
        router.navigate('#/login');
    });

    // Load pets and render
    swipeContainer.loadMorePets().then(loaded => {
        if (loaded) {
            swipeContainer.render();
        } else {
            console.warn('⚠️ API no disponible. Usando mock data para desarrollo...');
            swipeContainer.petsList = mockPets;
            swipeContainer.render();
        }
    });

    // Setup action buttons
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');

    likeBtn?.addEventListener('click', handleLike);
    dislikeBtn?.addEventListener('click', handleDislike);

    isMounted = true;
}

/**
 * Handle like button click
 */
async function handleLike() {
    const current = swipeContainer?.getCurrentPet();
    if (current) {
        await swipeContainer.handleSwipeRight();
    }
}

/**
 * Handle dislike button click
 */
async function handleDislike() {
    const current = swipeContainer?.getCurrentPet();
    if (current) {
        await swipeContainer.handleSwipeLeft();
    }
}

// Subscribe to route changes - mount swipe view only when navigating to #/swipe
router.onRouteChange((route) => {
    if (route.path === '/swipe') {
        mountSwipeView();
    }
});

// Export for external access if needed
export { swipeContainer, mountSwipeView };
