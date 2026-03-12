Feature: Movie Selection

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits

  Scenario: Three numbered movie choices are presented
    Then the output contains "1)"
    And the output contains "2)"
    And the output contains "3)"
    And the output contains "You have been sent three scripts"

  Scenario: Each movie shows its role list
    Then the output contains "*roles==>"

  Scenario: A choice out of range re-prompts without advancing
    When I enter "4"
    Then the prompt asks "Which do you want to produce"
    When I enter "0"
    Then the prompt asks "Which do you want to produce"

  Scenario: A valid choice advances to the casting phase
    When I enter "1"
    Then the output contains "Press any key to continue"
    When I press any key
    Then the output contains "Casting Call for"
