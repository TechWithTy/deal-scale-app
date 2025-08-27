Feature: Kanban AI Suggest modal
  As a user
  I want quick AI/manual task suggestions
  So I can create prefilled tasks faster

  Background:
    Given the Kanban board is loaded

  Scenario: Open Suggest modal from AI menu
    When I open the Quick actions menu
    And I open the "AI" submenu
    And I click "Suggest"
    Then the Suggest modal is visible
    And I see horizontally scrollable suggestion cards

  Scenario: Pick an AI suggestion card
    Given the Suggest modal is visible
    When I click the "Follow up via SMS" suggestion card
    Then the task create dialog opens on the AI tab
    And the form title is prefilled with "Text follow-up"

  Scenario: Pick a Manual suggestion card
    Given the Suggest modal is visible
    When I click the "Schedule a call" suggestion card
    Then the task create dialog opens on the Manual tab
    And the form title is prefilled with "Call check-in"
