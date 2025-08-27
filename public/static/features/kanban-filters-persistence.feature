Feature: Persisting, saving, loading, and clearing Kanban filters
  As a user
  I want to save a snapshot of my current filters
  So that I can quickly re-apply them later and clear them when needed

  Background:
    Given the Kanban app is loaded

  Scenario: Save current filters snapshot
    When I set the search query to "demo"
    And I filter by status ["IN_PROGRESS", "DONE"]
    And I filter by priority ["high"]
    And I click "Save filters"
    Then a saved filters indicator is visible

  Scenario: Load saved filters vs clear when none saved
    Given no saved filters exist
    And I have some filters applied
    When I click "Clear filters"
    Then all filters are cleared
    When I click "Load saved"
    Then the previously saved filters are applied

  Scenario: Clear saved filters snapshot
    Given a saved filters snapshot exists
    When I click "Clear saved"
    Then no saved filters indicator is shown
    And clicking "Load saved" does nothing
