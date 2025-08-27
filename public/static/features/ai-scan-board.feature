Feature: AI scans TODO column and enables AI tasks
  As a user
  I want AI to scan the TODO column for tasks it can complete
  So that eligible tasks can be enabled for AI with required fields and sensible defaults

  Background:
    Given the Kanban app is loaded
    And there are one or more tasks in the TODO column

  # Heuristic-only behavior verification (UI/UX contract)
  Scenario: Scan Board identifies AI-completable tasks in TODO column
    When I open the Quick actions menu
    And I open the "AI" submenu
    And I click "Scan Board"
    Then tasks in the TODO column are analyzed
    And tasks that match AI-completable criteria are highlighted
    And each highlighted task shows an "Enable AI" action

  # Enabling AI on a single task should surface the fields AI needs and sensible defaults
  Scenario: Enable AI for a selected task and show required fields with defaults
    Given a task in the TODO column is marked as AI-completable
    When I click "Enable AI" for that task
    Then the task is converted to an AI task draft
    And I see an AI details panel for the task
    And the panel lists required fields with current values or defaults:
      | field                    | default/behavior                                      |
      | agentType               | text                                                  |
      | selectedAgentId         | empty (required)                                      |
      | assignType              | lead if leadId present else leadList if leadListId    |
      | leadId                  | current task value if present, else empty             |
      | leadListId              | current task value if present, else empty             |
      | title                   | current task value (required)                         |
      | dueDate                 | current task value (required)                         |
      | assignedToTeamMember    | current task value (required)                         |
      | description             | current task value or generated summary               |
      | aiPreviewText           | generated from agentType, agentId, title, due         |
      | aiNeeds                 | derived list of missing fields (e.g., agentId)        |
      | aiMcp                   | generated MCP snippet with lead/leadList if available |

  # Persisting conversion state
  Scenario: Converted AI task retains mapping back to original fields
    Given I enabled AI for a task
    Then the AI task retains original non-AI fields (title, dueDate, assignee)
    And the task stores AI metadata (agentType, selectedAgentId, aiPreviewText, aiMcp)
    And the task remains in the TODO column until executed or moved

  # Guardrails for incomplete AI data
  Scenario: Prevent enabling AI execution until required fields are provided
    Given an AI task draft is missing required fields
    When I attempt to execute or save the AI task
    Then I am blocked with validation indicating missing fields in aiNeeds
    And the missing fields are highlighted in the AI details panel

  # Optional: bulk enable
  Scenario: Bulk enable AI for all completable tasks (optional)
    When I click "Enable AI for all" in the AI submenu
    Then all highlighted AI-completable tasks become AI task drafts
    And each shows required fields and defaults as above
