Feature: Reviews Phase

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen
    And I cast all roles and advance past casting
    And I enter a budget of 10000

  Scenario: Reviews heading is shown
    Then the output contains "The reviews are in"

  Scenario: Named reviewers appear in output
    Then the output contains "NY Times"
    And the output contains "Gene Siskel"
    And the output contains "Roger Ebert"

  Scenario: Release prompt appears after all reviews
    Then the output contains "Press any key to release the movie"
