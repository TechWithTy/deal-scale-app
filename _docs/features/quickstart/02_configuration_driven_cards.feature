Feature: Configuration-driven QuickStart cards
  As a product manager
  I want to control the QuickStart cards through configuration
  So that I can curate the experience without code deployments

  Background:
    Given a QuickStart card configuration file defines card metadata
    And each card has an "enabled" flag and numeric "order"

  Scenario: Rendering only enabled cards in configured order
    Given the configuration enables "Upload Leads" and "Launch Campaign"
    And it disables "Find Buyers"
    When the QuickStart page loads
    Then I see the "Upload Leads" card before the "Launch Campaign" card
    And I do not see the "Find Buyers" card

  Scenario: Updating card visibility without redeploying code
    Given the "Import & Manage Data" card is disabled in the configuration
    When I toggle the card to enabled in the configuration file
    And I refresh the QuickStart page
    Then the "Import & Manage Data" card appears in the configured order

  Scenario: Passing wizard presets from card configuration
    Given the "Launch Hybrid Campaign" card has a wizard preset with "Hybrid" channel defaults
    When I click the "Launch Hybrid Campaign" card
    Then the QuickStart wizard loads with the preset applied
    And the channel selection step defaults to the "Hybrid" configuration
