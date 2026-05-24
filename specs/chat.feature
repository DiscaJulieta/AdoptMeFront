Feature: Secure chat between matched users
  As an authenticated adopter with a match
  I want to review and send messages in chat
  So that I can coordinate adoption safely

  Background:
    Given the user is authenticated with a valid JWT in LocalStorage
    And the user has at least one active match

  Scenario: View paginated message history on chat open
    Given the user opens a chat conversation
    When the frontend requests message history with page 0 and size 10
    Then the backend returns the most recent page of messages
    And the frontend renders messages ordered by timestamp
    And the frontend stores pagination metadata for older messages

  Scenario: Load older messages using pagination
    Given the first page of chat history is already visible
    And backend indicates older pages are available
    When the user requests older messages
    Then the frontend sends a request for the next page index
    And older messages are prepended without losing scroll context
    And no duplicate messages are rendered

  Scenario: Send message with optimistic UI
    Given the chat input is visible and enabled
    When the user submits a non-empty message
    Then the frontend immediately renders the outgoing message as pending
    And the frontend sends the message to the backend with JWT authorization
    And when backend confirms delivery the pending state changes to sent

  Scenario: Roll back optimistic message on send failure
    Given an outgoing message is rendered as pending
    When backend responds with a send error
    Then the frontend marks the message as failed
    And the user can retry sending that same message
    And the failed state does not break subsequent message sending

  Scenario: Perceive new incoming messages in near real time
    Given the chat conversation is open
    When a new message becomes available from backend updates
    Then the frontend appends the new message without full page reload
    And the unread indicator is updated when chat is not focused
    And message ordering remains consistent by server timestamp

  Scenario: Handle unauthorized chat API responses
    Given the user is on chat history or send flow
    When backend responds 401 or 403
    Then the frontend clears invalid auth context
    And the frontend shows an authorization error message
    And the frontend redirects the user to login
