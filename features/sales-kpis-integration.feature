Feature: Sales KPI Dashboard Integration
  As a sales manager
  I want to track key sales metrics and intent signals together
  So I can measure team performance and ROI effectively

  Background:
    Given I am logged into DealScale
    And I have access to the Analytics & Charts dashboard
    And I navigate to "/dashboard/charts"

  # ============================================
  # SALES KPI DASHBOARD OVERVIEW
  # ============================================

  Scenario: View sales KPI dashboard
    Given I am on the Analytics & Charts page
    Then I should see three main tabs:
      | Tab Name   |
      | Overview   |
      | AI Agents  |
      | Advanced   |
    And the "Overview" tab should be selected by default
    And I should see KPI summary cards:
      | KPI Card          |
      | Total Leads       |
      | Campaigns         |
      | Conversion Rate   |
      | Active Tasks      |
    And each KPI card should display:
      | Component         |
      | Title             |
      | Value             |
      | Delta percentage  |
      | Delta label       |
      | Trend icon        |

  Scenario: View Sales Pipeline Funnel
    Given I am on the Overview tab
    When I scroll to the Sales Pipeline section
    Then I should see a funnel visualization with stages:
      | Stage          | Display |
      | Total Leads    | Count and bar |
      | Contacted      | Count, bar, and conversion % |
      | Conversations  | Count, bar, and conversion % |
      | Qualified      | Count, bar, and conversion % |
      | Deals Closed   | Count, bar, and conversion % |
    And each stage should show its conversion rate from the previous stage
    And the bar width should be proportional to the count
    And the bars should have different colors for each stage

  # ============================================
  # INTENT SIGNALS INTEGRATION WITH KPIs
  # ============================================

  Scenario: View high-intent leads impacting conversion rates
    Given I have 100 total leads
    And 30 leads have high intent scores (75+)
    And 20 of those high-intent leads are in "Contacted" stage
    When I view the Sales Pipeline Funnel
    Then the Contacted stage should show improved conversion rates
    And I can correlate high intent with higher conversion likelihood

  Scenario: Filter KPIs by date range with intent signals
    Given I am on the Analytics & Charts page
    When I select "Last 7 days" from the date range picker
    Then all KPI metrics should update
    And leads with recent intent activity should be included
    And the conversion rates should reflect the selected period

  # ============================================
  # CONVERSION FUNNEL ANALYSIS
  # ============================================

  Scenario: Analyze conversion funnel stages
    Given I have the following pipeline data:
      | Stage         | Count |
      | Total Leads   | 1000  |
      | Contacted     | 600   |
      | Conversations | 450   |
      | Qualified     | 400   |
      | Deals Closed  | 250   |
    When I view the Sales Pipeline Funnel
    Then the conversion rates should be calculated as:
      | From Stage    | To Stage      | Conversion Rate |
      | Total Leads   | Contacted     | 60.0%          |
      | Contacted     | Conversations | 75.0%          |
      | Conversations | Qualified     | 88.9%          |
      | Qualified     | Deals Closed  | 62.5%          |
    And each stage should display its conversion rate
    And I should be able to identify bottlenecks (lowest conversion rates)

  Scenario: Compare intent signals across funnel stages
    Given I have leads in different funnel stages
    And each stage has varying intent scores:
      | Stage         | Avg Intent Score |
      | Total Leads   | 25               |
      | Contacted     | 45               |
      | Qualified     | 68               |
      | Deals Closed  | 82               |
    Then I can observe that intent scores increase through the funnel
    And high-intent leads are more likely to close

  # ============================================
  # DEAL VALUE AND ROI TRACKING
  # ============================================

  Scenario: Track deal values and revenue
    Given I have closed 25 deals in the last 30 days
    And the total revenue is $500,000
    When I view the KPI cards
    Then I should see metrics showing:
      | Metric               | Value    |
      | Total Deals          | 25       |
      | Average Deal Value   | $20K     |
      | Total Revenue        | $500K    |
    And each metric should show a trend indicator
    And the trend should compare to the previous 30 days

  Scenario: Calculate ROI with intent signal attribution
    Given I have revenue of $500,000
    And my costs (platform + activities) are $150,000
    When I view the ROI metrics
    Then the ROI percentage should be calculated as:
      | Metric    | Value              |
      | Revenue   | $500,000           |
      | Costs     | $150,000           |
      | Profit    | $350,000           |
      | ROI %     | 233%               |
    And I should see the ROI trend
    And high-intent leads should contribute to better ROI

  # ============================================
  # ADVANCED ANALYTICS WITH INTENT SIGNALS
  # ============================================

  Scenario: View intent signal attribution in Advanced tab
    Given I am on the Analytics & Charts page
    When I click on the "Advanced" tab
    Then I should see enterprise-level analytics including:
      | Component                |
      | AI ROI Dashboard         |
      | Predictive Lead Scoring  |
      | Signal Attribution       |
      | Deal Efficiency Index    |
    And the Signal Attribution component should show:
      | Data Point                    |
      | Signal type                   |
      | Lead count per signal         |
      | Deals closed per signal       |
      | Conversion rate               |
      | Average intent score          |
      | Average deal value            |

  Scenario: Predictive lead scoring with intent signals
    Given I am viewing the Advanced tab
    And I have the Predictive Lead Scoring component
    When I view a lead's predicted score
    Then the prediction should incorporate:
      | Factor                       |
      | Historical conversion data   |
      | Current intent signals       |
      | Recent activity patterns     |
      | Signal velocity (trend)      |
    And leads with high intent should have higher predicted scores

  # ============================================
  # TIME-BASED METRICS
  # ============================================

  Scenario: Track average days to close
    Given I have closed deals with various cycle times
    When I view the KPI metrics
    Then I should see "Avg Days to Close" metric
    And leads with high intent signals should have shorter cycles
    And the metric should show a trend indicator

  Scenario: Pipeline velocity with intent signals
    Given I track how quickly leads move through stages
    And high-intent leads move faster through the pipeline
    When I view pipeline metrics
    Then I should see velocity metrics:
      | Stage Transition       | Avg Days |
      | New to Contacted       | 2        |
      | Contacted to Qualified | 5        |
      | Qualified to Closed    | 14       |
    And the total cycle time should be calculated
    And I can correlate intent signals with faster velocity

  # ============================================
  # ACTIVITY METRICS TRACKING
  # ============================================

  Scenario: Track sales activities generating intent signals
    Given my team has made the following activities:
      | Activity           | Count |
      | Calls made         | 300   |
      | Emails sent        | 500   |
      | SMS sent           | 200   |
      | Meetings booked    | 40    |
      | Properties shown   | 30    |
    And these activities generate intent signals
    Then I should see activity metrics in the dashboard
    And I can measure which activities generate the most intent signals
    And I can optimize team performance based on signal generation

  # ============================================
  # REFRESH AND REAL-TIME UPDATES
  # ============================================

  Scenario: Refresh analytics data
    Given I am viewing the Analytics & Charts page
    When I click the "Refresh" button
    Then the KPI data should reload
    And the loading state should be displayed briefly
    And all metrics should update with current data
    And intent signal data should be recalculated

  Scenario: Auto-refresh analytics
    Given I am viewing the Analytics & Charts page
    And auto-refresh is enabled (every 15 minutes)
    When 15 minutes pass
    Then the analytics data should automatically refresh
    And intent scores should be recalculated for all leads
    And KPI metrics should update

  # ============================================
  # EXPORT AND REPORTING
  # ============================================

  Scenario: Export KPI data with intent signals
    Given I am on the Analytics & Charts page
    When I click the "Export" or "Download" button
    Then a CSV file should download containing:
      | Field                     |
      | Date Range                |
      | Total Leads               |
      | Conversion Rates          |
      | Total Revenue             |
      | Average Deal Value        |
      | ROI Percentage            |
      | High-Intent Lead Count    |
      | Intent Signal Totals      |

  # ============================================
  # COMPARATIVE ANALYSIS
  # ============================================

  Scenario: Compare current period to previous period
    Given I am viewing KPIs for the last 30 days
    And each metric has a delta percentage
    When I see "+15%" on Total Leads
    Then this indicates 15% more leads than the previous 30 days
    And the trend arrow should point up
    And the color should be green (positive)

  Scenario: Identify underperforming metrics
    Given I am viewing the KPI dashboard
    When a metric has a negative delta (e.g., "-12%")
    Then the trend arrow should point down
    And the color should be red (negative)
    And I can investigate which leads have declining intent signals

  # ============================================
  # LEAD TRENDS CHART WITH INTENT
  # ============================================

  Scenario: View lead trends over time
    Given I am on the Overview tab
    When I view the Lead Trends Chart
    Then I should see a line chart showing:
      | Data Series               |
      | Total leads over time     |
      | Trend line                |
    And I can correlate spikes in leads with intent signal activity
    And I can identify patterns in lead generation

  # ============================================
  # CAMPAIGN PERFORMANCE CORRELATION
  # ============================================

  Scenario: Correlate campaigns with intent signals
    Given I am viewing the Campaign Performance Chart
    And I have multiple active campaigns
    When I analyze campaign data
    Then I should see which campaigns generate the most intent signals
    And I can identify high-performing campaigns based on:
      | Metric                        |
      | Leads generated               |
      | Average intent score          |
      | Conversion rate               |
      | Cost per high-intent lead     |

  # ============================================
  # INTEGRATION POINTS
  # ============================================

  Scenario: Navigate from KPI dashboard to lead details
    Given I am viewing the Analytics & Charts page
    And I see that 30 leads have high intent scores
    When I want to see specific high-intent leads
    Then I should be able to navigate to the Leads page
    And I should be able to sort by intent score
    And I can click on individual leads to view their Intent Signals tab

  Scenario: Cross-reference intent signals with deal outcomes
    Given I have closed deals with known intent scores
    When I analyze historical data
    Then I can identify the average intent score for won deals vs. lost deals
    And I can set benchmarks for what constitutes "high intent"
    And I can refine my scoring weights based on actual outcomes

  # ============================================
  # SIMPLE PLAUSIBLE-STYLE METRICS
  # ============================================

  Scenario: View simple, focused KPIs (Plausible approach)
    Given I want a clean, simple dashboard like Plausible Analytics
    When I view the Analytics & Charts page
    Then the KPIs should be:
      | Characteristic        |
      | Easy to understand    |
      | Immediately actionable|
      | Not overwhelming      |
      | Focused on key metrics|
    And I should not see unnecessary complexity
    And the most important metrics should be prominent
    And intent signals should be integrated seamlessly

  Scenario: Quick glance at performance
    Given I am a busy sales manager
    When I open the Analytics & Charts page
    Then I should immediately understand:
      | Insight                              |
      | How many leads I have                |
      | What my conversion rate is           |
      | How many high-intent leads exist     |
      | What my ROI is                       |
    And I should be able to take action within 30 seconds

