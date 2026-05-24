/**
 * Polling Service
 * Intelligent polling service for real-time message updates
 * Uses Page Visibility API to pause polling when tab is hidden
 */

import { appendMessage, incrementUnread, hasMessage } from '../state/chatStore.js';

const POLLING_INTERVAL_MS = 5000; // 5 seconds

/**
 * Creates a new PollingService instance
 * @param {Object} chatStore - The chat store instance (from chatStore.js)
 * @param {Object} chatService - The chat service (from chatService.js)
 * @returns {PollingService} Polling service instance
 */
export function createPollingService(chatStore, chatService) {
  return new PollingService(chatStore, chatService);
}

/**
 * PollingService class for managing message polling
 */
class PollingService {
  /**
   * @param {Object} chatStore - The chat store instance
   * @param {Object} chatService - The chat service with getMessages method
   */
  constructor(chatStore, chatService) {
    this.chatStore = chatStore;
    this.chatService = chatService;
    this.intervalId = null;
    this.currentChatId = null;
    this.knownMessageIds = new Set();
    
    // Bind visibility change handler
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Start polling for new messages
   * @param {string|number} chatId - The chat/conversation ID to poll
   */
  start(chatId) {
    // Stop any existing polling
    this.stop();
    
    this.currentChatId = chatId;
    
    // Initialize known message IDs from current state
    const currentState = this.chatStore.getState();
    this.knownMessageIds = new Set(
      currentState.messages.map(msg => msg.id)
    );
    
    // Start polling interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, POLLING_INTERVAL_MS);
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentChatId = null;
  }

  /**
   * Handle page visibility change
   * Pauses polling when tab is hidden, resumes when visible
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Tab is hidden - pause polling
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    } else {
      // Tab is visible - resume polling if we had an active chat
      if (this.currentChatId && !this.intervalId) {
        this.intervalId = setInterval(() => {
          this.poll();
        }, POLLING_INTERVAL_MS);
        
        // Poll immediately on resume
        this.poll();
      }
    }
  }

  /**
   * Get current user ID from JWT token
   * @returns {string|number|null} Current user ID
   */
  getCurrentUserId() {
    const token = localStorage.getItem('adoptme_token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.sub || payload.userId || payload.id;
    } catch {
      return null;
    }
  }

  /**
   * Poll for new messages
   * Fetches latest messages and detects new ones by ID comparison
   */
  async poll() {
    if (!this.currentChatId || document.hidden) {
      return;
    }

    try {
      // Fetch latest messages (page 0, small size for efficiency)
      const response = await this.chatService.getMessages(this.currentChatId, 0, 10);
      const newMessages = response.content || [];

      // Filter to only messages we haven't seen before
      const unseenMessages = newMessages.filter(
        msg => !this.knownMessageIds.has(msg.id)
      );

      // Process each new message
      for (const message of unseenMessages) {
        // Skip if message already exists in store (handles optimistic confirmation race)
        if (hasMessage(message.id)) {
          this.knownMessageIds.add(message.id);
          continue;
        }
        
        // Add to known IDs
        this.knownMessageIds.add(message.id);
        
        // Append to store
        appendMessage(message);
        
        // Increment unread count if not our own message
        const currentUserId = this.getCurrentUserId();
        const isOwnMessage = message.senderId === currentUserId;
        
        if (!isOwnMessage) {
          incrementUnread();
        }
      }
    } catch (error) {
      // Graceful error handling - log but don't crash
      // Network errors are expected occasionally
      console.warn('[PollingService] Poll failed:', error.message);
      // Continue polling - don't stop on errors
    }
  }

  /**
   * Clean up - remove event listeners and stop polling
   */
  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.knownMessageIds.clear();
  }
}

export default createPollingService;
