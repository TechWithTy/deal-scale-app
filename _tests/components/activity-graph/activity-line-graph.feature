@activity-graph @charts @recharts
Feature: Activity Line Graph interactions
  As a user viewing the Activity Line Graph
  I want to add and manage multiple lines, view rich popovers, and adjust time range/stretch
  So that I can explore activity trends efficiently and accurately

  Background:
    Given I am on a page with the "ActivityLineGraph" component rendered
    And the graph has initial series:
      | key      | label    |
      | desktop  | Desktop  |
      | mobile   | Mobile   |
    And the time range control defaults to "Last 7 days"
    And the quick actions popover trigger is visible

  # 1) Add another line via Quick Actions popover
  Scenario Outline: Add a new series from Quick Actions
    When I open the quick actions popover
    And I select "Add series" and choose "<seriesLabel>"
    Then the graph should render a new line for "<seriesKey>"
    And the legend should include "<seriesLabel>"
    And the tooltip should show values for "<seriesKey>" when hovering

    Examples:
      | seriesKey | seriesLabel |
      | tablet    | Tablet      |
      | bot       | Bot         |

  # 2) Hovering a point shows a custom popover
  Scenario: Show custom popover when hovering a datapoint
    Given the dataset includes a point for "desktop" at timestamp "2024-06-01T12:00:00Z"
    When I move my pointer over the "desktop" point at "2024-06-01T12:00:00Z"
    Then I should see a custom popover
    And the popover should display the formatted timestamp
    And the popover should list label-value pairs for all visible series at that timestamp
    And the popover should include the series color indicators
    And the popover should remain visible while the point is focused

  # 3) Change time period
  Scenario Outline: Change the time range using the time period control
    When I open the time range control
    And I select "<timeRange>"
    Then the x-axis should update to reflect "<timeRange>"
    And the dataset should be filtered to "<timeRange>"
    And the number of ticks should remain readable on small screens

    Examples:
      | timeRange        |
      | Last 24 hours    |
      | Last 7 days      |
      | Last 30 days     |
      | This quarter     |
      | This year        |

  # 4) Stretch/zoom the graph (horizontal scale)
  Scenario: Stretch the graph to change horizontal density
    When I drag the stretch handle to increase the graph width
    Then the chart should re-render with increased horizontal spacing between points
    And tooltips should still align exactly with their data points
    And the y-axis domain should remain auto-fit to visible data

  # 5) Toggle series visibility from legend
  Scenario Outline: Toggle a line on/off from the legend
    When I click the legend item "<seriesLabel>"
    Then the "<seriesKey>" line should toggle visibility
    And hidden series should not appear in the tooltip
    And toggled state should persist while staying on the page

    Examples:
      | seriesKey | seriesLabel |
      | desktop   | Desktop     |
      | mobile    | Mobile      |

  # 6) Keyboard and screen reader accessibility
  Scenario: Chart accessibility layer
    Given the chart is rendered with the accessibility layer enabled
    When I navigate to the nearest data point using the keyboard
    Then a tooltip equivalent popover should be announced by screen reader
    And I can move between points using arrow keys
    And I can toggle series using the legend with keyboard

  # 7) Avatar icons or custom node UI
  Scenario: Custom node renders avatar/icon and respects theme colors
    Given custom nodes are enabled with avatar/icon for each series
    When the graph renders
    Then each active data point should use the series color from config
    And the node hover state should enlarge the node and keep contrast AA compliant

  # 8) Persisted user preferences (optional)
  Scenario: Persist selected series and time range in URL or store
    Given I selected time range "Last 30 days" and enabled series "tablet"
    When I reload the page
    Then the chart should restore time range "Last 30 days"
    And the "tablet" series should be visible
