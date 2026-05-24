import { authService } from './auth/authService.js';
import { SwipeContainer } from './components/SwipeContainer.js';
import { mockPets } from './mockData.js';
import { createChatModule } from './modules/ChatModule.js';

// State
let swipeContainer = null;
let chatModule = null;
let currentView = 'swipe'; // 'swipe' | 'chat'

// DOM elements
const swipeView = document.getElementById('swipe-view');
const chatView = document.getElementById('chat-view');
const authPrompt = document.getElementById('auth-prompt');
const mainNav = document.getElementById('main-nav');
const navSwipe = document.getElementById('nav-swipe');
const navChat = document.getElementById('nav-chat');
const chatUnreadBadge = document.getElementById('chat-unread-badge');

/**
 * Switch between views
 */
function switchView(view) {
  currentView = view;
  
  // Hide all views
  swipeView.classList.add('hidden');
  chatView.classList.add('hidden');
  
  // Reset nav styles
  navSwipe.classList.remove('text-orange-500');
  navChat.classList.remove('text-orange-500');
  
  if (view === 'swipe') {
    swipeView.classList.remove('hidden');
    navSwipe.classList.add('text-orange-500');
  } else if (view === 'chat') {
    chatView.classList.remove('hidden');
    navChat.classList.add('text-orange-500');
    
    // Mount chat if not already mounted
    if (!chatModule) {
      const chatContainer = document.getElementById('chat-container');
      const chatId = window.location.hash.slice(1) || '1';
      chatModule = createChatModule();
      chatModule.mount(chatId, chatContainer);
    }
  }
}

/**
 * Update unread badge
 */
function updateUnreadBadge(count) {
  if (count > 0) {
    chatUnreadBadge.textContent = count > 9 ? '9+' : count;
    chatUnreadBadge.classList.remove('hidden');
  } else {
    chatUnreadBadge.classList.add('hidden');
  }
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎯 AdoptMe Frontend Inicializando...');

  // Check authentication
  if (!authService.isAuthenticated()) {
    authPrompt.classList.remove('hidden');
    mainNav.classList.add('hidden');
    return;
  }

  // User is authenticated - show app
  authPrompt.classList.add('hidden');
  mainNav.classList.remove('hidden');
  
  // Initialize swipe container
  swipeContainer = new SwipeContainer('swipe-container', []);

  // Listen for auth errors (unified event handling)
  window.addEventListener('unauthorized', () => {
    console.warn('🔐 Sesión expirada. Redirigiendo a login...');
    window.location.href = 'login.html';
  });

  window.addEventListener('app:forbidden', (e) => {
    console.error('🚫', e.detail?.message || 'Acceso denegado');
  });

  // Load pets
  const loaded = await swipeContainer.loadMorePets();
  if (loaded) {
    swipeContainer.render();
    console.log(`✅ Swipe montado con ${swipeContainer.getRemainingCount()} mascotas.`);
  } else {
    console.warn('⚠️ API no disponible. Usando mock data...');
    swipeContainer.petsList = mockPets;
    swipeContainer.render();
  }

  // Setup navigation
  navSwipe.addEventListener('click', () => switchView('swipe'));
  navChat.addEventListener('click', () => switchView('chat'));
  
  // Setup action buttons
  const likeBtn = document.getElementById('like-btn');
  const dislikeBtn = document.getElementById('dislike-btn');
  likeBtn?.addEventListener('click', handleLike);
  dislikeBtn?.addEventListener('click', handleDislike);

  // Start on swipe view
  switchView('swipe');
  
  console.log('✅ AdoptMe listo!');
});

/**
 * Handle like action
 */
async function handleLike() {
  const current = swipeContainer?.getCurrentPet();
  if (current) {
    console.log(`❤️ Like a: ${current.name}`);
    await swipeContainer.handleSwipeRight();
  }
}

/**
 * Handle dislike action
 */
async function handleDislike() {
  const current = swipeContainer?.getCurrentPet();
  if (current) {
    console.log(`✖️ Dislike a: ${current.name}`);
    await swipeContainer.handleSwipeLeft();
  }
}
