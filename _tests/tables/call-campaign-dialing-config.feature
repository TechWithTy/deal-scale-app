Feature: Call campaigns table shows and filters dialing configuration and webhook settings
  As a user viewing call campaigns
  I want to see dialing limits, pacing, voicemail handling, and webhook URL
  So that I can audit and filter campaigns by their dialing configuration

  # Implementation references (file paths and key line ranges)
  # - types/_dashboard/campaign.ts: CallCampaign dialing fields added (approx lines 91-103 after edit)
  #   c:/Users/tyriq.DESKTOP-U7P592K/OneDrive/Documents/Github-New/deal-scale-app/types/_dashboard/campaign.ts
  # - external/shadcn-table/src/examples/Phone/call/utils/buildColumns.tsx: columns added for Calls
  #   Dialing/webhook columns (approx lines 646-756), Playback follows at ~759
  #   c:/Users/tyriq.DESKTOP-U7P592K/OneDrive/Documents/Github-New/deal-scale-app/external/shadcn-table/src/examples/Phone/call/utils/buildColumns.tsx

  Background:
    Given I open the Call Campaigns table for campaign type "Calls"

  Scenario: Display Total Dial Attempts
    Then I should see a column labeled "Total Dial Attempts"
    And each row should render a numeric value (default 0 when missing)

  Scenario: Filter by Total Dial Attempts range
    When I open the filter menu
    And I choose field "Total Dial Attempts"
    And I select the operator "is between"
    And I set the min to 2 and max to 5
    Then only rows with Total Dial Attempts between 2 and 5 are visible

  Scenario: Display Max Daily Attempts
    Then I should see a column labeled "Max Daily Attempts"

  Scenario: Display Min Minutes Between Calls
    Then I should see a column labeled "Min Minutes Between Calls"

  Scenario: Display and filter voicemail counting behavior
    Then I should see a column labeled "VM Counts as Answered"
    And the cell should show "Yes" when countVoicemailAsAnswered is true and "No" when false
    When I open the filter menu
    And I choose field "VM Counts as Answered"
    And I select option "Yes"
    Then only rows where VM Counts as Answered equals Yes are visible

  Scenario: Display and search Post-Call Webhook URL
    Then I should see a column labeled "Post-Call Webhook"
    And the column should render the webhook URL truncated in the cell
    When I open the filter menu
    And I choose field "Post-Call Webhook"
    And I type "hooks.mycrm.com" as the filter value
    Then only rows with a webhook URL containing "hooks.mycrm.com" are visible

  Scenario: Columns only appear for Calls
    Given I switch the campaign type to "Text"
    Then I should not see the columns "Total Dial Attempts", "Max Daily Attempts", "Min Minutes Between Calls", "VM Counts as Answered", or "Post-Call Webhook"
