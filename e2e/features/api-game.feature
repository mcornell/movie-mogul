Feature: API-driven game (global deployment)

  # Uses the real Cloudflare Worker and D1 — no mocks.
  # ?seed=42 is forwarded to the Worker (ALLOW_SEED is set in the preview
  # environment) so movie choices, actors, and game events are deterministic.

  Background:
    Given I open the game with seed 42
    And I advance past the title screen

  Scenario: Pressing Play shows movie choices from the API
    When I press "p"
    Then the output contains "You have been sent three scripts"

  Scenario: Three numbered movie choices are displayed
    When I press "p"
    Then the output contains "1)"
    And the output contains "2)"
    And the output contains "3)"

  Scenario: Choosing a movie loads the actor pool from the API
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the output contains "PAY"

  Scenario: Casting all roles shows total salary from the API
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the prompt asks "cast as"
    When I cast all roles
    Then the output contains "Total cost of salaries"

  Scenario: Setting the budget triggers the review phase via the API
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the prompt asks "cast as"
    When I cast all roles
    And I press any key
    And I enter "15000"
    Then the output contains "The reviews are in"

  Scenario: Completing the game shows the global leaderboard
    When I press "p"
    Then the output contains "You have been sent three scripts"
    When I enter "1"
    And I press any key
    Then the prompt asks "cast as"
    When I cast all roles
    And I press any key
    And I enter "15000"
    When I drive through prompts until "P)lay Again"
    Then the output contains "HIGHEST PROFIT"

  Scenario: Cheat mode is disabled in the global build
    When I press "p"
    Then the output does not contain "CHEAT MODE ACTIVE"
