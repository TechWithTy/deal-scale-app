Feature: Save, load, and clear Kanban filters
  As a user
  I want to save my current filters and re-apply them later
  So that I can quickly restore my view or clear it when needed

  Background:
    Given the Kanban app is loaded

  Scenario: Save current filters
    When I set the search query to "demo"
    And I filter by status ["IN_PROGRESS", "DONE"]
    And I filter by priority ["high"]
    And I click "Save filters"
    Then a saved filters indicator is visible

  Scenario: Clear vs load saved
    Given no saved filters exist
    And I have some filters applied
    When I click "Clear filters"
    Then all filters are cleared
    Given I have saved filters
    When I click "Load saved"
    Then the saved filters are applied

  Scenario: Clear saved snapshot
    Given a saved filters snapshot exists
    When I click "Clear saved"
    Then no saved filters indicator is shown
