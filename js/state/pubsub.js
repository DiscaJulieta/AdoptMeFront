/**
 * Pub/Sub State System
 * Lightweight publish/subscribe pattern for reactive state management
 */

/**
 * Creates a pub/sub state manager
 * @param {Object} initialState - Initial state object
 * @returns {Object} Public API: { getState, setState, subscribe, unsubscribe }
 */
export function createPubSub(initialState = {}) {
  let state = { ...initialState };
  const subscribers = new Set();

  /**
   * Get current state (read-only copy)
   * @returns {Object} Current state
   */
  function getState() {
    return { ...state };
  }

  /**
   * Update state with partial state and notify subscribers
   * @param {Object} partialState - Partial state to merge
   */
  function setState(partialState) {
    state = { ...state, ...partialState };
    notifySubscribers();
  }

  /**
   * Notify all subscribers of state change
   */
  function notifySubscribers() {
    subscribers.forEach((callback) => {
      try {
        callback(getState());
      } catch (error) {
        console.error('[PubSub] Subscriber callback error:', error);
      }
    });
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call on state change
   * @returns {Function} Unsubscribe function
   */
  function subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('[PubSub] subscribe requires a callback function');
    }

    subscribers.add(callback);

    // Return unsubscribe function
    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  // Return public API
  return {
    getState,
    setState,
    subscribe,
    unsubscribe: (callback) => {
      subscribers.delete(callback);
    },
  };
}

export default createPubSub;
