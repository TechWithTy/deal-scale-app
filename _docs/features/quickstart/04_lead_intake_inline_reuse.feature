Feature: Inline lead intake refactor
  As a lead operations specialist
  I want lead intake steps to be reusable outside modals
  So that QuickStart can embed the flow directly in the wizard

  Background:
    Given the lead intake flow is composed of source selection, CSV upload, mapping, and summary steps

  Scenario: Rendering lead intake steps inline
    When the QuickStart wizard loads the lead intake step
    Then I see the lead source selector as part of the page layout
    And the CSV upload drop zone is visible within the wizard panel
    And no separate modal window is displayed

  Scenario: Reusing lead step components in legacy modals
    Given the lead intake components are exported for reuse
    When I open the legacy "Lead Modal" from another page
    Then the same step components render inside the modal shell
    And file validation and mapping behave identically in both contexts

  Scenario: Sharing lead intake state between wizard and modal
    Given I upload a CSV via the QuickStart wizard
    When I switch to a modal-based entry point without finishing
    Then the in-progress lead mapping state does not leak into the modal
    And a new session starts with an empty mapping state
