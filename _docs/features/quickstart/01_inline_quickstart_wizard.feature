Feature: Inline QuickStart wizard experience
  As a campaign manager
  I want the QuickStart workflow to run inline on the page
  So that I can progress through the campaign wizard without modal dialogs

  Background:
    Given I am authenticated in the DealScale app
    And I navigate to "/dashboard/quickstart"

  Scenario: QuickStart page renders the wizard container
    When the QuickStart dashboard loads
    Then I see the QuickStart action cards in a grid
    And I see the QuickStart wizard container rendered below the cards
    And no campaign creation modal is open
    And the wizard shows "Lead Intake" as the active step

  Scenario: Launching the wizard from a QuickStart card
    Given the wizard is initially collapsed
    When I click the "Upload Leads" QuickStart card
    Then the wizard expands into full-width mode
    And the step indicator highlights "Lead Intake"
    And the URL remains "/dashboard/quickstart"
    And focus is placed on the lead intake form within the wizard

  Scenario: Persisting state when navigating steps inline
    Given I have uploaded a CSV in the lead intake step
    And I continue to the skip-trace step
    When I navigate back to the lead intake step using the wizard navigation
    Then the uploaded CSV summary is still visible
    And the wizard does not close or refresh the page
