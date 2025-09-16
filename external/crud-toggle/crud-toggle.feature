Feature: CRUD permission toggles for sidebar permissions
  As an admin
  I want to manage granular permissions with Create, Read, Update, Delete controls
  So that each capability can be enabled independently

  Background:
    Given I am an authenticated admin user
    And I am viewing the application sidebar

  Scenario: Display CRUD toggles for an entity
    Given a permission item "Leads" with flags: create=false, read=true, update=false, delete=false
    When the sidebar renders the permissions list
    Then I should see a row labeled "Leads"
    And I should see four toggles labeled "C", "R", "U", and "D"
    And the "R" toggle should be ON
    And the "C", "U", and "D" toggles should be OFF

  Scenario Outline: Enable full CRUD access for an entity
    Given a permission item "<entity>" with flags: create=false, read=false, update=false, delete=false
    When I turn ON the C, R, U, and D toggles for "<entity>"
    Then the flags for "<entity>" should be create=true, read=true, update=true, delete=true

    Examples:
      | entity            |
      | Leads             |
      | Campaigns         |
      | Team              |
      | Company Profile   |
      | Reports           |
      | AI                |
      | Subscription      |
      | Tasks             |

  Scenario: Persist toggles across re-renders
    Given any permission item with some flags enabled
    When the sidebar re-renders
    Then the previously enabled flags should remain enabled

  Scenario: Bulk disable all CRUD toggles for one item
    Given a permission item with some flags enabled
    When I turn OFF each of the C, R, U, and D toggles
    Then all flags for the permission item should be false

  Scenario: Accessibility and theming
    Given I am using keyboard navigation
    When I focus a CRUD toggle
    Then pressing Space toggles the state
    And the component uses theme-aware classes for backgrounds, borders, and text
