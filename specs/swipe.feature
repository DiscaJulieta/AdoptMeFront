Feature: Pet swiping flow
  As an authenticated adopter
  I want to browse pets by swiping left or right
  So that I can quickly discover compatible pets

  Background:
    Given the user is authenticated with a valid JWT in LocalStorage
    And the backend API is reachable

  Scenario: Load initial batch of pets
    Given the swipe screen is opened for the first time
    When the frontend requests pets with page 0 and size 10
    Then the backend responds with a non-empty list of pets
    And the frontend renders the first pet card on top of the stack
    And the frontend preloads the next cards for smooth swiping

  Scenario: Handle swipe right (Like)
    Given a pet card is visible on top of the stack
    When the user swipes right or taps the Like button
    Then the frontend sends a like action for that pet to the backend
    And the current card is removed from the stack with swipe-right feedback
    And the next card becomes active without page reload

  Scenario: Handle swipe left (Dislike)
    Given a pet card is visible on top of the stack
    When the user swipes left or taps the Dislike button
    Then the frontend sends a dislike action for that pet to the backend
    And the current card is removed from the stack with swipe-left feedback
    And the next card becomes active without page reload

  Scenario: Show match notification after like
    Given a pet card is visible on top of the stack
    And the backend marks the like action as a match
    When the frontend receives the match response
    Then the frontend displays a match modal or popup
    And the modal includes the matched pet name and a call to action to open chat
    And closing the modal keeps the swipe flow available

  Scenario: Display empty state when no more pets are available
    Given the user has consumed all pets from the current and next pages
    When the frontend requests more pets and backend returns an empty list
    Then the frontend displays an empty state message saying there are no more pets
    And the Like and Dislike actions are disabled or hidden
    And the frontend offers a refresh or retry action

  Scenario: Handle unauthorized swipe API responses
    Given a pet card is visible on top of the stack
    When the backend responds 401 or 403 to a swipe request
    Then the frontend stops the swipe action and keeps card consistency
    And the frontend shows an authorization error message
    And the frontend redirects the user to login
