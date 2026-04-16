Feature: Budget Phase

  Background:
    Given I open the game with seed 42
    And I advance past the title screen
    And I advance past the credits
    And I select movie 1
    And I advance past the movie selection screen
    And I cast all roles and advance past casting

  Scenario: Budget prompt shows salary and production cost input
    Then the output contains "How much do you want to spend on production?"
    And the prompt asks "enter amount in thousands"

  Scenario: Budget below minimum shows validation error
    When I enter "0"
    Then the output contains "Please enter a value between"

  Scenario: Budget too high shows validation error
    When I enter "99999"
    Then the output contains "Please enter a value between"

  Scenario: Valid budget entry advances to the reviews phase
    When I enter a budget of 10000
    Then the output contains "The reviews are in"
