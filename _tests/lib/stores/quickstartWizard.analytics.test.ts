import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

const capture = vi.fn();
const clarity = vi.fn();

describe("QuickStart analytics instrumentation", () => {
        beforeEach(() => {
                capture.mockReset();
                clarity.mockReset();

                Object.assign(process.env, {
                        NEXT_PUBLIC_ENABLE_POSTHOG: "true",
                        NEXT_PUBLIC_ENABLE_CLARITY: "true",
                });

                (globalThis as unknown as { window: Window }).window = window;
                window.posthog = { capture } as Window["posthog"];
                window.clarity = clarity as unknown as Window["clarity"];

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardDataStore.getState().reset();
                });
        });

        afterEach(() => {
                delete process.env.NEXT_PUBLIC_ENABLE_POSTHOG;
                delete process.env.NEXT_PUBLIC_ENABLE_CLARITY;
                window.posthog = undefined;
                window.clarity = undefined;
        });

        it("captures persona selections", () => {
                act(() => {
                        useQuickStartWizardDataStore.getState().selectPersona("investor");
                });

                expect(capture).toHaveBeenCalledWith(
                        "quickstart_persona_selected",
                        expect.objectContaining({
                                personaId: "investor",
                                goalId: null,
                                previousPersonaId: null,
                        }),
                );
        });

        it("captures goal selections with persona context", () => {
                act(() => {
                        useQuickStartWizardDataStore.getState().selectGoal("investor-pipeline");
                });

                expect(capture).toHaveBeenCalledWith(
                        "quickstart_goal_selected",
                        expect.objectContaining({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                        }),
                );
        });

        it("captures cancel events", () => {
                act(() => {
                        useQuickStartWizardStore.getState().open();
                        useQuickStartWizardDataStore.getState().selectPersona("investor");
                        useQuickStartWizardDataStore.getState().selectGoal("investor-pipeline");
                        useQuickStartWizardStore.getState().cancel();
                });

                expect(capture).toHaveBeenCalledWith(
                        "quickstart_wizard_cancelled",
                        expect.objectContaining({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                                step: expect.stringMatching(/persona|goal|summary/),
                        }),
                );
        });

        it("captures completion events before running pending actions", () => {
                const pending = vi.fn();

                act(() => {
                        useQuickStartWizardStore
                                .getState()
                                .launchWithAction(
                                        { personaId: "investor", goalId: "investor-pipeline" },
                                        pending,
                                );
                        useQuickStartWizardStore.getState().complete();
                });

                expect(capture).toHaveBeenCalledWith(
                        "quickstart_plan_completed",
                        expect.objectContaining({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                                triggeredAction: "launchWithAction",
                        }),
                );
                expect(pending).toHaveBeenCalledTimes(1);
        });
});
