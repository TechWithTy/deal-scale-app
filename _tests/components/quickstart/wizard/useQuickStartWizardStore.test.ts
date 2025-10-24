import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
        QUICK_START_DEFAULT_STEP,
        useQuickStartWizardStore,
} from "@/lib/stores/quickstartWizard";

const resetStore = () => {
        const { reset } = useQuickStartWizardStore.getState();
        act(() => {
                reset();
        });
};

describe("useQuickStartWizardStore", () => {
        beforeEach(() => {
                resetStore();
        });

        it("opens the wizard with the default step when no preset is provided", () => {
                const store = useQuickStartWizardStore.getState();

                act(() => {
                        store.open();
                });

                const nextState = useQuickStartWizardStore.getState();
                expect(nextState.isOpen).toBe(true);
                expect(nextState.activeStep).toBe(QUICK_START_DEFAULT_STEP);
                expect(nextState.activePreset).toBeNull();
        });

        it("applies presets when launching the wizard", () => {
                const store = useQuickStartWizardStore.getState();

                act(() => {
                        store.open({
                                personaId: "agent",
                                goalId: "agent-sphere",
                                templateId: "campaign-default",
                        });
                });

                const nextState = useQuickStartWizardStore.getState();
                expect(nextState.isOpen).toBe(true);
                expect(nextState.activeStep).toBe("summary");
                expect(nextState.activePreset).toEqual({
                        personaId: "agent",
                        goalId: "agent-sphere",
                        templateId: "campaign-default",
                });
        });

        it("supports manual step navigation and resets state on close", () => {
                const store = useQuickStartWizardStore.getState();

                act(() => {
                        store.open();
                        store.goToStep("goal");
                        store.close();
                });

                const nextState = useQuickStartWizardStore.getState();
                expect(nextState.isOpen).toBe(false);
                expect(nextState.activeStep).toBe(QUICK_START_DEFAULT_STEP);
                expect(nextState.activePreset).toBeNull();
        });
});
