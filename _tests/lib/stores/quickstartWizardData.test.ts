import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

const getState = () => useQuickStartWizardDataStore.getState();

describe("useQuickStartWizardDataStore", () => {
        beforeEach(() => {
                act(() => {
                        getState().reset();
                });
        });

        it("initializes with no persona or goal selected", () => {
                const state = getState();

                expect(state.personaId).toBeNull();
                expect(state.goalId).toBeNull();
        });

        it("selects personas and clears incompatible goals", () => {
                act(() => {
                        getState().selectPersona("investor");
                        getState().selectGoal("investor-pipeline");
                });

                let state = getState();
                expect(state.personaId).toBe("investor");
                expect(state.goalId).toBe("investor-pipeline");

                act(() => {
                        getState().selectPersona("agent");
                });

                state = getState();
                expect(state.personaId).toBe("agent");
                expect(state.goalId).toBeNull();
        });

        it("applies persona and goal presets", () => {
                act(() => {
                        getState().applyPreset({
                                personaId: "wholesaler",
                        });
                });

                let state = getState();
                expect(state.personaId).toBe("wholesaler");
                expect(state.goalId).toBeNull();

                act(() => {
                        getState().applyPreset({
                                goalId: "agent-sphere",
                        });
                });

                state = getState();
                expect(state.personaId).toBe("agent");
                expect(state.goalId).toBe("agent-sphere");
        });

        it("resets to the initial state", () => {
                act(() => {
                        getState().selectPersona("investor");
                        getState().selectGoal("investor-market");
                        getState().reset();
                });

                const state = getState();
                expect(state.personaId).toBeNull();
                expect(state.goalId).toBeNull();
        });
});
