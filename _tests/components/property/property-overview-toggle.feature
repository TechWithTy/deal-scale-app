Feature: Property Overview inside Data Table with View Toggle
  As a user reviewing a property
  I want the Overview section embedded inside the main data table
  So that I have a single, consistent presentation by default, with an option to switch to a tabbed view

  Background:
    Given I am on the Property Details page for a valid property
    And the property data has loaded successfully
    And the page contains a view toggle control with options "Table" and "Tabbed"

  @smoke
  Scenario: Default view is Table with Overview embedded (no floating Overview)
    When I load the Property Details page
    Then the "Table" view is selected by default
    And the Overview content is rendered inside the Data Table container
    And the Overview content is not rendered as a separate floating card above the table
    And there are no duplicated Overview elements in the DOM

  Scenario: Switch from Table view to Tabbed view
    Given the page is in the default "Table" view
    When I toggle the view to "Tabbed"
    Then the tabs list is visible with sections including "Overview", "Property Details", "MLS Details", "Tax Information"
    And the Overview content appears only inside the "Overview" tab panel
    And the floating Overview card is not present
    And there are no duplicated Overview elements in the DOM

  Scenario: Switch back from Tabbed view to Table view
    Given I am viewing the "Overview" tab in the Tabbed view
    When I toggle the view to "Table"
    Then the Overview content is rendered inside the Data Table container
    And the floating Overview card is not present
    And there are no duplicated Overview elements in the DOM

  Scenario: Overview data parity between views
    Given the Overview content is visible in the "Table" view
    And I note key Overview fields (e.g., Agent Name, Equity, List Price)
    When I switch to the "Overview" tab in the Tabbed view
    Then those same fields display identical values
    And currency and number formatting match between views

  Scenario: Deep link preserves preferred view (optional)
    When I visit the Property Details page with the query string "?view=tabbed"
    Then the Tabbed view is selected by default
    And the Overview content is not rendered inside the Table container
    And there are no duplicated Overview elements in the DOM

  Scenario: View preference is persisted (optional)
    Given I toggle to the Tabbed view
    When I refresh the page
    Then the Tabbed view remains selected
    And the Overview content is not rendered inside the Table container

  Scenario: Accessibility and semantics
    Given I am on the Property Details page
    When the Table view is active
    Then the Data Table container has appropriate landmarks and headings
    And focus order moves through the toggle, Overview table, and subsequent sections logically
    And in Tabbed view, the tabs implement correct aria attributes (role="tablist", aria-selected, aria-controls)

  Scenario: No layout regressions
    Given I am on the Property Details page
    When resizing the viewport between mobile, tablet, and desktop widths
    Then the Overview content remains correctly placed within its selected view
    And there is no overlap with the "Amortization Calculator" or other sections
    And spacing/margins align with existing design tokens
