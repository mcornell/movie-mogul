Feature: Title Screen

  Scenario: Title screen shows correct elements on load
    Given I open the game
    Then the title screen is visible
    And the title prompt shows "PRESS ANY KEY TO CONTINUE"
    And the game screen is hidden

  Scenario: Pressing a key advances past the title screen
    Given I open the game
    When I press any key
    Then the game screen is visible
    And the title screen is hidden

  Scenario: Credits are shown after the title screen
    Given I open the game
    When I press any key
    Then the output contains "MOVIE MOGUL"
    And the output contains "Copyright 1985 Chiang Brothers Software"
