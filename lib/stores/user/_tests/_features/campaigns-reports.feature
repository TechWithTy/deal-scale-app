@stores @campaigns
Feature: Campaigns reports summarization
  As a developer
  I want campaign report selectors to expose consistent summaries
  So that dashboards can render reliable metrics

  Scenario: Channel totals and transfer breakdown are accessible
    Given I have the Campaign reports store
    When I read the channel totals
    Then the channel totals include text, dm, call and social
    When I read the status counts
    Then the status counts is an object
    When I read the transfer breakdown
    Then the transfer breakdown keys are valid TransferType values
