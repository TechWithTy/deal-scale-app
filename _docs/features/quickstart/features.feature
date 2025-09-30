Feature: Quick Start Campaign Creation
  As a user
  I want to create a lead list and launch a campaign
  So I can start text, call, or social outreach in under 5 minutes

  Background:
    Given I am logged in
    And I see Quick Start cards on the dashboard

  Scenario: Upload CSV → Create List → Campaign
    When I click the "Upload Leads" card
    And I upload a CSV file
    Then a "Map Fields" modal appears
    When I map CSV columns to lead fields
    Then a new list is created
    And I am prompted with a "Skip Trace" modal
    When I choose to run skip trace or skip it
    Then the list is saved and available
    When I select the new list for a campaign
    Then the "Campaign Setup" modal opens
    When I set campaign goal, script, and channel preferences
    And I confirm on the review modal
    Then the campaign launches

  Scenario: Search Properties → Create List → Campaign
    When I click the "Find Properties" card
    And I apply filters (location, price, type)
    Then I select properties
    And a new list is created
    Then a "Skip Trace" modal appears
    When I choose to run skip trace or skip it
    Then the list is saved and available
    When I select the new list for a campaign
    Then the "Campaign Setup" modal opens
    When I set campaign goal, script, and channel preferences
    And I confirm on the review modal
    Then the campaign launches

  Scenario: Resume list or campaign
    Given I left after creating a list or during setup
    When I return
    Then my list is still available
    And I can select it to continue to campaign setup
