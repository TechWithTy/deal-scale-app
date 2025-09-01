Feature: Leaderboard Component Customization
  As a developer integrating the leaderboard
  I want to customize animation timings and display options
  So that the leaderboard matches the app's design and performance needs

  Background:
    Given the LeaderboardContainer component is mounted

  Scenario: Customize animation duration
    When I render the component with animationDuration=1.0
    Then the header, table, and footer animations use duration 1.0

  Scenario: Customize animation delays
    When I render the component with headerDelay=0.5, tableDelay=0.7, footerDelay=0.9
    Then the animations start with the specified delays

  Scenario: Limit number of players displayed
    When I render the component with maxPlayers=50
    Then only the top 50 players are shown
    And the title shows "Top 50 Players"
    And the footer shows "Showing top 50 of X active players"

  Scenario: Customize row animation timings
    When I render the component with tableRowDuration=0.6 and tableRowDelayMultiplier=0.03
    Then each row animates with duration 0.6 and staggered delays
