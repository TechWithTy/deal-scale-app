Feature: Permissions and Credits Integration
  As a developer
  I want to implement and track permissions and credits functionality
  So that I can ensure all required features are properly integrated

  Scenario: User logs in and sees their credits
    Given I am on the login page
    When I log in as an admin user
    Then I should see my AI credits on the dashboard
    And I should see my Leads credits on the dashboard
    And I should see my Skip Traces credits on the dashboard

  Scenario: Permissions affect UI access
    Given I am logged in as a regular user
    When I view the admin panel
    Then I should not see the "Delete User" button

  Scenario: Credits are updated after usage
    Given I have 10 AI credits remaining
    When I use an AI feature that costs 3 credits
    Then my remaining AI credits should be 7
