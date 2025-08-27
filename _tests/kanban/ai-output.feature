Feature: Collapsible highlighted AI output on task card
  As a user viewing the Kanban board
  I want AI-generated outputs on completed tasks to be highlighted and collapsible
  So that the card stays compact but I can expand to review AI output when needed

  Background:
    Given there is a task in the DONE column with AI outputs

  Scenario: AI output is collapsed by default
    When I view the task card
    Then I see a highlighted "From AI" section header
    And the AI output details are hidden initially

  Scenario: Expand to view AI output details
    Given the task has AI markdown, images, and files
    When I click the "From AI" section
    Then the AI output markdown is displayed
    And any AI output image is displayed
    And AI output files are listed

  Scenario: Collapse again to hide details
    When I click the "From AI" section again
    Then the AI output details are hidden
