Feature: Kanban view state store (filters, sorting, search, preview fields)
  As a user managing a Kanban board
  I want the app to remember my current view (filters, sorting, search, preview fields)
  So I can consistently see the tasks how I prefer

  Background:
    Given the Kanban app is loaded

  Scenario: Default view
    Then the search query is empty
    And there are no active filters
    And sorting defaults to "dueDate" ascending
    And preview fields include ["priority", "dueDate", "assignedToTeamMember"]

  Scenario: Apply search and filters
    When I set the search query to "demo"
    And I filter by status ["IN_PROGRESS", "DONE"]
    And I filter by priority ["high"]
    Then the derived visible tasks include only those matching the search and filters

  Scenario: Change sorting
    When I set sorting to field "priority" and direction "desc"
    Then the derived visible tasks are sorted by priority (high > medium > low)

  Scenario: Update preview fields
    When I set preview fields to ["priority", "scheduledDate", "leadListId"]
    Then those fields are available for card previews

  Scenario: Reset view
    When I reset the view state
    Then the defaults are restored
