Feature: Frontend authentication and authorization handling
  As a user of AdoptMe
  I want secure login and protected frontend actions
  So that swipe and chat only work with valid credentials

  Scenario: Login stores JWT in LocalStorage
    Given the user is on the login screen
    When the user submits valid credentials
    Then the frontend receives a JWT from backend
    And the frontend stores the JWT in LocalStorage under the agreed key
    And subsequent protected API calls include Authorization Bearer token
    And the user is redirected to the main swipe screen

  Scenario: Login rejects invalid credentials
    Given the user is on the login screen
    When the user submits invalid credentials
    Then backend returns an authentication error
    And the frontend shows a clear login error message
    And no JWT is stored in LocalStorage

  Scenario: Restore session from LocalStorage on app bootstrap
    Given LocalStorage contains a JWT from a previous login
    When the app initializes
    Then the frontend loads auth state from LocalStorage
    And protected screens can request backend data with the stored token

  Scenario: Handle 401 response globally
    Given the user is authenticated in the frontend
    When any protected API call responds with 401
    Then the frontend removes JWT from LocalStorage
    And the frontend invalidates in-memory auth state
    And the frontend redirects to login with session expired feedback

  Scenario: Handle 403 response globally
    Given the user is authenticated in the frontend
    When any protected API call responds with 403
    Then the frontend keeps the current JWT unless backend indicates invalid token
    And the frontend shows a forbidden access message
    And the frontend blocks the unauthorized action while keeping app stable
