Feature: Dynamic table for campaign calls with inline call playback
  As a user, I want a dynamic table that mirrors the Campaigns Call table behavior
  and includes inline call playback controls so I can preview calls directly in the table.

  Background:
    Given the existing Campaigns page renders tables via `components/campaigns/utils/campaignTable.tsx`
    And the Call Campaign table implementation is in `components/tables/calls-table/call-campaign-table.tsx`
    And the call campaign columns are defined in `components/tables/calls-table/columns`
    And call campaign demo data exists via `constants/_faker/calls/callCampaign.ts`
    And an example audio file is available at `public/calls/example-call-yt.mp3`

  @externalize
  Scenario: Externalize table setup and create a minimal routed page
    Given a minimal page exists at "/test-external/dynamic-table-test/campaign-table"
    And it imports `callCampaignColumns` from `components/tables/calls-table/columns`
    And it imports `CallCampaignTable` from `components/tables/calls-table/call-campaign-table`
    And it imports `mockCallCampaignData` and `generateCallCampaignData` from `constants/_faker/calls/callCampaign.ts`
    When the page renders
    Then it should derive data as `mockCallCampaignData || generateCallCampaignData()`
    And render `<CallCampaignTable columns={callCampaignColumns} data={data} searchKey="name" pageCount={ceil(data.length/10)} />`

  @ui @routing
  Scenario: Render a new dynamic table page that reuses Campaigns Call table behavior
    Given I navigate to "/test-external/dynamic-table-test/campaign-table"
    When the page mounts
    Then I should see a dynamic table that:
      | behavior                                 |
      | search input present                     |
      | pagination controls present              |
      | query params sync for page and limit     |
      | horizontal scroll for wide tables        |
    And the table should use tanstack table configuration consistent with `CallCampaignTable`

  @columns
  Scenario: Columns copied from call campaign table
    Given the dynamic table imports or replicates columns from `components/tables/calls-table/columns`
    Then I should see matching headers in order
    And each row should render cell content using the column cell renderers

  @data
  Scenario: Populate with call campaign demo data
    Given the table is provided a dataset derived from `constants/_faker/calls/callCampaign.ts`
    Then at least 10 rows should display by default
    And page size should default to 10 and be configurable via the URL param `limit`

  @search
  Scenario: Global search filters rows
    Given I type "Test" in the global search input
    Then only rows with values matching "Test" in searchable fields are displayed

  @pagination
  Scenario: Pagination updates URL and data slice
    Given I am on the first page with `?page=1&limit=10`
    When I click Next Page
    Then the URL query should update to `?page=2&limit=10`
    And the table should render the next slice of 10 rows

  @playback
  Scenario: Inline call playback control renders in each row
    Given a column named "Call" (or similarly labeled) contains playback controls
    When I click the play button on a row
    Then an audio player should play `public/calls/example-call-yt.mp3` (or the row's audio URL)
    And the play button should toggle to a pause state
    And only one row can be playing at a time (previous playback pauses)

  @playback @controls
  Scenario: Playback controls and accessibility
    Given the playback button has `aria-label` reflecting Play or Pause state
    And the control is reachable by keyboard (Tab) and actionable with Enter/Space
    When the audio ends
    Then the control returns to the Play state

  @export @optional
  Scenario: Export current page to CSV/Excel (if implemented)
    Given an export button is present on the dynamic table page
    When I click Export CSV
    Then a CSV with the current page rows downloads
    When I click Export Excel
    Then an Excel file with the current page rows downloads

  @integration
  Scenario: Reuse code paths where possible
    Then the dynamic table should:
      | reuse                                    |
      | pagination/query utils from CallCampaignTable |
      | column definitions where feasible        |
      | shared table UI components from `@/components/ui/table` |
      | consistent styling with Campaigns tables |
