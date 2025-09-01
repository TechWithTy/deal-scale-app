Feature: Campaign control panel visibility and interactions
  As a user
  I want to control active campaigns from tables with Play, Pause, and Stop
  So that I can manage workflows directly from the UI

  Background:
    Given I am on a page that renders a campaign-related data table using useDataTable

  Scenario: Controls are visible only for active campaigns
    Given a campaign row with status "queued"
    When the row is rendered
    Then the Controls cell shows a Play button
    And the Controls cell does not show a Stop button when state is "idle"

  Scenario: Controls hidden for non-active campaigns
    Given a campaign row with status "completed"
    When the row is rendered
    Then the Controls cell is empty

  Scenario: Play transitions to Pause and Stop visible
    Given a campaign row with status "delivering"
    And the Controls state is "idle"
    When the user clicks the Play button
    Then mock workflow "start" is called for the campaign
    And the Controls state becomes "playing"
    And the Controls shows a Pause button
    And the Controls shows a Stop button

  Scenario: Pause transitions from playing
    Given a campaign row with status "pending"
    And the Controls state is "playing"
    When the user clicks the Pause button
    Then mock workflow "pause" is called for the campaign
    And the Controls state becomes "paused"

  Scenario: Stop from any non-idle state
    Given a campaign row with status "pending"
    And the Controls state is "paused"
    When the user clicks the Stop button
    Then mock workflow "stop" is called for the campaign
    And the Controls state becomes "stopped"
