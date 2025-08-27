Feature: Theming compliance for external/kanban UI components
  As a user and developer
  I want all external/kanban components to follow the theming guide
  So Light/Dark (and future) themes render consistently using Tailwind tokens and CSS variables

  Background:
    Given the app uses Tailwind with darkMode class per tailwind.config.js
    And CSS variables for design tokens are defined in styles/globals.css
    And next-themes controls the html class via ThemeProvider

  # Global checks
  Scenario: ThemeProvider integration exists
    When I open the Kanban app route
    Then the ThemeProvider is mounted
    And the html element has a theme class of either "light" or "dark"

  Scenario: ThemeToggle persists preference
    When I toggle the theme from light to dark
    Then the html element contains class "dark"
    And the preference is persisted across reload

  # Component inventory under external/kanban/components/
  # Add/adjust as new components are created
  @components
  Scenario Outline: Component respects theming tokens and dark mode
    Given the component <ComponentPath> is rendered in light theme
    Then it uses only Tailwind token classes or CSS variables for colors
    And it contains no hard-coded hex, rgb(a), or named color values
    And borders, shadows, and backgrounds use semantic tokens (e.g., border, background, card, muted)
    When I switch to dark theme
    Then foreground text remains readable and meets contrast expectations
    And backgrounds, borders and hover states adapt to dark mode

    Examples:
      | ComponentPath                                                |
      | external/kanban/components/ViewSearchAndSort.tsx             |
      | external/kanban/components/EditTaskDialog.tsx                |
      | external/kanban/components/SuggestModal.tsx                  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx|
      | external/kanban/components/aiAgents/AgentList.tsx            |
      | external/kanban/components/aiAgents/AgentAvatar.tsx          |

  # Visual states
  Scenario Outline: Hover, focus, and disabled states follow tokens
    Given the component <ComponentPath> has interactive elements
    When I hover and focus the primary actions
    Then styles use tokenized classes (e.g., hover:bg-accent, focus:ring-ring, text-foreground)
    And disabled states use opacity and tokenized foreground/background

    Examples:
      | ComponentPath                                    |
      | external/kanban/components/ViewSearchAndSort.tsx |
      | external/kanban/components/EditTaskDialog.tsx    |
      | external/kanban/components/SuggestModal.tsx      |

  # Specific checks
  Scenario: SuggestModal card list theming
    Given the SuggestModal is open
    Then card containers use bg-background and border with tokenized color
    And hover states use hover:border-primary/40 or token-equivalent
    And text uses text-foreground or text-muted-foreground appropriately

  Scenario: EditTaskDialog panel theming
    Given the EditTaskDialog is open
    Then the dialog surface uses bg-background and border tokens
    And Tabs, Lists, and Editors use semantic token classes for both themes

  Scenario: ViewSearchAndSort toolbar theming
    Given the ViewSearchAndSort toolbar is visible
    Then inputs, selects, and dropdowns use tokenized classes
    And dropdown surfaces and items adapt in dark mode without hard-coded colors

  # Code hygiene checks
  Scenario Outline: No hard-coded color values in source
    Given I open <ComponentPath>
    Then there are no occurrences of "#", "rgb(", "rgba(", or named colors like "red", "blue", etc. in className or style props

    Examples:
      | ComponentPath                                                |
      | external/kanban/components/ViewSearchAndSort.tsx             |
      | external/kanban/components/EditTaskDialog.tsx                |
      | external/kanban/components/SuggestModal.tsx                  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx|

  # Accessibility
  Scenario: Contrast check passes on both themes for key text
    Given the app is in light theme
    Then primary text on surfaces meets contrast expectations
    When I switch to dark theme
    Then the same text meets contrast expectations

  # Concrete line-level tasks discovered by audit
  @line_items
  Scenario Outline: Replace non-token color utilities with theme tokens
    Given I open <FilePath>
    Then on line <Line>, replace <Original> with <Replacement>

    Examples:
      | FilePath                                                           | Line | Original               | Replacement            |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 52   | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 61   | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 71   | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 73   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 81   | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 89   | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 110  | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 119  | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 129  | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 131  | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 139  | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 152  | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 173  | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 182  | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 192  | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 195  | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 202  | border-gray-300       | border                 |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 211  | text-gray-700         | text-foreground        |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 214  | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/new-task-dialog/TaskFormFields.tsx     | 221  | border-gray-300       | border                 |
      | external/kanban/components/card/components/LeadInfo.tsx           | 23   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/card/components/LeadInfo.tsx           | 27   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/card/components/LeadInfo.tsx           | 39   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/card/components/LeadInfo.tsx           | 43   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/card/components/LeadInfo.tsx           | 48   | text-gray-400         | text-muted-foreground  |
      | external/kanban/components/card/components/AssignmentSelect.tsx   | 18   | border-gray-300       | border                 |
