Feature: Extract call playback UI into a reusable audio-playback submodule

  Background:
    Given the current playback components live at
      | filePath                                                                                                 | lines    |
      | external/shadcn-table/src/examples/Phone/call/components/PlaybackCell.tsx                                | 1-42     |
      | external/shadcn-table/src/examples/Phone/call/components/PlayButtonSkip.tsx                              | 1-233    |
      | components/tables/calls-table/columns.tsx (usage site for in-app table)                                  | 1-172    |

  Scenario: Create external/audio-playback submodule and move playback components
    Given a new folder "external/audio-playback" exists
    And a new file "external/audio-playback/PlaybackCell.tsx" is created by copying
      "external/shadcn-table/src/examples/Phone/call/components/PlaybackCell.tsx" (lines 1-42)
    And a new file "external/audio-playback/PlayButtonSkip.tsx" is created by copying
      "external/shadcn-table/src/examples/Phone/call/components/PlayButtonSkip.tsx" (lines 1-233)
    And a new file "external/audio-playback/index.ts" exports
      "export { PlaybackCell } from './PlaybackCell';\nexport { PlayButtonSkip } from './PlayButtonSkip';"

    # Normalize asset import path for Lottie used by PlayButtonSkip
    When I update import of playAnimation in "external/audio-playback/PlayButtonSkip.tsx"
    Then the line "import playAnimation from '../../../../../../../public/lottie/playButton.json';" is replaced with
      "import playAnimation from '@/public/lottie/PlayButton.json';"

  Scenario: Replace in-app imports to use the new submodule
    Given in "components/tables/calls-table/columns.tsx" (lines 1-172)
    When I replace usage of inline/local playback with submodule imports
    Then I import from "external/audio-playback" as
      "import { PlayButtonSkip } from '@/external/audio-playback';"
    And ensure the local inline `PlaybackCell` (lines 127-171) is removed
    And instead import
      "import { PlaybackCell } from '@/external/audio-playback';"
    And keep rendering `<PlaybackCell callInformation={row.original.callInformation} />` (lines 116-123)

  Scenario: Verify behavior parity and accessibility
    Then Play/Pause toggles the Lottie animation and audio element in sync
    And Timeline seek and drag works with startTime and endTime window
    And Prev/Next buttons reflect disabled state based on first/last call
    And Title truncates with tooltip for long text
    And Buttons have explicit type attributes to satisfy a11y lint rules

  Scenario: Acceptance criteria
    Then TypeScript builds with no errors
    And Biome lints and formats cleanly
    And Calls table playback works identically after the refactor
