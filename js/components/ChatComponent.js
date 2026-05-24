/**
 * ChatComponent
 * Container component that manages the entire chat view
 * Handles message list, input area, optimistic UI, pagination, and real-time polling
 */

import { chatStore, chatActions } from '../state/chatStore.js';
import { renderMessage } from './MessageComponent.js';
import { sendMessage, getMessages, retryMessage } from '../services/chatService.js';
import { createPollingService } from '../services/PollingService.js';
import * as chatService from '../services/chatService.js';
import { authService } from '../auth/authService.js';

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Raw text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create the chat component
 * @param {string|number} chatId - The chat/conversation ID
 * @returns {Object} Component API: { mount(container), unmount(), render() }
 */
export function createChatComponent(chatId) {
  // Component state
  let containerElement = null;
  let pollingService = null;
  let unsubscribe = null;
  let isSending = false;
  let isLoading = false;
  let errorState = null;
  
  // Scroll position for pagination
  let previousScrollHeight = 0;
  let previousScrollTop = 0;
  
  /**
   * Get the current user ID from token (simplified - in real app, decode JWT)
   * @returns {string|number|null} Current user ID
   */
  function getCurrentUserId() {
    const token = authService.getToken();
    if (!token) return null;
    
    // Simple JWT decode to get user ID
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.sub || payload.userId || payload.id;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Render the chat header
   * @param {number} unreadCount - Number of unread messages
   * @returns {string} HTML string
   */
  function renderHeader(unreadCount = 0) {
    const unreadBadge = unreadCount > 0
      ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">${unreadCount}</span>`
      : '';
    
    return `
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center">
          Chat
          ${unreadBadge}
        </h2>
      </div>
    `;
  }
  
  /**
   * Render the message list
   * @param {Array} messages - Array of message objects
   * @returns {string} HTML string
   */
  function renderMessageList(messages) {
    if (!messages || messages.length === 0) {
      return `
        <div class="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <p class="text-gray-500 text-sm">No hay mensajes aún. ¡Sé el primero en escribir!</p>
        </div>
      `;
    }
    
    const messagesHtml = messages.map(msg => {
      const currentUserId = getCurrentUserId();
      const isOwn = msg.senderId === currentUserId || msg.isOwn === true;
      const messageWithIsOwn = { ...msg, isOwn };
      return renderMessage(messageWithIsOwn);
    }).join('');
    
    return `
      <div 
        id="chat-message-list" 
        class="flex-1 overflow-y-auto p-4 bg-gray-50"
        style="min-height: 300px; max-height: 500px;"
      >
        ${messagesHtml}
      </div>
    `;
  }
  
  /**
   * Render the input area
   * @param {boolean} disabled - Whether input should be disabled
   * @returns {string} HTML string
   */
  function renderInputArea(disabled = false) {
    const disabledAttr = disabled ? 'disabled' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `
      <div class="p-4 border-t border-gray-200 bg-white">
        <div class="flex gap-2 ${disabledClasses}">
          <input
            type="text"
            id="chat-input"
            placeholder="Escribe un mensaje..."
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ${disabledAttr}
          />
          <button
            id="chat-send-btn"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            ${disabledAttr}
          >
            Enviar
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render loading spinner
   * @returns {string} HTML string
   */
  function renderLoading() {
    return `
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Cargando mensajes...</span>
      </div>
    `;
  }
  
  /**
   * Render error state with retry button
   * @param {string} errorMessage - Error message to display
   * @returns {string} HTML string
   */
  function renderError(errorMessage) {
    return `
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <div class="text-red-500 text-4xl mb-2">⚠️</div>
        <p class="text-gray-700 mb-4">${escapeHtml(errorMessage)}</p>
        <button
          id="chat-error-retry"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    `;
  }
  
  /**
   * Render the full chat component
   */
  function render() {
    if (!containerElement) return;
    
    const state = chatStore.getState();
    const { messages, loading, error, unreadCount } = state;
    
    // Build the full HTML
    let contentHtml = '';
    
    if (loading && messages.length === 0) {
      contentHtml = renderLoading();
    } else if (error && messages.length === 0) {
      contentHtml = renderError(error);
    } else {
      contentHtml = `
        ${renderHeader(unreadCount)}
        ${renderMessageList(messages)}
        ${renderInputArea(isSending)}
      `;
      
      // Show error toast if there's an error but we have messages
      if (error) {
        contentHtml += `
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2 mx-4 rounded">
            <p class="text-sm">${escapeHtml(error)}</p>
            <button id="chat-error-retry" class="text-xs underline mt-1 hover:text-red-900">Reintentar</button>
          </div>
        `;
      }
    }
    
    containerElement.innerHTML = `
      <div class="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
        ${contentHtml}
      </div>
    `;
    
    // Attach event listeners
    attachEventListeners();
    
    // Scroll to bottom on initial load or when sending own message
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  }
  
  /**
   * Scroll to bottom of message list
   */
  function scrollToBottom() {
    const messageList = containerElement?.querySelector('#chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }
  
  /**
   * Attach event listeners using event delegation
   */
  function attachEventListeners() {
    if (!containerElement) return;
    
    // Send button click
    const sendBtn = containerElement.querySelector('#chat-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMessage);
    }
    
    // Enter key in input
    const chatInput = containerElement.querySelector('#chat-input');
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }
    
    // Event delegation for retry buttons and scroll
    const messageList = containerElement.querySelector('#chat-message-list');
    if (messageList) {
      // Retry button clicks
      messageList.addEventListener('click', (e) => {
        const retryBtn = e.target.closest('[data-action="retry"]');
        if (retryBtn) {
          const messageId = retryBtn.getAttribute('data-message-id');
          handleRetryMessage(messageId);
        }
      });
      
      // Scroll to top for pagination
      messageList.addEventListener('scroll', handleScroll);
    }
    
    // Error retry button
    const errorRetryBtn = containerElement.querySelector('#chat-error-retry');
    if (errorRetryBtn) {
      errorRetryBtn.addEventListener('click', handleLoadMessages);
    }
  }
  
  /**
   * Handle send message action
   */
  async function handleSendMessage() {
    if (isSending) return;
    
    const chatInput = containerElement?.querySelector('#chat-input');
    if (!chatInput) return;
    
    const text = chatInput.value.trim();
    if (!text) return;
    
    isSending = true;
    render(); // Re-render to disable input
    
    // Generate temp ID for optimistic message
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add optimistic message to store
    chatActions.addOptimisticMessage({
      id: tempId,
      text,
      senderId: getCurrentUserId(),
      timestamp: Date.now(),
      status: 'pending',
      isOwn: true
    });
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom to show new message
    scrollToBottom();
    
    try {
      // Send message to API
      const response = await sendMessage(chatId, text);
      
      // Confirm optimistic message with real server response
      chatActions.confirmOptimisticMessage(tempId, {
        ...response,
        isOwn: true
      });
      
      // Reset error state on success
      chatActions.setError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark optimistic message as failed
      chatActions.failOptimisticMessage(tempId);
      
      // Set error state
      chatActions.setError(error.message || 'Error al enviar mensaje');
    } finally {
      isSending = false;
      render(); // Re-render to re-enable input
    }
  }
  
  /**
   * Handle retry message action
   * @param {string} messageId - Message ID to retry
   */
  async function handleRetryMessage(messageId) {
    const state = chatStore.getState();
    const message = state.messages.find(m => m.id === messageId);
    
    if (!message || message.status !== 'failed') return;
    
    // Update status to pending
    const updatedMessages = state.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status: 'pending' };
      }
      return msg;
    });
    chatActions.setMessages(updatedMessages);
    render();
    
    try {
      // Retry sending
      const response = await retryMessage(chatId, message.text);
      
      // Update with real server response
      const finalMessages = updatedMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...response, isOwn: msg.isOwn };
        }
        return msg;
      });
      
      chatActions.setMessages(finalMessages);
      chatActions.setError(null);
    } catch (error) {
      console.error('Retry failed:', error);
      
      // Mark as failed again
      const failedMessages = updatedMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, status: 'failed' };
        }
        return msg;
      });
      
      chatActions.setMessages(failedMessages);
      chatActions.setError(error.message || 'Error al reintentar');
    } finally {
      render();
    }
  }
  
  /**
   * Handle scroll event for pagination
   * @param {Event} e - Scroll event
   */
  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Check if near top (within 50px)
    if (scrollTop < 50 && !isLoading && chatStore.getState().hasMore) {
      loadOlderMessages();
    }
  }
  
  /**
   * Load older messages for pagination
   */
  async function loadOlderMessages() {
    const state = chatStore.getState();
    const nextPage = state.currentPage + 1;
    
    isLoading = true;
    
    // Store scroll position before prepend
    const messageList = containerElement?.querySelector('#chat-message-list');
    if (messageList) {
      previousScrollHeight = messageList.scrollHeight;
      previousScrollTop = messageList.scrollTop;
    }
    
    try {
      const response = await getMessages(chatId, nextPage, 10);
      
      if (response.content && response.content.length > 0) {
        // Prepend older messages
        chatActions.prependMessages(response.content);
        chatActions.setCurrentPage(nextPage);
        chatActions.setHasMore(!response.last);
        
        // Restore scroll position after DOM update
        setTimeout(() => {
          const newList = containerElement?.querySelector('#chat-message-list');
          if (newList) {
            const newScrollHeight = newList.scrollHeight;
            newList.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
          }
        }, 0);
      } else {
        chatActions.setHasMore(false);
      }
      
      chatActions.setError(null);
    } catch (error) {
      console.error('Failed to load older messages:', error);
      chatActions.setError(error.message || 'Error al cargar mensajes antiguos');
    } finally {
      isLoading = false;
    }
  }
  
  /**
   * Load initial messages
   */
  async function handleLoadMessages() {
    isLoading = true;
    chatActions.setLoading(true);
    render();
    
    try {
      const response = await getMessages(chatId, 0, 10);
      
      if (response.content) {
        chatActions.setMessages(response.content);
        chatActions.setCurrentPage(response.page || 0);
        chatActions.setHasMore(!response.last);
      }
      
      chatActions.setError(null);
      
      // Scroll to bottom after loading
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      console.error('Failed to load messages:', error);
      chatActions.setError(error.message || 'Error al cargar mensajes');
    } finally {
      isLoading = false;
      chatActions.setLoading(false);
      render();
    }
  }
  
  /**
   * Handle store state changes
   */
  function handleStateChange() {
    render();
  }
  
  /**
   * Mount the component to a container
   * @param {HTMLElement} container - DOM container element
   */
  function mount(container) {
    if (!container) {
      console.error('ChatComponent: No container provided');
      return;
    }
    
    containerElement = container;
    
    // Subscribe to store changes
    unsubscribe = chatStore.subscribe(handleStateChange);
    
    // Start polling for real-time updates (PollingService handles everything internally)
    pollingService = createPollingService(chatStore, chatService);
    pollingService.start(chatId);
    
    // Reset unread count when viewing chat
    chatActions.resetUnread();
    
    // Load initial messages
    handleLoadMessages();
  }
  
  /**
   * Unmount the component and cleanup
   */
  function unmount() {
    // Stop polling and clean up visibility listener
    if (pollingService) {
      pollingService.destroy();
      pollingService = null;
    }
    
    // Unsubscribe from store
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    
    // Clear container
    if (containerElement) {
      containerElement.innerHTML = '';
      containerElement = null;
    }
    
    // Reset store state
    chatActions.reset();
  }
  
  // Return component API
  return {
    mount,
    unmount,
    render
  };
}

export default createChatComponent;
