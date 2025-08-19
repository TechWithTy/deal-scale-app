# Feature: Confetti on task completion (lightweight)
# Files updated:
# - external/kanban/task-card.tsx
#   - Import Confetti: around lines 16
#   - Confetti state/refs: around lines 38-42
#   - Transition effect to DONE: around lines 106-118
#   - First-view (DONE) one-time effect: around lines 119-131
#   - Render Confetti overlay: around lines 346-354
#
# Component used:
# - import { Confetti } from "@/components/magicui/confetti";
#   Rendered with small particleCount, worker on, reduced-motion respected.

Feature: Show a minimal confetti animation when a task is marked DONE
  In order to delight users on completion
  As a user
  I want to see a brief, lightweight confetti effect on task completion or first view of a completed task

  Background:
    Given I am on the "/test_external" page
    And the Kanban board is visible

  @confetti
  Scenario: Confetti plays when a task transitions to DONE
    Given there is a task with an AI workflow in "running" state
    When the workflow completes successfully
    Then the task status should change to "DONE"
    And I should briefly see a confetti animation over that task card

  @confetti
  Scenario: Confetti plays once when first viewing an already-DONE task
    Given there is a task with status "DONE" that I have never viewed before
    When I view the Kanban board
    Then I should briefly see a confetti animation over that task card
    And if I refresh and view again
    Then I should not see confetti again for that same task

  @confetti @a11y
  Scenario: Confetti respects reduced motion preference
    Given my system prefers reduced motion
    When a task transitions to DONE
    Then no confetti animation should play

  @no-confetti
  Scenario: No confetti when task is cancelled back to TODO
    Given there is a task in "running" state
    When I click the "Cancel" button
    Then the task status should change to "TODO"
    And I should not see a confetti animation

# Notes:
# - Storage key used to prevent repeat confetti per task: "kanban_confetti_<taskId>"
# - Confetti props (tuned for lightweight): particleCount: 60, ticks: 120, useWorker: true, disableForReducedMotion: true, zIndex: 60
