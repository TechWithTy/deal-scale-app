Feature: AI Task Modal for Kanban Tasks
  As a user managing tasks on the Kanban board
  I want to click the AI button on a task to open a modal
  So that I can provide any required parameters to run the AI workflow

  Background:
    Given I am on the "/test_external" page
    And the Kanban board is visible
    And there is at least one task card that includes an AI workflow

  @ui @kanban @ai @smoke
  Scenario: Open the AI task modal from a task card
    When I click the AI button on a task card
    Then I should see an AI modal open
    And the modal should show the workflow title
    And the modal should show at least one workflow prompt description

  @ui @kanban @ai
  Scenario: Modal shows required parameter fields
    Given the AI workflow requires parameters
    When I open the AI modal for that task
    Then I should see input fields for all required parameters
    And the "Run" button should be disabled until all required fields are filled

  @ui @kanban @ai
  Scenario Outline: Validate required parameters and run AI workflow
    Given the AI modal is open for a task
    And the following parameters are required:
      | name              | type   |
      | leadId            | text   |
      | emailTone         | select |
      | appointmentDate   | date   |
    When I provide <leadId>, <emailTone> and <appointmentDate>
    And I click the "Run" button
    Then the modal should close
    And I should see a toast notification confirming the workflow started

    Examples:
      | leadId   | emailTone | appointmentDate |
      | lead_2   | warm      | 2025-09-01      |
      | lead_1   | formal    | 2025-09-15      |

  @ui @kanban @ai
  Scenario: Cancel out of the AI modal
    Given the AI modal is open for a task
    When I click the "Cancel" button
    Then the modal should close without changes
    And no workflow should be executed
