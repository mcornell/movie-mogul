Feature: Help Screen

  Background:
    Given I open the game with seed 42
    And I advance past the title screen

  Scenario: H key from main menu shows help
    When I press "h"
    Then the output contains "MOVIE MOGUL"

  Scenario: Help shows Scripts section
    When I press "h"
    Then the output contains "SCRIPTS"

  Scenario: Help shows multiple pages navigable by any key
    When I press "h"
    And I press any key
    Then the output contains "CASTING"
