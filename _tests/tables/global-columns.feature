Feature: Global columns for campaign tables
  As a user of any campaign-related table
  I want to consistently see Script, Agent, Transfer Agent, Goal, Timing, DNC, and DNC Source columns
  So that I can review campaign setup and compliance at a glance across all tables

  # Implementation references (file locations and code lines as of this commit)
  # - external/shadcn-table/src/hooks/use-data-table.ts
  #   Global column builders:
  #     buildGlobalScriptColumn<TData>()        lines ~68-88
  #     buildGlobalAgentColumn<TData>()         lines ~90-110
  #     buildGlobalTransferAgentColumn<TData>() lines ~112-132
  #     buildGlobalGoalColumn<TData>()          lines ~134-153
  #     buildGlobalTimingPrefsColumn<TData>()   lines ~155-181
  #     buildGlobalDncColumn<TData>()           lines ~183-252 (pre-existing)
  #     buildGlobalDncSourceColumn<TData>()     lines ~115-221 (refined)
  #   Injection and ordering:
  #     Columns injection block                 lines ~413-464
  #     initialState.columnOrder adjustment     lines ~584-618
  #
  # Notes:
  # - Columns are injected after the 'select' column when present.
  # - DNC and DNC Source are placed first; then Script, Agent, Transfer Agent, Goal, Timing.
  # - Cells render plain strings (no JSX) to keep the hook as .ts.
  # - DNC Source options: Text Opt-out, Email, Call, DM, Pop-in to DNC, Scrub List, (empty).
  # - Timing summarizes dialing config as A:<total>/D:<daily>/C:<cooldown>m/VM=✓|✗.

  Background:
    Given I am on a page that renders a campaign-related data table using useDataTable

  Scenario: Columns are present in correct order after selection column
    When the table renders
    Then the column order includes in sequence after "select":
      | globalDnc                 |
      | globalDncSource          |
      | globalSalesScriptTitle   |
      | globalAgentTitle         |
      | globalTransferAgentTitle |
      | globalCampaignGoal       |
      | globalTimingPrefs        |

  Scenario Outline: DNC Source categorization
    Given a row with the following flags
      | key     | value         |
      | <key>   | <value>       |
    When the row is rendered
    Then the "DNC Source" cell equals "<label>"

    Examples:
      | key              | value    | label         |
      | smsOptOut        | true     | Text Opt-out  |
      | emailOptOut      | true     | Email         |
      | scaCall          | true     | Call          |
      | manualDnc        | true     | Pop-in to DNC |
      | dncList          | true     | Scrub List    |

  Scenario: Inferring DNC Source from campaign shape when numeric dnc > 0
    Given a row where dnc = 1 and has SMS-like fields (e.g., smsOptIn)
    When the row is rendered
    Then the "DNC Source" cell equals "Text"

  Scenario: Script, Agent and Transfer Agent display
    Given a row with aiScript = "Property Pitch V2"
      And aiAvatarAgent = "Ava - Seller"
      And transfer.agentId = "agent-123"
    When the row is rendered
    Then the "Script" cell equals "Property Pitch V2"
      And the "Agent" cell equals "Ava - Seller"
      And the "Transfer Agent" cell equals "agent-123"

  Scenario: Goal is truncated with ellipsis
    Given a row with goal = "This is a very long campaign goal that should be truncated for readability in the table UI"
    When the row is rendered
    Then the "Goal" cell shows an ellipsis suffix and total length <= 60 characters

  Scenario: Timing preferences summarized
    Given a row with totalDialAttempts=6, maxDailyAttempts=2, minMinutesBetweenCalls=15, countVoicemailAsAnswered=true
    When the row is rendered
    Then the "Timing" cell equals "A:6/D:2/C:15m/VM=✓"

  Scenario: Filtering by DNC Source
    Given the user opens the Filters menu
    When the user selects DNC Source = "Text Opt-out"
    Then only rows whose DNC Source resolves to "Text Opt-out" (or empty if (empty) selected) remain visible
