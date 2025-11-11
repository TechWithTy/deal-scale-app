Feature: Real-time Leaderboard Synchronization
  As a competitive DealScale user
  I want to see real-time leaderboard updates
  So that I can track my progress and compete with others

  Background:
    Given the leaderboard system is operational
    And leaderboard updates run every 30 seconds
    And I have a linked Discord account

  Scenario: Leaderboard updates in real-time on web app
    Given I am viewing the leaderboard on the web app
    And I am currently ranked #10
    When another user's score changes
    And the leaderboard recalculates
    Then I should see the updated rankings within 30 seconds
    And rank changes should be animated
    And "Player to Watch" should update if applicable

  Scenario: My rank improves and I receive notification
    Given I am currently ranked #25 with 50,000 points
    When I complete actions that increase my score to 55,000 points
    And the leaderboard recalculates
    Then my rank should improve to #23
    And I should receive a Discord DM:
      """
      🎉 Rank Update!
      You've moved up to #23 (+2 positions)
      Score: 55,000 points
      Keep up the great work!
      """
    And my rank change indicator should show "↗ +2"

  Scenario: My rank drops and I receive notification
    Given I am currently ranked #15 with 60,000 points
    When other users surpass my score
    And the leaderboard recalculates
    Then my rank should drop to #18
    And I should receive a Discord DM:
      """
      📉 Rank Update
      You've dropped to #18 (-3 positions)
      Score: 60,000 points
      3 players passed you. Time to step up your game!
      """

  Scenario: Achieve #1 rank for the first time
    Given I am currently ranked #2
    And user "ThunderBolt" is ranked #1
    When my score surpasses ThunderBolt's score
    And the leaderboard recalculates
    Then I should be ranked #1
    And I should receive a Discord DM:
      """
      👑 CHAMPION!
      Congratulations! You're now #1 on the leaderboard!
      You've dethroned ThunderBolt and claimed the Champion title.
      Others are closing in—hold the lead! 🏆
      """
    And I should receive the "Champion" role in Discord
    And ThunderBolt should have the "Champion" role removed

  Scenario: Fall from #1 position
    Given I am currently ranked #1 with the Champion role
    When another player surpasses my score
    And the leaderboard recalculates
    Then I should drop to #2
    And I should receive a Discord DM:
      """
      ⚠️ You've been dethroned!
      You're now #2. {player_name} has taken the #1 spot.
      You were just 2,500 points behind—you can reclaim the crown!
      """
    And the "Champion" role should be removed from me
    And I should receive the "Silver" role

  Scenario: Milestone achievement notification
    Given I am currently ranked #105
    When my rank improves to #99
    And the leaderboard recalculates
    Then I should receive a special notification:
      """
      🎯 Milestone Achieved!
      You've entered the TOP 100!
      Current Rank: #99
      You're now in the elite tier. Keep climbing!
      """

  Scenario: Leaderboard caching for performance
    Given the leaderboard has 50,000 active players
    When I request the leaderboard data
    Then the response time should be under 200ms
    And the data should be served from cache
    And the cache should be no more than 30 seconds old

  Scenario: "Player to Watch" spotlight
    Given the leaderboard tracks rank velocity
    When a player "RisingStarUser" gains +60 ranks in 24 hours
    And the leaderboard recalculates
    Then "RisingStarUser" should be highlighted as "Player to Watch"
    And this should be displayed on the leaderboard:
      """
      🔥 Player to Watch: RisingStarUser
      +60 ranks in the last 24 hours
      """

  Scenario: Leaderboard filters by company
    Given I work for "Keller Williams"
    When I filter the leaderboard by company "Keller Williams"
    Then I should only see players from "Keller Williams"
    And my rank should be shown relative to that company
    And the total should show "X of Y Keller Williams players"

  Scenario: Leaderboard filters by location
    Given I am based in "Seattle, WA"
    When I filter the leaderboard by location "Seattle, WA"
    Then I should only see players from Seattle
    And regional rankings should be displayed

  Scenario: View historical leaderboard data
    Given I want to see how rankings changed over time
    When I select "7 days ago" on the leaderboard
    Then I should see the leaderboard as it was 7 days ago
    And I should see my historical rank at that time
    And a timeline slider should allow me to scrub through history

  Scenario: Leaderboard displays tier badges correctly
    Given the tier system is:
      | Tier     | Rank Range | Badge    |
      | Champion | 1          | 🏆       |
      | Silver   | 2          | Silver   |
      | Bronze   | 3          | Bronze   |
      | Top 10   | 4-10       | Top 10   |
      | Elite    | 11-100     | Elite    |
    When I view the leaderboard
    Then each player should display their correct tier badge
    And the badge should match their current rank

  Scenario: Leaderboard shows online/offline status
    Given I am currently online in DealScale
    And user "ThunderBolt" is offline
    When viewing the leaderboard
    Then I should see a green indicator (🟢) next to my name
    And I should see a gray indicator (⚪) next to ThunderBolt's name

  Scenario: Bulk rank recalculation after system maintenance
    Given the system has been in maintenance mode
    And no leaderboard updates occurred for 2 hours
    When the system comes back online
    Then all ranks should be recalculated within 5 minutes
    And users should receive consolidated notifications for major changes
    And no duplicate notifications should be sent

  Scenario: Leaderboard handles ties correctly
    Given two players have exactly 75,000 points
    When the leaderboard calculates ranks
    Then ties should be broken by:
      | Priority | Criteria                    |
      | 1        | Who reached the score first |
      | 2        | Total deals closed          |
      | 3        | Account creation date       |

  Scenario: Customizable leaderboard settings
    Given I am on the leaderboard page
    When I click "Customize Settings"
    Then I should be able to configure:
      | Setting                    | Options                        |
      | Number of players to show  | 10, 25, 50, 100                |
      | Notification preferences   | All, Major only, None          |
      | Comparison baseline        | My rank, Top 10, My company    |
      | Refresh interval           | 30s, 1m, 5m, Manual            |

  Scenario: API rate limiting for leaderboard requests
    Given I am fetching leaderboard data programmatically
    When I make more than 60 requests per minute
    Then subsequent requests should be rate limited
    And I should receive a 429 status code
    And the response should include "Retry-After" header

  Scenario: Leaderboard data integrity check
    Given the leaderboard calculation runs every 30 seconds
    When anomalous data is detected (e.g., score drops by 50,000 suddenly)
    Then the system should flag it for admin review
    And the previous valid state should be preserved
    And admins should receive an alert

  Scenario: Export leaderboard data
    Given I am viewing the leaderboard
    When I click "Export" and select "CSV"
    Then I should download a CSV file containing:
      | Column         |
      | rank           |
      | name           |
      | score          |
      | rank_change    |
      | location       |
      | company        |
      | deals_closed   |
      | response_rate  |

  Scenario: Leaderboard accessibility
    Given I am using a screen reader
    When I navigate the leaderboard
    Then each player entry should be announced with:
      - Rank number
      - Player name
      - Score
      - Rank change direction and amount
    And all interactive elements should be keyboard navigable
    And ARIA labels should be present for icons

  Scenario: Mobile leaderboard responsiveness
    Given I am viewing the leaderboard on a mobile device
    Then the leaderboard should be displayed in a card layout
    And I should be able to scroll vertically
    And touch gestures should work for filters
    And text should be readable without zooming

  Scenario: Leaderboard performance with large dataset
    Given there are 100,000 active players
    When I view the top 100 leaderboard
    Then the page should load in under 1 second
    And scrolling should be smooth at 60fps
    And images should lazy-load as I scroll

