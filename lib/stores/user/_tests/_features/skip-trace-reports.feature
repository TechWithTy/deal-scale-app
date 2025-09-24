@stores @skiptrace
Feature: Skip Trace reports summarization
  As a developer
  I want skip trace selectors to expose progress, headers and enrichment summaries
  So that the wizard and summaries stay consistent

  Scenario: Progress and headers summaries are available
    Given I have the Skip Trace reports store
    When I read the progress summary
    Then the progress summary contains step and stepPercent
    When I read the headers summary
    Then the headers summary contains parsedCount and selectedCount
