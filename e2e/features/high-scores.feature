Feature: High Scores Phase

  Background:
    Given I open the game with seed 42
    And I play through a complete game

  Scenario: High scores screen shows page 1 categories
    Then the output contains "HIGHEST PROFIT"
    And the output contains "GREATEST REVENUES"

  Scenario: V key toggles to page 2 categories
    When I press "v"
    Then the output contains "BEST PERCENTAGE RETURNED"
    And the output contains "BIGGEST BOMBS"

  Scenario: Q key quits the game
    When I press "q"
    Then the output contains "Thanks for playing Movie Mogul!"

  @standalone-only
  Scenario: R key prompts to confirm score reset
    When I press "r"
    Then the output contains "Reset all high scores?"
    And the output contains "Y)es"

  @standalone-only
  Scenario: Declining reset keeps the high scores
    When I press "r"
    And I press "n"
    Then the output contains "HIGHEST PROFIT"

  Scenario: P key starts a new game
    When I press "p"
    Then the output contains "You have been sent three scripts"
