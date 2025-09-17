Feature: Determine on/off-market status using RentCast Property Listings
  As a lead analyst
  I want to flag properties as on-market or off-market
  So that off-market lead workflows exclude currently active listings

  Background:
    Given a listing response schema per RentCast "Property Listings" API

  # Core rule validation
  Scenario: Listing is on market when status is Active
    Given a listing record exists for "3821 Hargis St, Austin, TX 78723"
    And the listing status is "Active"
    When I compute the on_market flag
    Then on_market should be true
    And removed_date should be null

  Scenario: Listing is off market when status is Inactive
    Given a listing record exists for "3821 Hargis St, Austin, TX 78723"
    And the listing status is "Inactive"
    And the removedDate is "2024-10-01T00:00:00.000Z"
    And the price is 899000
    When I compute the on_market flag
    Then on_market should be false
    And removed_date should equal "2024-10-01T00:00:00.000Z"
    And last_known_price should equal 899000

  Scenario: No listing record implies off market
    Given no listing record exists for the provided address
    When I compute the on_market flag
    Then on_market should be false
    And reason should equal "No listing record"

  # Enrichment fields
  Scenario Outline: Supporting fields are surfaced
    Given a listing record exists for <address>
    And the listing status is <status>
    And the listedDate is <listedDate>
    And the removedDate is <removedDate>
    And the lastSeenDate is <lastSeenDate>
    And the daysOnMarket is <daysOnMarket>
    When I compute the on_market flag
    Then the fields listedDate, removedDate, lastSeenDate, daysOnMarket should be preserved

    Examples:
      | address                                 | status   | listedDate                 | removedDate                | lastSeenDate                 | daysOnMarket |
      | "3821 Hargis St, Austin, TX 78723"     | "Active" | "2024-06-24T00:00:00.000Z" | null                       | "2024-09-30T13:11:47.157Z" | 99           |
      | "3781 Passion Vine Dr, Alva, FL 33920" | "Active" | "2024-09-19T00:00:00.000Z" | null                       | "2024-09-28T12:28:50.115Z" | 10           |

  # Integration with app data model
  Scenario: RentCastProperty carries listing and derived flags
    Given a RentCastProperty has a linked listing with status "Active"
    When I map the property
    Then property.onMarket should be true
    And property.lastKnownPrice should equal listing.price
    And property.removedDate should equal listing.removedDate
