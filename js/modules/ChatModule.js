/**
 * ChatModule - Entry point for the Chat feature
 * 
 * Wires together all chat dependencies and provides a clean API
 * for mounting and unmounting the chat component.
 */

import { authService } from '../services/authService.js';
import { chatStore, chatActions } from '../state/chatStore.js';
import { createChatComponent } from '../components/ChatComponent.js';

/**
 * ChatModule instance state
 */
let currentComponent = null;
let currentContainer = null;

/**
 * Create the chat module instance
 * @returns {Object} Module API: { mount(chatId, container), unmount() }
 */
export function createChatModule() {
  /**
   * Mount the chat component to a container
   * @param {string|number} chatId - The chat/conversation ID
   * @param {HTMLElement} container - DOM container element
   * @returns {Object|null} Component instance or null if mount failed
   */
  function mount(chatId, container) {
    // Validate chatId
    if (!chatId) {
      console.error('ChatModule: chatId is required');
      return null;
    }

    // Validate container
    if (!container) {
      console.error('ChatModule: container element is required');
      return null;
    }

    // Check authentication
    if (!authService.isAuthenticated()) {
      console.error('ChatModule: User is not authenticated');
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <div class="text-gray-500 text-4xl mb-4">🔒</div>
          <p class="text-gray-700 mb-4">Debes iniciar sesión para acceder al chat</p>
          <a href="/login" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
            Iniciar sesión
          </a>
        </div>
      `;
      return null;
    }

    // Unmount any existing component first
    if (currentComponent) {
      unmount();
    }

    // Create and mount the chat component
    currentComponent = createChatComponent(chatId);
    currentContainer = container;

    currentComponent.mount(container);

    console.log(`ChatModule: Mounted chat ${chatId}`);
    return currentComponent;
  }

  /**
   * Unmount the chat component and cleanup all resources
   */
  function unmount() {
    if (!currentComponent) {
      console.warn('ChatModule: No component to unmount');
      return;
    }

    // Unmount the component (stops polling, clears container)
    currentComponent.unmount();

    // Reset chat store state
    chatActions.reset();

    // Clear references
    currentComponent = null;
    currentContainer = null;

    console.log('ChatModule: Unmounted and cleaned up');
  }

  // Return the module API
  return {
    mount,
    unmount
  };
}

export default createChatModule;
