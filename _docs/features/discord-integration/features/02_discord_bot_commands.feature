Feature: Discord Bot Slash Commands
  As a DealScale user with a linked Discord account
  I want to use slash commands in Discord
  So that I can interact with DealScale without leaving Discord

  Background:
    Given the DealScale Discord bot is online and operational
    And I am a member of the DealScale Discord server
    And I have linked my Discord account to my DealScale profile

  # /request command scenarios

  Scenario: Successfully request AI credits via Discord
    Given I have 10 AI credits remaining
    When I execute the slash command "/request type:ai amount:25 reason:Need for new campaign"
    Then I should receive an ephemeral reply with:
      | Field      | Value                                    |
      | Title      | ✅ Credit Request Submitted              |
      | Status     | ⏳ Pending                               |
      | Request ID | #12345                                   |
      | Footer     | You'll receive a DM when processed      |
    And an admin notification should be posted in the admin channel
    And my request should appear in the DealScale admin dashboard

  Scenario: Successfully request lead credits via Discord
    Given I have 50 lead credits remaining
    When I execute "/request type:lead amount:100 reason:Large property list"
    Then I should receive a success confirmation
    And the request should be saved with status "pending"
    And an admin should be notified

  Scenario: Request credits without providing a reason
    When I execute "/request type:ai amount:10"
    Then the request should be submitted successfully
    And the reason field should be empty
    And the request should still be valid

  Scenario: Attempt to request credits without linked account
    Given I have NOT linked my Discord account to DealScale
    When I execute "/request type:ai amount:25"
    Then I should receive an error message:
      """
      ❌ Account Not Linked
      You must link your Discord account to DealScale before requesting credits.
      Visit https://app.dealscale.io/profile to connect your account.
      """

  Scenario: Attempt to request invalid credit amount
    When I execute "/request type:ai amount:0"
    Then the command should not execute
    And I should see "Amount must be between 1 and 100"

  Scenario: Attempt to request excessive credits
    When I execute "/request type:ai amount:150"
    Then the command should not execute
    And I should see "Amount must be between 1 and 100"

  # /leaderboard command scenarios

  Scenario: View default leaderboard (top 10)
    Given the leaderboard has 500 active players
    When I execute "/leaderboard"
    Then I should see an embed displaying:
      | Field       | Value                          |
      | Title       | 🏆 DealScale Leaderboard      |
      | Description | Top 10 Players                 |
      | Players     | 10 player entries              |
      | Footer      | Showing top 10 of 500 players  |
    And each player entry should show:
      | rank | name | badge | score | rank_change | location | company |

  Scenario: View top 25 players on leaderboard
    When I execute "/leaderboard top:25"
    Then I should see 25 player entries
    And the footer should say "Showing top 25 of 500 active players"

  Scenario: View leaderboard when no data exists
    Given the leaderboard is empty
    When I execute "/leaderboard"
    Then I should see "No leaderboard data available."

  Scenario: Leaderboard displays rank indicators correctly
    Given the top 5 players are:
      | Rank | Name          | Score  | Change |
      | 1    | ThunderBolt   | 89,226 | +4     |
      | 2    | StormRider    | 82,134 | +11    |
      | 3    | CodeHunter1   | 79,536 | -22    |
      | 4    | IceBreaker1   | 78,057 | +25    |
      | 5    | CyberWarrior  | 75,416 | -3     |
    When I execute "/leaderboard top:5"
    Then I should see:
      | Rank | Indicator | Badge                |
      | 1    | 🥇        | Champion 🏆          |
      | 2    | 🥈        | Silver               |
      | 3    | 🥉        | Bronze               |
      | 4    | 4️⃣        | Top 10               |
      | 5    | 5️⃣        | Top 10               |
    And rank changes should be displayed as:
      | Player       | Display     |
      | ThunderBolt  | ↗ +4        |
      | StormRider   | ↗ +11       |
      | CodeHunter1  | ↘ -22       |
      | IceBreaker1  | ↗ +25       |
      | CyberWarrior | ↘ -3        |

  # /profile command scenarios

  Scenario: View my own profile
    Given my user stats are:
      | Field           | Value      |
      | Rank            | 23         |
      | Score           | 55,527     |
      | AI Credits      | 150        |
      | Lead Credits    | 500        |
      | Deals Closed    | 12         |
      | Response Rate   | 34.5%      |
    When I execute "/profile"
    Then I should see my profile embed with all stats
    And my Discord avatar should be displayed
    And my current rank badge should be shown

  Scenario: View another user's profile
    Given user "ThunderBolt" has their profile public
    When I execute "/profile user:@ThunderBolt"
    Then I should see ThunderBolt's public profile stats
    But I should NOT see their private information like:
      | credit balances | email | full address |

  Scenario: View profile of user without Discord link
    Given user "JohnDoe" exists in DealScale but hasn't linked Discord
    When I execute "/profile user:@JohnDoe"
    Then I should see "This user hasn't linked their Discord account yet."

  # /stats command scenarios

  Scenario: View personal performance statistics
    Given I have performance data for the last 30 days:
      | Metric                | Value |
      | Campaigns Launched    | 5     |
      | Leads Generated       | 342   |
      | Deals Closed          | 8     |
      | Response Rate         | 28%   |
      | Rank Improvement      | +15   |
    When I execute "/stats"
    Then I should see a detailed stats embed
    And I should see a 30-day trend graph
    And I should see my percentile ranking

  Scenario: View stats for different time period
    When I execute "/stats period:7days"
    Then I should see stats for the last 7 days
    When I execute "/stats period:90days"
    Then I should see stats for the last 90 days

  # /compare command scenarios

  Scenario: Compare stats with another player
    Given I am rank #23 with 55,527 points
    And user "ThunderBolt" is rank #1 with 89,226 points
    When I execute "/compare user:@ThunderBolt"
    Then I should see a comparison embed showing:
      | Metric         | Me      | ThunderBolt | Difference |
      | Rank           | #23     | #1          | -22        |
      | Score          | 55,527  | 89,226      | -33,699    |
      | Deals Closed   | 8       | 45          | -37        |
      | Response Rate  | 28%     | 42%         | -14%       |

  Scenario: Compare with user at similar rank
    Given I am rank #23
    And user "EliteSniper1" is rank #22
    When I execute "/compare user:@EliteSniper1"
    Then I should see "🔥 Close competition! You're just behind EliteSniper1"
    And the comparison should highlight small differences

  # Error handling scenarios

  Scenario: Bot handles API downtime gracefully
    Given the DealScale API is temporarily unavailable
    When I execute any slash command
    Then I should receive an error message:
      """
      ❌ Service Unavailable
      DealScale is temporarily unavailable. Please try again in a few minutes.
      """

  Scenario: Bot handles rate limiting
    Given I have executed 10 commands in the last minute
    When I execute another command
    Then I should see "⏱️ Slow down! Please wait 30 seconds before trying again."

  Scenario: Command execution in wrong channel
    Given the bot is configured to only work in #dealscale-commands
    When I execute "/leaderboard" in #general
    Then I should see "This command can only be used in #dealscale-commands"

  Scenario Outline: Command permission validation
    Given I have the role: <role>
    When I execute the command: <command>
    Then the command should: <result>

    Examples:
      | role          | command                  | result            |
      | Member        | /leaderboard             | execute           |
      | Member        | /profile                 | execute           |
      | Member        | /request                 | execute           |
      | Admin         | /approve-request         | execute           |
      | Member        | /approve-request         | be denied         |
      | Guest         | /leaderboard             | be denied         |

