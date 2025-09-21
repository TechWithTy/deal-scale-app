Feature: Prize Wheel cadence lockout
  Background:
    Given a user "user-123" with cadence "daily"
    And a prize wheel with prizes:
      | id       | label       | weight |
      | credits5 | 5 Credits   | 5      |
      | credits1 | 1 Credit    | 1      |

  Scenario: First spin is allowed and records result
    Given the user has not spun today
    When the user clicks Spin
    Then a prize should be selected
    And the win should be recorded with a timestamp
    And the wheel should be locked until the next day

  Scenario: Subsequent spin is blocked until next window
    Given the user has already spun today
    When the user clicks Spin
    Then the user should see they are not eligible to spin
    And a countdown is displayed until the next day

  Scenario: Weekly cadence respects next week window
    Given the cadence is "weekly"
    And the user spun this week
    When the user tries to spin again
    Then the spin is blocked
    And the next eligible date is at the start of next week

  Scenario: Monthly cadence respects next month window
    Given the cadence is "monthly"
    And the user spun this month
    When the user tries to spin again
    Then the spin is blocked
    And the next eligible date is the first day of next month

  Scenario: Weighted distribution affects selection probabilities
    Given weights are configured for prizes
    When 1000 simulated spins are computed
    Then the prize frequencies should roughly reflect weight ratios

  Scenario: Admin override resets lockout
    Given allowAdminOverride is enabled
    And the user has already spun today
    When an admin clicks Reset
    Then the user can spin again immediately

  Scenario: Empty prize list disables spinning
    Given the prize wheel has no prizes configured
    When the user views the wheel
    Then the Spin button should be disabled
    And a helpful message is shown indicating no prizes are available

  Scenario: Auto spin triggers when eligible
    Given autoSpin is enabled
    And the user has not spun in the current cadence window
    When the component mounts
    Then a spin should be triggered automatically within 200ms

  Scenario: localStorage failures do not break UI
    Given writing to localStorage fails due to quota or privacy settings
    When a spin finishes
    Then the app should not crash
    And the win should still be emitted to the onWin handler

  Scenario: Accessibility announcements for lockout state
    Given the wheel is locked by cadence
    When the component renders
    Then an aria-live polite region should announce the countdown
    And the Spin button should have disabled state and proper aria semantics
