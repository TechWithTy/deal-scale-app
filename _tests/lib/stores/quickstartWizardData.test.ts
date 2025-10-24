import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import {
        type LeadSourceOption,
        type LaunchChecklist,
        type CaptureOptions,
        useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";

const getState = () => useQuickStartWizardDataStore.getState();

describe("useQuickStartWizardDataStore", () => {
        beforeEach(() => {
                act(() => {
                        getState().reset();
                });
        });

        it("initializes with default wizard data", () => {
                const state = getState();

                expect(state.leadSource).toBe<LeadSourceOption>("csv-upload");
                expect(state.csvFileName).toBeNull();
                expect(state.targetMarkets).toEqual([]);
                expect(state.marketFilters).toEqual([]);
                expect(state.budgetRange).toEqual<[number, number]>([50000, 250000]);
                expect(state.timeline).toBe("immediate");
                expect(state.launchChecklist).toMatchObject<LaunchChecklist>({
                        sandboxValidated: false,
                        complianceReviewComplete: false,
                        notificationsEnabled: true,
                        goLiveApproved: false,
                });
                expect(state.captureOptions).toMatchObject<CaptureOptions>({
                        enableWidget: true,
                        enableExtension: false,
                        autoResponderEnabled: true,
                        forwardingNumber: "",
                        notifyEmail: "",
                });
        });

        it("updates lead intake details and market focus", () => {
                act(() => {
                        getState().setLeadSource("saved-search");
                        getState().setCsvDetails({ fileName: "leads.csv", recordEstimate: 1280 });
                        getState().addTargetMarket("94107");
                        getState().addTargetMarket("Austin, TX");
                        getState().toggleMarketFilter("High Equity");
                        getState().toggleMarketFilter("Pre-Foreclosure");
                        getState().setLeadNotes("Focus on high-intent sellers");
                        getState().setBudgetRange([75000, 300000]);
                        getState().setTimeline("next-30-days");
                        getState().setMarketNotes("Prioritize absentee owners");
                });

                const state = getState();
                expect(state.leadSource).toBe("saved-search");
                expect(state.csvFileName).toBe("leads.csv");
                expect(state.csvRecordEstimate).toBe(1280);
                expect(state.targetMarkets).toEqual(["94107", "Austin, TX"]);
                expect(state.marketFilters).toEqual(["High Equity", "Pre-Foreclosure"]);
                expect(state.leadNotes).toBe("Focus on high-intent sellers");
                expect(state.budgetRange).toEqual([75000, 300000]);
                expect(state.timeline).toBe("next-30-days");
                expect(state.marketNotes).toBe("Prioritize absentee owners");
        });

        it("manages launch checklist, capture options, and reset", () => {
                act(() => {
                        getState().toggleLaunchChecklist("sandboxValidated");
                        getState().toggleLaunchChecklist("goLiveApproved");
                        getState().setCaptureOption("enableExtension", true);
                        getState().setCaptureOption("forwardingNumber", "+15555550123");
                        getState().setCaptureOption("notifyEmail", "ops@dealscale.ai");
                        getState().setReviewNotes("Ready for QA sign-off");
                });

                let state = getState();
                expect(state.launchChecklist.sandboxValidated).toBe(true);
                expect(state.launchChecklist.goLiveApproved).toBe(true);
                expect(state.captureOptions.enableExtension).toBe(true);
                expect(state.captureOptions.forwardingNumber).toBe("+15555550123");
                expect(state.captureOptions.notifyEmail).toBe("ops@dealscale.ai");
                expect(state.reviewNotes).toBe("Ready for QA sign-off");

                act(() => {
                        state.reset();
                });

                state = getState();
                expect(state.leadSource).toBe("csv-upload");
                expect(state.targetMarkets).toHaveLength(0);
                expect(state.launchChecklist.goLiveApproved).toBe(false);
                expect(state.captureOptions.forwardingNumber).toBe("");
                expect(state.reviewNotes).toBe("");
        });
});
