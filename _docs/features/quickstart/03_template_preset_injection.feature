Feature: Template preset application from QuickStart
  As a growth strategist
  I want QuickStart cards to prefill campaign templates
  So that campaigns launch with consistent defaults

  Background:
    Given campaign templates define skip trace modules, channels, and automation rules
    And the QuickStart wizard can apply a template preset to its state

  Scenario: Applying a template preset before starting the wizard
    Given the "Fast Seller Outreach" template is associated with a QuickStart card
    When I click the "Fast Seller Outreach" card
    Then the wizard initializes with the template preset applied
    And the skip trace step shows the recommended module from the template
    And the timing step shows the template automation cadence

  Scenario: Overriding template defaults within the wizard
    Given I started the wizard from a card with the "Investor Follow-Up" template
    When I update the skip trace module to "Premium Property Lookup"
    Then the wizard retains my override for subsequent steps
    And the pre-launch review displays the updated module instead of the template default

  Scenario: Persisting template context for analytics
    Given I launched a campaign from a template-driven QuickStart card
    Then the campaign metadata records the template identifier
    And analytics dashboards can segment launches by template
