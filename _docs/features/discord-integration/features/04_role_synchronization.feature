Feature: Discord Role Synchronization
  As a DealScale user with a linked Discord account
  I want my Discord roles to automatically update based on my leaderboard rank
  So that my achievements are recognized in the Discord community

  Background:
    Given the Discord role sync service is operational
    And I have linked my Discord account to DealScale
    And I am a member of the DealScale Discord server

  Scenario: Automatic role assignment when reaching Top 100
    Given I am currently ranked #105
    And I have no special leaderboard roles
    When my rank improves to #95
    And the role sync service runs
    Then I should be assigned the "Elite" role in Discord
    And I should receive a Discord DM:
      """
      🎉 New Role Unlocked!
      You've been granted the "Elite" role for reaching Top 100!
      Your rank: #95
      """
    And the role should be visible next to my name in the server

  Scenario: Role upgrade from Elite to Top 10
    Given I currently have the "Elite" role
    And I am ranked #12
    When my rank improves to #9
    And the role sync service runs
    Then the "Elite" role should be removed
    And I should be assigned the "Top 10" role
    And I should receive a congratulatory notification

  Scenario: Achieve Champion role at rank #1
    Given I am currently ranked #2 with the "Silver" role
    When my rank improves to #1
    And the role sync service runs
    Then the "Silver" role should be removed
    And I should be assigned the "Champion 🏆" role
    And the role should have a special color (gold)
    And I should receive a DM:
      """
      👑 CHAMPION ROLE GRANTED!
      You're #1 on the leaderboard!
      You now have the prestigious Champion role.
      Defend your position and keep the crown! 🏆
      """

  Scenario: Lose Champion role when rank drops
    Given I currently have the "Champion 🏆" role at rank #1
    When another player surpasses my score
    And my rank drops to #2
    And the role sync service runs
    Then the "Champion 🏆" role should be removed
    And I should be assigned the "Silver" role
    And the previous Champion role should be assigned to the new #1 player

  Scenario: Role demotion when falling out of Top 100
    Given I have the "Elite" role at rank #98
    When my rank drops to #102
    And the role sync service runs
    Then the "Elite" role should be removed
    And I should receive a notification:
      """
      ⚠️ Role Removed
      You've dropped out of the Top 100 (now #102)
      The "Elite" role has been removed.
      Keep playing to earn it back!
      """

  Scenario: Bronze role for rank #3
    Given I am ranked #4 with "Top 10" role
    When my rank improves to #3
    And the role sync service runs
    Then the "Top 10" role should be removed
    And I should be assigned the "Bronze" role
    And the role should have a bronze color

  Scenario: Silver role for rank #2
    Given I am ranked #3 with "Bronze" role
    When my rank improves to #2
    And the role sync service runs
    Then the "Bronze" role should be removed
    And I should be assigned the "Silver" role
    And the role should have a silver color

  Scenario: Role hierarchy in Discord
    Given multiple roles exist:
      | Role      | Priority |
      | Champion  | 1        |
      | Silver    | 2        |
      | Bronze    | 3        |
      | Top 10    | 4        |
      | Elite     | 5        |
    When Discord displays my roles
    Then they should be ordered by priority
    And the highest role should determine my name color

  Scenario: Role sync during bulk leaderboard update
    Given 500 players have rank changes
    When the leaderboard recalculates
    And the role sync service runs
    Then all 500 role updates should complete within 2 minutes
    And updates should be batched to respect Discord rate limits
    And no duplicate role assignments should occur

  Scenario: Handle Discord API rate limiting during role sync
    Given the role sync service needs to update 100 roles
    When Discord API rate limits are reached
    Then the service should queue remaining updates
    And implement exponential backoff
    And retry failed updates
    And complete all updates within 5 minutes

  Scenario: Role sync fails due to missing Discord permissions
    Given the bot lacks "Manage Roles" permission
    When attempting to assign a role to me
    Then the sync should fail gracefully
    And an admin alert should be generated
    And the error should be logged with details
    And my DealScale leaderboard rank should still update correctly

  Scenario: User leaves Discord server but remains in DealScale
    Given I have the "Elite" role in Discord
    When I leave the DealScale Discord server
    Then my DealScale account should remain active
    And my leaderboard rank should be preserved
    And role sync should be suspended for my account
    When I rejoin the Discord server later
    Then my appropriate role should be automatically reassigned

  Scenario: Bot rejoins server after downtime
    Given the Discord bot was offline for 1 hour
    And 50 rank changes occurred during downtime
    When the bot comes back online
    Then it should detect all missed role changes
    And sync all roles to current state within 5 minutes
    And send consolidated notifications to affected users

  Scenario: Custom role for special achievements
    Given I close 100 deals in a month
    When the achievement is recorded
    Then I should receive a special "Century Club" role
    And this role should stack with my leaderboard role
    And both roles should be visible

  Scenario: Role retention during tie breaks
    Given I am tied for rank #3 with another player
    And I currently have the "Bronze" role
    When the tie is broken and I become #4
    Then my "Bronze" role should be removed
    And I should receive the "Top 10" role
    And the other player should keep/receive "Bronze"

  Scenario: Role assignment for new Discord members
    Given I am ranked #25 with "Elite" role in DealScale
    But I just joined the Discord server today
    When the role sync service detects my Discord membership
    Then I should immediately receive the "Elite" role
    And I should receive a welcome DM with my current rank

  Scenario: Prevent role assignment conflicts
    Given I have been manually assigned a "Moderator" role by admins
    When the role sync service runs
    Then it should only manage leaderboard roles
    And my "Moderator" role should not be removed
    And both roles should coexist

  Scenario: Role color hierarchy
    Given I have multiple roles: ["Champion", "Beta Tester", "Member"]
    When Discord displays my name color
    Then it should use the color from the highest priority role
    And the priority should be:
      | Role          | Priority | Color   |
      | Champion      | Highest  | Gold    |
      | Silver        | High     | Silver  |
      | Bronze        | High     | Bronze  |
      | Top 10        | Medium   | Blue    |
      | Elite         | Medium   | Purple  |
      | Beta Tester   | Low      | Green   |
      | Member        | Lowest   | Gray    |

  Scenario: Audit log for role changes
    Given I am an admin
    When I view the role sync audit log
    Then I should see a history of all role changes:
      | Timestamp  | User         | Action              | Old Role | New Role | Rank |
      | 2025-11-06 | ThunderBolt  | Role Upgraded       | Silver   | Champion | #1   |
      | 2025-11-06 | StormRider   | Role Assigned       | None     | Elite    | #95  |
      | 2025-11-06 | CodeHunter1  | Role Downgraded     | Top 10   | Elite    | #15  |

  Scenario: Role permissions alignment
    Given different roles have different permissions
    When I receive the "Champion" role
    Then I should have access to:
      | Permission                  |
      | #champions-lounge channel   |
      | Priority support            |
      | Early feature access        |
    And these permissions should activate immediately

  Scenario: Role sync status dashboard for admins
    Given I am an admin user
    When I view the Discord integration dashboard
    Then I should see role sync statistics:
      | Metric                        | Value   |
      | Last sync completed           | 2m ago  |
      | Roles synced in last 24h      | 1,234   |
      | Failed sync attempts          | 2       |
      | Users with roles              | 456     |
      | Pending role updates          | 0       |

  Scenario: Dry run mode for role sync testing
    Given I am testing role sync configuration
    When I enable "dry run" mode
    And trigger a role sync
    Then the system should simulate all role changes
    And log what would happen
    But NOT actually modify any roles
    And provide a summary report

