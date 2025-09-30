Feature: Feature-tier guard for dealscale features
  As a user of DealScale,
  I want access to features only if my subscription tier meets or exceeds the feature's required tier,
  So that higher-tier users get more, and lower-tier users are blocked or prompted to upgrade.

  Background:
    Given the available tiers in ascending order:
      | Tier       |
      | Basic      |
      | Starter    |
      | Enterprise |

  @access
  Scenario Outline: User attempts to access a feature with a required tier
    Given the user's subscription is "<userTier>"
    When the user attempts to access a feature requiring "<requiredTier>"
    Then the access should be "<expectedResult>"

    Examples:
      | userTier   | requiredTier | expectedResult |
      | Basic      | Basic        | allowed        |
      | Starter    | Basic        | allowed        |
      | Enterprise | Basic        | allowed        |
      | Basic      | Starter      | blocked        |
      | Basic      | Enterprise   | blocked        |
      | Starter    | Enterprise   | blocked        |
      | Starter    | Starter      | allowed        |
      | Enterprise | Enterprise   | allowed        |
      | Enterprise | Starter      | allowed        |

  @modes
  Scenario Outline: Guard rendering mode behavior
    Given the user's subscription is "<userTier>"
    And a feature requires "<requiredTier>"
    When the guard is configured with mode "<mode>"
    Then the UI should "<expectedBehavior>"

    Examples:
      | userTier   | requiredTier | mode    | expectedBehavior                       |
      | Basic      | Starter      | hide    | not render the feature                  |
      | Basic      | Starter      | disable | render feature but disable interactions |
      | Basic      | Starter      | overlay | show feature with upgrade overlay prompt |
      | Starter    | Enterprise   | overlay | show overlay blocking access            |
      | Enterprise | Basic        | overlay | no overlay, full access                 |
