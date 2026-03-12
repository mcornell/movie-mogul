Feature: Full Game

  Background:
    Given I open the game with seed 42

  Scenario: Complete game runs from title screen to high scores
    When I play through a complete game
    Then the output contains "P)lay Again"
    And the output contains "Q)uit"
    When I press "q"
    Then the output contains "Thanks for playing Movie Mogul!"

  Scenario: High scores page shows both category pages
    When I play through a complete game
    Then the output contains "HIGH SCORES"
    And the output contains "HIGHEST PROFIT"
    And the output contains "GREATEST REVENUES"
    When I press "v"
    Then the output contains "BEST PERCENTAGE RETURNED"
    And the output contains "BIGGEST BOMBS"

  Scenario: Play again returns to movie selection
    When I play through a complete game
    And I press "p"
    Then the output contains "You have been sent three scripts"

  Scenario: Summary screen shows profit or loss result
    When I play through to the summary screen
    Then the output contains "Total cost"
    And the output contains "Total revenue"
    And the output shows a profit or loss result
