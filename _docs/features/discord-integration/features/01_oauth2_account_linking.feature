Feature: Discord OAuth2 Account Linking
  As a DealScale user
  I want to link my Discord account to my DealScale profile
  So that I can participate in the leaderboard and receive notifications

  Background:
    Given I am a registered DealScale user
    And I am logged into my DealScale account
    And I have a valid Discord account

  Scenario: Successfully link Discord account
    Given I navigate to my profile settings page
    When I click the "Connect Discord" button
    Then I should be redirected to Discord's OAuth authorization page
    And I should see the requested permissions:
      | Permission        |
      | identify          |
      | email             |
      | guilds            |
    When I click "Authorize"
    Then I should be redirected back to DealScale
    And I should see a success message "Connected to Discord as {username}"
    And my profile should display my Discord username
    And my Discord avatar should be visible

  Scenario: Discord account already linked to another user
    Given another user has already linked Discord account "ExistingUser#1234"
    When I attempt to link the same Discord account "ExistingUser#1234"
    Then I should see an error message "This Discord account is already linked to another user"
    And the linking process should be cancelled
    And my profile should remain unlinked

  Scenario: User denies Discord authorization
    Given I navigate to my profile settings page
    When I click the "Connect Discord" button
    And I am redirected to Discord's OAuth authorization page
    When I click "Cancel" or deny authorization
    Then I should be redirected back to DealScale
    And I should see a message "Authorization denied"
    And my Discord account should not be linked
    And I should still be able to use DealScale

  Scenario: OAuth state parameter mismatch (CSRF protection)
    Given I initiate the Discord OAuth flow
    And a malicious actor attempts to intercept the callback
    When the OAuth callback returns with an invalid state parameter
    Then the linking should fail with a security error
    And I should see "Invalid OAuth state. Please try again."
    And no Discord account should be linked

  Scenario: Successfully disconnect Discord account
    Given I have already linked my Discord account
    And I navigate to my profile settings page
    When I click the "Disconnect" button next to my Discord username
    Then I should see a confirmation message "Discord account disconnected"
    And my Discord username should no longer be displayed
    And my Discord avatar should be removed
    And I should see the "Connect Discord" button again

  Scenario: View Discord connection status
    Given I have linked my Discord account "TestUser#5678"
    When I navigate to my profile settings page
    Then I should see my Discord connection status:
      | Field              | Value              |
      | Discord Username   | TestUser#5678      |
      | Linked Date        | {current_date}     |
      | Status             | Connected          |

  Scenario: Re-link Discord account after disconnection
    Given I previously linked and then disconnected my Discord account
    When I click "Connect Discord" again
    Then I should be able to complete the OAuth flow successfully
    And my Discord account should be linked again
    And my previous leaderboard history should be preserved

  Scenario: Handle expired OAuth token
    Given I have linked my Discord account
    And my Discord OAuth token has expired
    When the system attempts to sync my Discord roles
    Then the system should automatically refresh the token
    And role synchronization should complete successfully
    Or if refresh fails, I should be prompted to re-authorize

  Scenario: Link Discord account from mobile browser
    Given I am using a mobile browser
    And I navigate to my profile settings
    When I click "Connect Discord"
    Then the Discord OAuth page should be mobile-responsive
    And I should be able to complete authorization on mobile
    And be redirected back to DealScale mobile view

  Scenario: Prevent duplicate linking
    Given I have already linked my Discord account "MyAccount#1111"
    When I attempt to link a Discord account again
    Then the "Connect Discord" button should be replaced with my connected username
    And I should only see a "Disconnect" option
    And I should not be able to link multiple Discord accounts

  Scenario Outline: Handle OAuth errors gracefully
    Given I initiate the Discord OAuth flow
    When Discord returns an error: <error_type>
    Then I should see a user-friendly message: <message>
    And I should be redirected to my profile page

    Examples:
      | error_type        | message                                          |
      | access_denied     | You denied Discord authorization                 |
      | invalid_scope     | Invalid permissions requested. Please try again  |
      | server_error      | Discord is temporarily unavailable               |
      | rate_limited      | Too many requests. Please try again later        |

  Scenario: Verify Discord profile data synchronization
    Given I have linked my Discord account
    And my Discord profile has:
      | Field         | Value                    |
      | Username      | TestPlayer               |
      | Discriminator | 1234                     |
      | Avatar Hash   | abc123def456             |
      | Email         | test@example.com         |
    When the system syncs my Discord profile
    Then my DealScale profile should display:
      | Field            | Value                    |
      | Discord Username | TestPlayer#1234          |
      | Discord Avatar   | https://cdn.discordapp.com/avatars/{id}/abc123def456.png |

  Scenario: Admin views Discord connection statistics
    Given I am an admin user
    When I navigate to the admin analytics dashboard
    Then I should see Discord integration metrics:
      | Metric                          | Value |
      | Total users with Discord linked | 1,234 |
      | Linking success rate            | 98%   |
      | Average time to link            | 45s   |
      | Failed linking attempts         | 23    |

