Feature: Intent Signals Tracking
  As a sales rep
  I want to see intent signals on my leads
  So I can prioritize high-intent prospects and close deals faster

  Background:
    Given I am logged into DealScale
    And I have access to the leads dashboard
    And intent signal tracking is enabled

  # ============================================
  # VIEWING INTENT SIGNALS ON INDIVIDUAL LEADS
  # ============================================

  Scenario: View intent signals on individual lead
    Given I navigate to the Leads page
    And I have leads with intent signal data
    When I click on a lead named "John Doe"
    Then I should see the lead detail modal
    And I should see tabs: "Lead Details", "Activity", "Intent Signals"
    When I click on the "Intent Signals" tab
    Then I should see the intent score displayed prominently
    And the intent score should be between 0 and 100
    And I should see an intent level badge showing "High", "Medium", "Low", or "None"
    And I should see a list of intent signals grouped by category
    And each signal should show:
      | Field           |
      | Signal icon     |
      | Description     |
      | Timestamp       |
      | Score value     |
      | Signal type     |

  Scenario: View intent signals in tabbed interface
    Given I am viewing a lead with 25 intent signals
    When I click on the "Intent Signals" tab
    Then I should see tabs for filtering signals:
      | Tab Name     |
      | All          |
      | Engagement   |
      | Behavioral   |
      | External     |
    And the "All" tab should be selected by default
    And I should see the total count in parentheses for each tab
    When I click on the "Engagement" tab
    Then I should only see engagement signals like:
      | Signal Type         |
      | Email opens         |
      | Email clicks        |
      | Call answered       |
      | SMS reply           |

  Scenario: View intent score breakdown
    Given I am viewing a lead's Intent Signals tab
    Then I should see an Intent Score Widget showing:
      | Component                |
      | Total score (0-100)      |
      | Intent level badge       |
      | Trend indicator          |
      | Percentage change        |
      | Signal count             |
    And I should see score breakdown by signal type:
      | Signal Type  |
      | Engagement   |
      | Behavioral   |
      | External     |
    And each breakdown should show:
      | Information       |
      | Score value       |
      | Progress bar      |

  # ============================================
  # HIGH-INTENT LEAD IDENTIFICATION
  # ============================================

  Scenario: High-intent lead identification in lead list
    Given I am viewing the lead list
    And I have leads with various intent scores
    When the lead table loads
    Then I should see an "Intent" column
    And leads with scores 75+ should display:
      | Display Element                |
      | Score number in green          |
      | "High" badge in green          |
    And leads with scores 50-74 should display:
      | Display Element                |
      | Score number in yellow         |
      | "Medium" badge in yellow       |
    And leads with scores 1-49 should display:
      | Display Element                |
      | Score number in gray           |
      | "Low" badge in gray            |
    And leads with no signals should display:
      | Display Element                |
      | "No Data" badge in outline     |

  Scenario: Sort leads by intent score
    Given I am viewing the lead list
    And I have 50 leads with varying intent scores
    When I click on the "Intent" column header
    Then the leads should be sorted by intent score in descending order
    And the highest intent leads should appear at the top
    When I click the "Intent" column header again
    Then the leads should be sorted by intent score in ascending order

  # ============================================
  # INTENT SCORE CALCULATION
  # ============================================

  Scenario: Intent score calculation with time decay
    Given a lead has the following signals:
      | Signal Type        | Category         | Date         | Base Weight |
      | Engagement         | email_open       | 2 days ago   | 7           |
      | Behavioral         | pricing_viewed   | 1 day ago    | 30          |
      | External           | linkedin_visit   | 3 days ago   | 2           |
    Then the intent score should be calculated with time decay:
      | Signal           | Weight | Days Old | Decay Factor | Final Score |
      | pricing_viewed   | 30     | 1        | 1.0          | 30          |
      | email_open       | 7      | 2        | 1.0          | 7           |
      | linkedin_visit   | 2      | 3        | 1.0          | 2           |
    And the total raw score should be approximately 39
    And the normalized score (0-100) should be approximately 31
    And the intent level should be "Low"

  Scenario: Intent score with high-value signals
    Given a lead has the following high-value signals from the last 7 days:
      | Signal Category      | Count | Base Weight |
      | pricing_viewed       | 3     | 30          |
      | demo_request         | 1     | 28          |
      | call_connected       | 2     | 27          |
      | contract_viewed      | 1     | 26          |
    Then the total raw score should exceed 150
    And the normalized score should be close to 100 (capped)
    And the intent level should be "High"

  Scenario: Intent signals with decay after 7 days
    Given a lead has signals that are 10 days old
    When the intent score is calculated
    Then signals older than 7 days should have reduced weight
    And the decay rate should be 5% per day after day 7
    And signals older than 30 days should have 0 weight

  # ============================================
  # INTENT SIGNAL TREND ANALYSIS
  # ============================================

  Scenario: View intent score trend
    Given a lead had an intent score of 45 last week
    And the lead now has an intent score of 72
    When I view the Intent Score Widget
    Then I should see an upward trending arrow
    And I should see "+60%" indicating the percentage increase
    And the trend should be labeled as "from last week"

  Scenario: Declining intent signal trend
    Given a lead had an intent score of 80 last week
    And the lead now has an intent score of 52
    When I view the Intent Score Widget
    Then I should see a downward trending arrow
    And I should see "-35%" indicating the percentage decrease
    And the trend indicator should be red

  # ============================================
  # EMPTY STATES
  # ============================================

  Scenario: Empty state for leads without signals
    Given I am viewing a lead with no intent signals
    When I click on the "Intent Signals" tab
    Then I should see a message "No Intent Signals Yet"
    And I should see an explanation of what intent signals are
    And I should see a list of tracked activities:
      | Activity Type                |
      | Email opens, clicks, replies |
      | Website visits and page views|
      | Document downloads           |
      | Phone calls and SMS          |
      | External signals             |

  Scenario: Lead list intent column with no data
    Given I am viewing a lead in the lead list
    And the lead has no intent signal data
    Then the "Intent" column should show a "No Data" badge
    And the badge should have an outline style
    And clicking on the lead should not show an "Intent Signals" tab

  # ============================================
  # SIGNAL TYPES AND CATEGORIES
  # ============================================

  Scenario Outline: Display different signal types correctly
    Given a lead has a "<SignalCategory>" signal
    When I view the Intent Signals tab
    Then the signal should display with:
      | Property              | Value              |
      | Icon                  | <Icon>             |
      | Type badge            | <Type>             |
      | Score weight          | <Weight>           |
      | Description format    | <Description>      |

    Examples:
      | SignalCategory      | Icon              | Type       | Weight | Description                    |
      | email_open          | Mail icon         | Engagement | +7 pts | Opened email: "Subject"        |
      | pricing_viewed      | Dollar icon       | Behavioral | +30 pts| Viewed pricing page            |
      | linkedin_visit      | LinkedIn icon     | External   | +2 pts | Visited on LinkedIn            |
      | call_connected      | Phone icon        | Engagement | +27 pts| Connected on phone call (15m)  |
      | document_downloaded | File icon         | Behavioral | +14 pts| Downloaded: filename.pdf       |
      | demo_request        | Calendar icon     | Behavioral | +28 pts| Requested a demo               |

  # ============================================
  # SIGNAL METADATA DISPLAY
  # ============================================

  Scenario: View signal metadata
    Given a lead has a "website_visit" signal
    And the signal has metadata:
      | Field       | Value                                    |
      | pageUrl     | https://dealscale.app/pricing           |
      | pageTitle   | Pricing & Plans - DealScale             |
      | timeOnPage  | 180                                     |
    When I view the signal in the Intent Signals tab
    Then the signal description should show "Viewed: Pricing & Plans - DealScale"
    And the timestamp should show relative time like "2h ago" or "3d ago"

  # ============================================
  # PERFORMANCE AND FILTERING
  # ============================================

  Scenario: Filter signals by type
    Given a lead has 50 intent signals
    And 20 are engagement signals
    And 25 are behavioral signals
    And 5 are external signals
    When I click on the "Behavioral" tab
    Then I should only see 25 signals
    And all signals should have the "Behavioral" badge
    And the signals should be sorted by timestamp (most recent first)

  Scenario: Intent signals timeline ordering
    Given a lead has signals from different dates
    When I view the "All" tab in Intent Signals
    Then the signals should be displayed in chronological order
    And the most recent signal should appear first
    And each signal should show relative time

  # ============================================
  # INTEGRATION WITH LEAD WORKFLOW
  # ============================================

  Scenario: Use intent signals to prioritize leads
    Given I am a sales rep with 100 leads
    When I sort the lead list by intent score descending
    Then I should see high-intent leads (75+) at the top
    And I can focus my outreach on the most engaged prospects
    And I should be able to click on any lead to view their signals

  Scenario: Intent signals update in real-time
    Given I am viewing a lead's Intent Signals tab
    When a new signal is recorded (e.g., email opened)
    And I refresh the lead modal
    Then the new signal should appear in the timeline
    And the intent score should be recalculated
    And the trend indicator should update

  # ============================================
  # ACCESSIBILITY
  # ============================================

  Scenario: Intent signals are accessible
    Given I am using screen reader software
    When I navigate to the Intent Signals tab
    Then all signal icons should have aria-labels
    And the intent score should be announced with context
    And the trend indicator should be announced
    And I can navigate through signals using keyboard

  Scenario: Intent score color contrast
    Given I am viewing the lead list
    Then the intent score colors should meet WCAG AA standards
    And the "High" intent badge should be readable in both light and dark modes
    And the "Medium" intent badge should have sufficient contrast

