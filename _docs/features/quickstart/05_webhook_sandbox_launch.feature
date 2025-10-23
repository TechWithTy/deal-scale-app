Feature: Webhook and sandbox launch within QuickStart wizard
  As an automation engineer
  I want to configure webhooks and run sandbox tests inside the wizard
  So that I can validate integrations before launching live campaigns

  Background:
    Given the QuickStart wizard includes a "Test & Launch" step
    And sandbox mode disables outbound integrations like Twilio and Zoho

  Scenario: Running a sandbox simulation before launch
    When I reach the "Test & Launch" step in the wizard
    And I click "Simulate first 3 contacts"
    Then the wizard executes the campaign logic in sandbox mode
    And I see message previews and webhook logs without sending real messages

  Scenario: Configuring webhooks inline
    Given I am on the "Test & Launch" step
    When I open the webhook configuration panel
    Then I can enter endpoint URLs, secrets, and retry policies
    And the configuration is stored in wizard state

  Scenario: Launching live campaign after sandbox success
    Given the sandbox simulation completed without errors
    And webhook configuration is saved
    When I click "Launch Live Campaign"
    Then the wizard enables outbound integrations
    And the campaign dashboard opens with live metrics and skip-trace stats
