Feature: Weighted Prize Wheel
  The Prize Wheel supports weighted prizes so certain prizes have a higher probability of winning.
  This builds on the base PrizeWheel and uses the prize `weight` field to expand segments.

  Background:
    Given I am an authenticated user with id "user-123"
    And a cadence of "daily"
    And the following prizes exist:
      | id   | label                 | color    | weight |
      | p1   | Better luck next time| #EE4040  | 1      |
      | p2   | $10 Gift Card        | #34A24F  | 3      |
      | p3   | $50 Gift Card        | #3DA5E0  | 5      |
      | p4   | Free Month           | #F9AA1F  | 2      |
    And I mount the Weighted Prize Wheel component

  @render
  Scenario: Segments expand according to prize weights
    When the wheel renders
    Then I should see total segments equal to the sum of weights
    And the label "$50 Gift Card" should appear 5 times on the wheel
    And the label "$10 Gift Card" should appear 3 times on the wheel
    And the label "Free Month" should appear 2 times on the wheel
    And the label "Better luck next time" should appear 1 time on the wheel

  @interaction
  Scenario: Manual spin triggers when eligible and selects a prize
    Given the wheel is not locked by cadence
    When I click the "Spin Now" button
    Then the wheel should start spinning
    And on finish I should receive a win result containing fields:
      | field    |
      | prizeId  |
      | label    |
      | at       |

  @auto-spin
  Scenario: Auto spin when eligible
    Given autoSpin is enabled
    And the wheel is not locked
    When the component mounts
    Then the wheel should auto-trigger a spin within 200ms

  @lock
  Scenario: Wheel is locked until next eligibility and shows countdown
    Given the user spun today and cadence is "daily"
    When I view the wheel
    Then the component should render a countdown message starting with "Available in"
    And the spin controls should be disabled

  @admin
  Scenario: Admin can reset last spin state
    Given admin override is enabled
    And the wheel state indicates a previous spin
    When I click the "Reset" button
    Then the last spin timestamp should be cleared
    And local storage key for the user and cadence should be removed

  @deterministic
  Scenario Outline: Deterministic winning using library winningSegment for testing
    Given I set the library prop winningSegment to "<label>"
    When I spin the wheel
    Then on finish the winning label should be "<label>"

    Examples:
      | label               |
      | $50 Gift Card       |
      | $10 Gift Card       |
      | Free Month          |

  @probabilistic
  Scenario: Heavier weight wins more often across many spins (statistical)
    Given randomness is not stubbed
    And I perform 500 spins programmatically with reset between spins
    Then the count of wins should be roughly proportional to weights within a tolerance of 10%
    And "$50 Gift Card" should have the highest win count

  @weights
  Scenario: Zero or negative weights are treated as at least one segment
    Given the following prizes exist:
      | id | label   | weight |
      | a  | Alpha   | 0      |
      | b  | Bravo   | -3     |
    When the wheel renders
    Then each prize should appear at least once as a segment

  @empty
  Scenario: No prizes disables spinning and shows message
    Given there are no prizes
    When the wheel renders
    Then the Spin button should be disabled
    And a helpful message is shown indicating no prizes are available

  @storage
  Scenario: Persisting spin result tolerates localStorage failure
    Given writing to localStorage fails due to quota or privacy settings
    When a spin finishes
    Then the app should not crash
    And the win should still be emitted to the onWin handler
