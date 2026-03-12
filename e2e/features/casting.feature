Feature: Casting Phase

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen

  Scenario: Twelve numbered actors are shown
    Then the output contains "12)"

  Scenario: Actor pay rates are displayed
    Then the output contains "PAY"
    And the output contains "$"

  Scenario: An out-of-range actor number shows an invalid selection error
    When I enter "13"
    Then the output contains "Invalid selection."
    And the prompt asks "cast as"

  Scenario: Casting the same actor twice shows an invalid selection error
    When I cast the first available actor for the current role
    And I try to cast that same actor again
    Then the output contains "Invalid selection."

  Scenario: Casting all three roles shows total salary
    When I cast all roles
    Then the output contains "Total cost of salaries:"
