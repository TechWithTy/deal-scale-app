@stores @ai
Feature: AI reports summarization
  As a developer
  I want AI report selectors to expose consistent summaries
  So that dashboards can render reliable metrics

  Scenario: Direct Mail, Social, and Kanban summaries exist
    Given I have the AI reports store
    When I read the Direct Mail summary
    Then the DM summary contains sent, delivered and failed
    When I read the Social summary
    Then the Social summary contains totalCampaigns and totalActions
    When I read the Kanban summary
    Then the Kanban summary contains totalTasks
