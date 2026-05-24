/**
 * MessageComponent
 * Presentational component that renders a single message bubble
 */

/**
 * Format timestamp as HH:MM
 * @param {string|number} timestamp - ISO timestamp or Unix timestamp
 * @returns {string} Formatted time string (HH:MM)
 */
export function formatTime(timestamp) {
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp) 
    : new Date(timestamp);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

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
 * Render a single message bubble
 * @param {Object} message - Message object
 * @param {string|number} message.id - Message ID (or temp ID)
 * @param {string} message.text - Message text content
 * @param {string|number} message.senderId - Sender's user ID
 * @param {string} message.timestamp - Message timestamp
 * @param {'pending'|'sent'|'failed'} message.status - Message delivery status
 * @param {boolean} message.isOwn - Whether message is from current user
 * @returns {string} HTML string for the message bubble
 */
export function renderMessage(message) {
  const { id, text, senderId, timestamp, status = 'sent', isOwn = false } = message;
  
  // Escape HTML in message text to prevent XSS
  const escapedText = escapeHtml(text);
  const timeString = formatTime(timestamp);
  
  // Base classes for message bubble
  const containerClasses = isOwn
    ? 'flex justify-end mb-2'
    : 'flex justify-start mb-2';
  
  const bubbleClasses = isOwn
    ? 'bg-blue-500 text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg rounded-br-sm'
    : 'bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg rounded-bl-sm';
  
  // Status indicator
  let statusHtml = '';
  if (isOwn) {
    if (status === 'pending') {
      statusHtml = '<span class="text-xs opacity-60 italic ml-2">Enviando...</span>';
    } else if (status === 'sent') {
      statusHtml = '<span class="text-xs opacity-80 ml-2">✓</span>';
    } else if (status === 'failed') {
      statusHtml = `
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-red-300">Fallido</span>
          <button 
            data-action="retry" 
            data-message-id="${id}"
            class="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      `;
    }
  }
  
  // Pending state for own messages: add opacity
  const pendingClasses = (isOwn && status === 'pending') ? ' opacity-60' : '';
  
  return `
    <div class="${containerClasses}" data-message-id="${id}">
      <div class="${bubbleClasses}${pendingClasses}">
        <div class="text-sm break-words">${escapedText}</div>
        <div class="flex items-center justify-end gap-1 mt-1">
          <span class="text-xs opacity-70">${timeString}</span>
          ${statusHtml}
        </div>
      </div>
    </div>
  `;
}

export default {
  renderMessage,
  formatTime
};
