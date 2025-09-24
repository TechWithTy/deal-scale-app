@stores @leads
Feature: Leads reports summarization
  As a developer
  I want leads selectors to provide consistent DNC and status rollups
  So that reporting remains stable

  Scenario: DNC and status reports are available
    Given I have the Leads reports store
    When I read the DNC summary
    Then the DNC summary contains totalDNC, byFlag and bySource
    When I read the leads status counts
    Then the leads status counts is an object
