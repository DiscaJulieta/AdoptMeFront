/**
 * Chat Store
 * Centralized state management for chat messages and UI state
 * Built on top of the Pub/Sub system
 */

import { createPubSub } from './pubsub.js';

// Initial state shape
const initialState = {
  messages: [],
  loading: false,
  error: null,
  currentPage: 0,
  hasMore: true,
  unreadCount: 0,
  polling: false,
};

// Create the chat store instance using pub/sub
export const chatStore = createPubSub(initialState);

/**
 * Replace all messages
 * @param {Array} messages - New messages array
 */
export function setMessages(messages) {
  chatStore.setState({ messages });
}

/**
 * Add older messages to the beginning (for pagination)
 * Avoids duplicates by filtering out messages whose ID already exists
 * @param {Array} olderMessages - Older messages to prepend
 */
export function prependMessages(olderMessages) {
  const currentState = chatStore.getState();
  const existingIds = new Set(currentState.messages.map((m) => m.id));

  // Filter out duplicates
  const newMessages = olderMessages.filter((msg) => !existingIds.has(msg.id));

  // Prepend to existing messages
  const updatedMessages = [...newMessages, ...currentState.messages];

  chatStore.setState({ messages: updatedMessages });
}

/**
 * Add a single message to the end (for real-time updates)
 * @param {Object} message - Message to append
 */
export function appendMessage(message) {
  const currentState = chatStore.getState();
  chatStore.setState({
    messages: [...currentState.messages, message],
  });
}

/**
 * Add an optimistic message with temp ID and 'pending' status
 * @param {Object} tempMessage - Message with temp ID
 */
export function addOptimisticMessage(tempMessage) {
  const currentState = chatStore.getState();
  const optimisticMessage = {
    ...tempMessage,
    status: 'pending',
    isOwn: true,
  };

  chatStore.setState({
    messages: [...currentState.messages, optimisticMessage],
  });
}

/**
 * Replace a temp optimistic message with the real server response
 * @param {string} tempId - Temporary ID to replace
 * @param {Object} realMessage - Real message from server
 */
export function confirmOptimisticMessage(tempId, realMessage) {
  const currentState = chatStore.getState();
  const updatedMessages = currentState.messages.map((msg) => {
    if (msg.id === tempId) {
      return {
        ...realMessage,
        isOwn: msg.isOwn, // Preserve isOwn from optimistic message
      };
    }
    return msg;
  });

  chatStore.setState({ messages: updatedMessages });
}

/**
 * Mark a temp optimistic message as failed
 * @param {string} tempId - Temporary ID to mark as failed
 */
export function failOptimisticMessage(tempId) {
  const currentState = chatStore.getState();
  const updatedMessages = currentState.messages.map((msg) => {
    if (msg.id === tempId) {
      return {
        ...msg,
        status: 'failed',
      };
    }
    return msg;
  });

  chatStore.setState({ messages: updatedMessages });
}

/**
 * Set loading state
 * @param {boolean} loading - Loading state
 */
export function setLoading(loading) {
  chatStore.setState({ loading });
}

/**
 * Set error state
 * @param {string|null} error - Error message or null
 */
export function setError(error) {
  chatStore.setState({ error });
}

/**
 * Update current page for pagination
 * @param {number} page - Page number
 */
export function setCurrentPage(page) {
  chatStore.setState({ currentPage: page });
}

/**
 * Update hasMore flag for pagination
 * @param {boolean} hasMore - Whether more messages exist
 */
export function setHasMore(hasMore) {
  chatStore.setState({ hasMore });
}

/**
 * Increment unread count by 1
 */
export function incrementUnread() {
  const currentState = chatStore.getState();
  chatStore.setState({
    unreadCount: currentState.unreadCount + 1,
  });
}

/**
 * Reset unread count to 0
 */
export function resetUnread() {
  chatStore.setState({ unreadCount: 0 });
}

/**
 * Reset all state to initial values (for component unmount)
 */
export function reset() {
  chatStore.setState({ ...initialState });
}

/**
 * Check if a message with the given ID exists in the store
 * @param {string|number} id - Message ID to check
 * @returns {boolean} True if message exists
 */
export function hasMessage(id) {
  const currentState = chatStore.getState();
  return currentState.messages.some((m) => m.id === id);
}

// Export all actions as a convenience object
export const chatActions = {
  setMessages,
  prependMessages,
  appendMessage,
  addOptimisticMessage,
  confirmOptimisticMessage,
  failOptimisticMessage,
  setLoading,
  setError,
  setCurrentPage,
  setHasMore,
  incrementUnread,
  resetUnread,
  reset,
  hasMessage,
};

export default chatStore;
