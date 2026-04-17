@standalone-only
Feature: Cheat Mode

  Background:
    Given I open the game with seed 42 and cheat mode
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen

  Scenario: Cheat mode indicator is shown on casting screen
    Then the output contains "CHEAT MODE ACTIVE"

  Scenario: Role requirement columns R1 R2 R3 are shown in casting list
    Then the output contains "R1"
    And the output contains "R2"
    And the output contains "R3"
