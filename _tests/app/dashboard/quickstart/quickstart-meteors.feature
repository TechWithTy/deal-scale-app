Feature: Quick Start meteor highlights
  Background:
    Given I am an authenticated dashboard user
    And I navigate to the Quick Start surface

  @visual @quickstart
  Scenario: Priority cards display meteor animations
    When the Quick Start cards render
    Then the first two non-guided quick start cards show active meteor trails
    And the guided quick start card does not show meteor trails

  @visual @randomization @quickstart
  Scenario: Meteor overlay randomization across reloads
    Given I record the meteor configuration for the Quick Start cards
    When I reload the Quick Start dashboard page
    Then at least one non-guided card has a different meteor configuration seed

