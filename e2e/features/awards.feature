Feature: Awards Phase

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen
    And I cast all roles and advance past casting
    And I enter a budget of 10000
    And I drive through the reviews
    And I drive through the release

  Scenario: Academy Awards invitation card is shown
    Then the output contains "Academy of Motion Pictures"
    And the output contains "Press any key to attend"

  Scenario: Oscar ceremony begins after accepting invitation
    When I press any key
    Then the output contains "Best Actress"

  Scenario: Re-release outcome is shown after the ceremony
    When I attend the awards ceremony
    Then the output contains "re-released"
