Feature: Discord Notifications and Webhooks
  As a DealScale user
  I want to receive Discord notifications for important events
  So that I stay informed about my leaderboard progress and activities

  Background:
    Given I have linked my Discord account
    And notification preferences are configured
    And the Discord webhook system is operational

  # Direct Message Notifications

  Scenario: Receive rank improvement notification
    Given my notification preference is "all updates"
    When my rank improves from #25 to #20
    Then I should receive a Discord DM:
      """
      🎉 Rank Update!
      You've climbed to #20 (+5 positions)
      Score: 55,527 points
      Keep up the momentum!
      """
    And the notification should include an embed with:
      | Field              | Value           |
      | Current Rank       | #20             |
      | Previous Rank      | #25             |
      | Change             | ↗ +5            |
      | Current Score      | 55,527          |
      | View Leaderboard   | [Link]          |

  Scenario: Receive critical rank drop alert
    Given my rank drops from #5 to #12
    Then I should receive a high-priority DM:
      """
      ⚠️ CRITICAL: Major Rank Drop
      You've dropped to #12 (-7 positions)
      7 players passed you in the last hour.
      Take action to reclaim your position!
      """
    And the notification should be marked as high priority

  Scenario: Receive credit balance low warning
    Given I have 3 AI credits remaining
    And my typical daily usage is 10 credits
    When my credits drop below the threshold
    Then I should receive a DM:
      """
      💰 Low Credit Balance
      You have only 3 AI credits remaining.
      Request more: /request type:ai
      Or upgrade: https://app.dealscale.io/billing
      """

  Scenario: Receive milestone achievement notification
    Given I close my 50th deal
    When the milestone is recorded
    Then I should receive a celebratory DM:
      """
      🎊 MILESTONE UNLOCKED!
      You've closed 50 deals!
      You've earned:
      - 5,000 bonus points
      - "Deal Master" badge
      - 25 bonus AI credits
      
      Keep crushing it! 🚀
      """

  Scenario: Receive credit request status update
    Given I submitted credit request #12345
    When an admin approves the request
    Then I should receive a DM:
      """
      ✅ Credit Request Approved
      Your request for 25 AI credits was approved.
      Request ID: #12345
      New balance: 30 AI credits
      Admin note: Approved - keep up the great work!
      """

  # Channel Notifications

  Scenario: Leaderboard milestone announced in channel
    Given I reach the Top 10 for the first time
    When the leaderboard updates
    Then an announcement should be posted in #leaderboard-updates:
      """
      🌟 @User123 has entered the TOP 10!
      Current rank: #9
      Congratulations! 🎉
      """

  Scenario: Daily leaderboard summary posted
    Given it is 9:00 AM UTC
    When the daily summary cron job runs
    Then a message should be posted in #leaderboard-updates:
      """
      📊 Daily Leaderboard Summary - {date}
      
      🏆 Top 3:
      1. ThunderBolt (89,226 pts) ↗ +2
      2. StormRider (82,134 pts) ↘ -1
      3. CodeHunter1 (79,536 pts) —
      
      🔥 Biggest Movers:
      - IceBreaker1: +15 positions
      - NeonStriker: +12 positions
      
      🎯 Player to Watch: IceBreaker1 (+60 ranks this week)
      
      View full leaderboard: https://app.dealscale.io/leaderboard
      """

  Scenario: Weekly leaderboard recap
    Given it is Sunday at 6:00 PM UTC
    When the weekly recap cron job runs
    Then a detailed embed should be posted in #announcements
    And it should include:
      | Section                | Content                              |
      | Champion of the Week   | User who held #1 most days          |
      | Rising Star            | User with most rank improvement      |
      | Consistency Award      | User with most stable high rank      |
      | Community Highlights   | Notable achievements                 |
      | Next Week Preview      | Upcoming challenges                  |

  # Webhook Configuration

  Scenario: Configure custom webhook for team notifications
    Given I am a team admin
    When I navigate to "Integrations" > "Webhooks"
    And I create a new webhook with URL "https://myteam.slack.com/webhook"
    And I select events to trigger:
      | Event                    |
      | Team member rank change  |
      | Team milestone achieved  |
      | Credit request submitted |
    Then the webhook should be saved and active
    And test notification should be sent successfully

  Scenario: Webhook delivers rank change event
    Given a webhook is configured for "rank_change" events
    When my rank changes from #23 to #20
    Then a POST request should be sent to the webhook URL with payload:
      ```json
      {
        "event": "rank_change",
        "timestamp": "2025-11-06T10:30:00Z",
        "user": {
          "id": "12345",
          "name": "User123",
          "discord_id": "987654321"
        },
        "data": {
          "previous_rank": 23,
          "current_rank": 20,
          "rank_change": 3,
          "score": 55527
        }
      }
      ```

  Scenario: Webhook retry on failure
    Given a webhook is configured
    When the webhook endpoint returns 500 error
    Then the system should retry with exponential backoff:
      | Attempt | Delay  |
      | 1       | 1s     |
      | 2       | 2s     |
      | 3       | 4s     |
      | 4       | 8s     |
      | 5       | 16s    |
    And after 5 failed attempts, mark webhook as "failing"
    And notify the webhook owner

  # Notification Preferences

  Scenario: Customize notification preferences
    Given I navigate to Settings > Notifications
    When I configure my preferences:
      | Notification Type          | Preference        |
      | Rank improvements          | Enabled           |
      | Rank drops                 | Major only        |
      | Milestone achievements     | Enabled           |
      | Credit balance warnings    | Enabled           |
      | Daily summaries            | Disabled          |
      | Credit request updates     | Enabled           |
    And I click "Save Preferences"
    Then my preferences should be stored
    And I should only receive notifications matching my preferences

  Scenario: Mute all notifications temporarily
    Given I am going on vacation
    When I enable "Do Not Disturb" mode for 7 days
    Then all Discord DMs should be suppressed
    But critical account notifications should still be sent via email
    And after 7 days, notifications should resume automatically

  Scenario: Notification digest mode
    Given I select "Daily Digest" for rank updates
    When I have 5 rank changes throughout the day
    Then instead of 5 separate DMs
    I should receive one digest DM at end of day:
      """
      📊 Your Daily Leaderboard Summary
      
      Rank Changes Today: 5
      Net Change: +3 positions
      Current Rank: #20 (was #23)
      
      Details:
      - 10:00 AM: #23 → #22 (+1)
      - 11:30 AM: #22 → #24 (-2)
      - 2:15 PM: #24 → #21 (+3)
      - 4:00 PM: #21 → #22 (-1)
      - 5:30 PM: #22 → #20 (+2)
      """

  # Real-time Feeds

  Scenario: Subscribe to real-time leaderboard feed
    Given I am viewing the leaderboard web page
    When I enable "Real-time Updates"
    Then a WebSocket connection should be established
    And I should see live updates as they happen:
      | Time     | Update                                    |
      | 10:30:05 | ThunderBolt moved #2 → #1                |
      | 10:30:12 | StormRider gained 1,500 points           |
      | 10:30:45 | New player entered Top 100               |
    And updates should appear with smooth animations

  Scenario: Push notifications for mobile app
    Given I have the DealScale mobile app installed
    And I've granted push notification permission
    When my rank improves significantly
    Then I should receive a push notification:
      """
      🎉 You're now #15!
      Up 8 positions. Tap to view leaderboard.
      """

  # Admin Notifications

  Scenario: Admin receives new user signup notification
    Given I am an admin
    When a new user signs up and links Discord
    Then I should receive a notification in #admin-feed:
      """
      👤 New User Joined
      Name: John Doe
      Email: john@example.com
      Discord: JohnDoe#1234
      Timestamp: 2025-11-06 10:30 UTC
      """

  Scenario: Admin receives suspicious activity alert
    Given the fraud detection system is active
    When suspicious activity is detected:
      | Activity                     |
      | Same IP used by 10+ accounts |
      | Abnormal score increase      |
      | Credit request spam          |
    Then admins should receive high-priority alert in #security-alerts
    And the alert should include investigation details

  # Error Handling

  Scenario: Handle Discord user DMs disabled
    Given I have disabled DMs from server members
    When the system attempts to send me a notification
    Then it should fail gracefully
    And log the failed delivery
    And display an in-app notification instead
    And prompt me to enable DMs

  Scenario: Handle deleted Discord account
    Given my Discord account is deleted
    When the system attempts to send notifications
    Then it should detect the account is invalid
    And mark my Discord integration as "disconnected"
    And send email notifications as fallback
    And prompt me to relink when I log in

  Scenario: Notification rate limiting
    Given I have 50 rank changes in one hour (unusual activity)
    When the notification system processes these changes
    Then it should group them into a single summary
    And avoid sending 50 individual DMs
    And prevent Discord rate limit violations

