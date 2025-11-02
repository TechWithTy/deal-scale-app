import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
                expect(nextState.pendingAction).toBeNull();
        });

        it("queues a pending action when launching with an action", () => {
                const store = useQuickStartWizardStore.getState();
                const action = vi.fn();

                act(() => {
                        store.launchWithAction({ personaId: "agent" }, action);
                });

                const nextState = useQuickStartWizardStore.getState();
                expect(nextState.isOpen).toBe(true);
                expect(nextState.pendingAction).toBe(action);
                expect(action).not.toHaveBeenCalled();

                act(() => {
                        store.complete();
                });

                expect(action).toHaveBeenCalledTimes(1);

                const finalState = useQuickStartWizardStore.getState();
                expect(finalState.isOpen).toBe(false);
                expect(finalState.pendingAction).toBeNull();
        });

        it("cancels any pending action when cancel is invoked", () => {
                const store = useQuickStartWizardStore.getState();
                const action = vi.fn();

                act(() => {
                        store.launchWithAction({ personaId: "agent" }, action);
                        store.cancel();
                });

                expect(action).not.toHaveBeenCalled();

                const nextState = useQuickStartWizardStore.getState();
                expect(nextState.isOpen).toBe(false);
                expect(nextState.pendingAction).toBeNull();
        });
});
