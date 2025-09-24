@stores @credits
Feature: Credits and Subscription selectors
  As a developer
  I want to assert credit and subscription selectors return sane values
  So that UI cards and gates can rely on them

  Scenario: Remaining credits and basic subscription metadata
    Given I have the Credits store
    When I read the remaining credits
    Then the remaining credits return numbers for ai, leads and skipTraces
    Given I have the Subscription store
    When I read the plan name and status
    Then the plan name is a string and status is one of active, inactive or unknown
