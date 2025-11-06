# Feature: Invite Friends Card Component
# As a DealScale user
# I want to invite friends using a custom referral link
# So that I can share the platform and earn referral rewards

Feature: Invite Friends Card

  Background:
    Given the user is authenticated
    And the user has a unique referral URL generated
    And the InviteFriendsCard component is mounted

  # ---------------------------- #
  # 1. Display Referral Link
  # ---------------------------- #
  Scenario: Display user's unique referral link
    Given the user views the Invite Friends card
    When the component loads
    Then the user should see their unique referral URL displayed
    And the URL should be in a copyable text field
    And a visual indicator shows the domain and referral code

  # ---------------------------- #
  # 2. Copy Link to Clipboard
  # ---------------------------- #
  Scenario: Copy referral link to clipboard
    Given the user views their referral link
    When the user clicks the "Copy Link" button
    Then the referral URL is copied to the clipboard
    And a success toast appears: "Link copied to clipboard!"
    And the button shows a checkmark icon for 2 seconds
    And the button text changes to "Copied!" temporarily

  # ---------------------------- #
  # 3. Share via Email
  # ---------------------------- #
  Scenario: Share referral link via email
    Given the user clicks the "Email" share icon
    When the email share handler is triggered
    Then the system should open the default email client
    And pre-populate the email with:
      | Field   | Content                                                    |
      | Subject | "Join me on DealScale!"                                    |
      | Body    | Custom message with referral URL and user's name           |
    And track the share action with analytics

  # ---------------------------- #
  # 4. Share via SMS
  # ---------------------------- #
  Scenario: Share referral link via SMS
    Given the user clicks the "SMS" share icon
    When the SMS share handler is triggered
    Then the system should open the default SMS app
    And pre-populate the message with the referral URL and invite text
    And track the share action with analytics

  # ---------------------------- #
  # 5. Share via Social Media
  # ---------------------------- #
  Scenario Outline: Share referral link via social platforms
    Given the user clicks the "<Platform>" share icon
    When the social share handler is triggered
    Then the system should open "<Platform>" share dialog
    And pre-populate with custom message and referral URL
    And track the share action with platform: "<Platform>"

    Examples:
      | Platform  |
      | Facebook  |
      | Twitter   |
      | LinkedIn  |
      | WhatsApp  |

  # ---------------------------- #
  # 6. Referral Statistics
  # ---------------------------- #
  Scenario: Display referral statistics
    Given the user has sent invites
    When the component loads referral stats
    Then the card should display:
      | Metric              | Description                              |
      | Total Invites Sent  | Number of times link was shared          |
      | Pending             | Friends who clicked but haven't signed up|
      | Successful Referrals| Friends who completed sign-up            |
      | Rewards Earned      | Points/credits earned from referrals     |

  # ---------------------------- #
  # 7. Custom Invite Message
  # ---------------------------- #
  Scenario: Customize invite message
    Given the user wants to personalize their invite
    When the user clicks "Customize Message"
    Then a text area appears for custom message input
    And the user can edit the pre-filled template
    And the custom message is included in all share methods
    And the changes persist for future shares

  # ---------------------------- #
  # 8. Error Handling
  # ---------------------------- #
  Scenario: Handle clipboard copy failure
    Given the user clicks "Copy Link"
    When the clipboard API fails
    Then show fallback: select and copy text manually
    And display an error toast: "Please copy the link manually"

  Scenario: Handle referral URL generation failure
    Given the component loads
    When the referral URL cannot be generated
    Then show a fallback message: "Referral link temporarily unavailable"
    And provide a retry button
    And log the error for debugging

  # ---------------------------- #
  # 9. Responsive Design
  # ---------------------------- #
  Scenario: Display on mobile devices
    Given the user views the card on mobile
    When the viewport width is less than 640px
    Then the share icons should stack vertically
    And the referral URL should be truncated with ellipsis
    And all buttons remain fully accessible

  # ---------------------------- #
  # 10. Share Tracking
  # ---------------------------- #
  Scenario: Track share events
    Given the user shares via any method
    When a share action is completed
    Then log the event with:
      | Property    | Description                |
      | userId      | Current user ID            |
      | shareMethod | Email, SMS, Social, Copy   |
      | timestamp   | ISO 8601 timestamp         |
      | referralUrl | The shared URL             |
    And update the user's invite count
    And trigger any reward logic if applicable

  # ---------------------------- #
  # 11. Component Customization
  # ---------------------------- #
  Scenario: Render with custom props
    Given the component receives custom props
    When the component is instantiated with:
      | Prop              | Value                                    |
      | referralUrl       | "https://dealscale.app/ref/ABC123"       |
      | userName          | "John Doe"                               |
      | rewardType        | "credits"                                |
      | rewardAmount      | 50                                       |
      | customMessage     | "Check out this amazing platform!"       |
      | showStats         | true                                     |
      | compactMode       | false                                    |
    Then the card renders with all custom values
    And the share messages include the custom text
    And the reward information is displayed correctly

  # ---------------------------- #
  # 12. Accessibility
  # ---------------------------- #
  Scenario: Ensure component is accessible
    Given the component is rendered
    When a screen reader is active
    Then all buttons have aria-labels
    And keyboard navigation is fully supported
    And focus states are clearly visible
    And color contrast meets WCAG AA standards

