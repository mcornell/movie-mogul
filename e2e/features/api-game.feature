Feature: API-driven game (global deployment)

  # In the global deployment VITE_SCORES_API=1, so:
  #   - all game logic runs server-side via Cloudflare Workers
  #   - ?cheat is disabled
  #   - high scores are fetched from / saved to D1 via the API

  Background:
    Given the API endpoints are mocked
    And I open the game
    And I advance past the title screen

  Scenario: Pressing Play calls the game start API
    When I press "p"
    Then the game called the start API
    And the output contains "You have been sent three scripts"

  Scenario: Movie choices are displayed from the API response
    When I press "p"
    Then the output contains "SWORD AND SORCERY"

  Scenario: Choosing a movie calls the movie API and shows the actor pool
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the output contains "John Wayne"

  Scenario: Casting actors calls the cast API and shows the budget prompt
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the output contains "Casting Call"
    When I enter "1"
    And I enter "2"
    And I enter "9"
    Then the output contains "Total cost of salaries"

  Scenario: Setting the budget calls the budget API and shows the release results
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the output contains "Casting Call"
    When I enter "1"
    And I enter "2"
    And I enter "9"
    Then the output contains "Total cost of salaries"
    When I press any key
    And I enter "15000"
    Then the output contains "came in on budget"
    When I press any key
    Then the output contains "The reviews are in"

  Scenario: Finishing the game calls the finish API and shows the leaderboard
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the output contains "Casting Call"
    When I enter "1"
    And I enter "2"
    And I enter "9"
    Then the output contains "Total cost of salaries"
    When I press any key
    And I enter "15000"
    Then the output contains "came in on budget"
    When I drive through prompts until "P)lay Again"
    Then the output contains "No Movie"

  Scenario: Cheat mode is disabled even with ?cheat in the URL
    Given I open the game with cheat param
    And I advance past the title screen
    When I press "p"
    Then the output does not contain "CHEAT MODE ACTIVE"
