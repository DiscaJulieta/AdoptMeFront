/**
 * Chat Service
 * Service layer for chat-related API calls using the API client
 */

import { request } from './api.js';

/**
 * Fetch messages for a specific chat with pagination
 * @param {string|number} chatId - The chat/conversation ID
 * @param {number} page - Page number (0-indexed), default 0
 * @param {number} size - Number of messages per page, default 10
 * @returns {Promise<{content: Array, page: number, size: number, totalPages: number, last: boolean}>}
 */
export async function getMessages(chatId, page = 0, size = 10) {
  const endpoint = `/chats/${chatId}/messages?page=${page}&size=${size}`;
  return await request(endpoint, { method: 'GET' });
}

/**
 * Send a message to a chat
 * @param {string|number} chatId - The chat/conversation ID
 * @param {string} text - The message text
 * @returns {Promise<{id: string|number, text: string, senderId: string|number, timestamp: string}>}
 */
export async function sendMessage(chatId, text) {
  const endpoint = `/chats/${chatId}/messages`;
  return await request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

/**
 * Retry sending a failed message (same as sendMessage, reusable)
 * @param {string|number} chatId - The chat/conversation ID
 * @param {string} text - The message text
 * @returns {Promise<{id: string|number, text: string, senderId: string|number, timestamp: string}>}
 */
export async function retryMessage(chatId, text) {
  return await sendMessage(chatId, text);
}

// Export all chat service methods
export default {
  getMessages,
  sendMessage,
  retryMessage
};
