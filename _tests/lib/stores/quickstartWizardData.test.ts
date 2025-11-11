import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";

const getState = () => useQuickStartWizardDataStore.getState();

describe("useQuickStartWizardDataStore", () => {
        beforeEach(() => {
                act(() => {
                        useQuickStartWizardExperienceStore.getState().reset();
                        useUserProfileStore.getState().resetUserProfile();
                        getState().reset();
                });
        });

        it("initializes with no persona or goal selected", () => {
                const state = getState();

                expect(state.personaId).toBeNull();
                expect(state.goalId).toBeNull();
        });

        it("prefills persona and goal from user profile defaults", () => {
                act(() => {
                        useUserProfileStore.setState({
                                userProfile: {
                                        id: "user-123",
                                        subscription: {} as never,
                                        firstName: "Test",
                                        lastName: "User",
                                        email: "test@example.com",
                                        personalNum: "0000000000",
                                        country: "USA",
                                        state: "CA",
                                        city: "Los Angeles",
                                        updatedAt: new Date(),
                                        createdAt: new Date(),
                                        connectedAccounts: {},
                                        leadPreferences: {
                                                preferredLocation: [],
                                                industry: "",
                                                minLeadQuality: 0,
                                                maxBudget: 0,
                                        },
                                        savedSearches: [],
                                        notificationPreferences: {
                                                emailNotifications: false,
                                                smsNotifications: false,
                                                notifyForNewLeads: false,
                                                notifyForCampaignUpdates: false,
                                        },
                                        integrations: [],
                                        companyInfo: {} as never,
                                        aIKnowledgebase: {} as never,
                                        billingHistory: [],
                                        paymentDetails: {} as never,
                                        twoFactorAuth: {
                                                methods: { sms: false, email: false, authenticatorApp: false },
                                        },
                                        teamMembers: [],
                                        quickStartDefaults: {
                                                personaId: "loan_officer",
                                                goalId: "lender-fund-fast",
                                        },
                                } as never,
                        });
                        getState().reset();
                });

                const state = getState();

                expect(state.personaId).toBe("loan_officer");
                expect(state.goalId).toBe("lender-fund-fast");
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
