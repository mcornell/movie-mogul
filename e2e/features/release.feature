Feature: Release Phase

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen
    And I cast all roles and advance past casting
    And I enter a budget of 10000
    And I drive through the reviews

  Scenario: Sneak preview header is shown
    Then the output contains "MAJOR STUDIO SNEAK PREVIEW"

  Scenario: Weekly box office gross figures are displayed
    When I press any key
    Then the output contains "WEEK 1"
    And the output contains "Weekly gross"

  Scenario: Pulled from theaters message appears after the run ends
    When I drive through the weekly box office run
    Then the output contains "pulled from theaters"
