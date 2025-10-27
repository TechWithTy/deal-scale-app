import React, { act } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { QUICK_START_DEFAULT_STEP } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import LeadSourceSelector from "@/components/quickstart/wizard/steps/lead/LeadSourceSelector";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const { downloadTemplateMock } = vi.hoisted(() => ({
        downloadTemplateMock: vi.fn(),
}));

vi.mock("next/link", () => ({
        __esModule: true,
        default: ({ children, ...props }: React.PropsWithChildren<{ href: string }>) => (
                <a {...props}>{children}</a>
        ),
}));

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
        __esModule: true,
        useRouter: () => ({
                push: pushMock,
        }),
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/SavedSearchModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/quickstart/useBulkCsvUpload", () => ({
        __esModule: true,
        useBulkCsvUpload: () => vi.fn(),
}));

vi.mock("@/components/quickstart/useQuickStartSavedSearches", () => ({
        __esModule: true,
        useQuickStartSavedSearches: () => ({
                savedSearches: [],
                deleteSavedSearch: vi.fn(),
                setSearchPriority: vi.fn(),
                handleCloseSavedSearches: vi.fn(),
                handleSelectSavedSearch: vi.fn(),
                handleStartNewSearch: vi.fn(),
                handleOpenSavedSearches: vi.fn(),
                savedSearchModalOpen: false,
        }),
}));

vi.mock("@/components/quickstart/utils/downloadLeadCsvTemplate", () => ({
        __esModule: true,
        downloadLeadCsvTemplate: downloadTemplateMock,
}));

describe("QuickStartPage wizard modal", () => {
        beforeEach(() => {
                act(() => {
                        useCampaignCreationStore.getState().reset();
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardDataStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().reset();
                        useUserProfileStore.getState().resetUserProfile();
                });
                pushMock.mockReset();
                window.localStorage.clear();
                act(() => {
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });
        });

        it("renders quickstart cards from configuration", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                expect(
                        await screen.findByRole("heading", { name: /quick start/i, level: 1 }),
                ).toBeDefined();
                const importButtons = await screen.findAllByRole("button", {
                        name: /import from any source/i,
                });
                expect(importButtons[0]).toBeDefined();
                const guidedButtons = await screen.findAllByRole("button", {
                        name: /launch guided setup/i,
                });
                expect(guidedButtons[0]).toBeDefined();
        });

        it("opens the wizard on the persona step when the guided card is selected", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                const [launchWizardButton] = await screen.findAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);
                expect(wizard).toBeTruthy();
                expect(wizardQueries.getByTestId("quickstart-persona-step")).toBeTruthy();
                expect(wizard.textContent).toMatch(/step 1 of 3/i);

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.activeStep).toBe("persona");
        });

        it("applies presets and generates a summary plan when launched from a card", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                const [launchWizardButton] = await screen.findAllByRole("button", {
                        name: /import from any source/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);
                expect(wizardQueries.getByTestId("quickstart-summary-step")).toBeTruthy();
                expect(wizard.textContent).toMatch(/launch a seller pipeline/i);
                expect(wizard.textContent).toMatch(/import & manage data/i);

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.activeStep).toBe("summary");

                const dataState = useQuickStartWizardDataStore.getState();
                expect(dataState.personaId).toBe("investor");
                expect(dataState.goalId).toBe("investor-pipeline");

                const campaignState = useCampaignCreationStore.getState();
                expect(campaignState.campaignName).toContain("Lead Import");
        });

        it("lets users choose persona and goal before showing a summary", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                const [launchWizardButton] = await screen.findAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                const investorOption = wizardQueries.getByTestId(
                        "quickstart-persona-option-investor",
                );
                act(() => {
                        fireEvent.click(investorOption);
                });

                expect(wizardQueries.getByTestId("quickstart-goal-step")).toBeTruthy();

                const pipelineOption = wizardQueries.getByTestId(
                        "quickstart-goal-option-investor-pipeline",
                );
                act(() => {
                        fireEvent.click(pipelineOption);
                });

                expect(wizardQueries.getByTestId("quickstart-summary-step")).toBeTruthy();
                expect(wizard.textContent).toMatch(/pipe hot responses/i);

                const dataState = useQuickStartWizardDataStore.getState();
                expect(dataState.personaId).toBe("investor");
                expect(dataState.goalId).toBe("investor-pipeline");
        });

        it("supports lender personas with an automation-focused goal", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                const [launchWizardButton] = await screen.findAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                const lenderOption = wizardQueries.getByTestId(
                        "quickstart-persona-option-lender",
                );
                act(() => {
                        fireEvent.click(lenderOption);
                });

                const goalStep = wizardQueries.getByTestId("quickstart-goal-step");
                expect(goalStep).toBeTruthy();
                within(goalStep).getByTestId("quickstart-goal-option-lender-fund-fast");

                act(() => {
                        fireEvent.click(
                                within(goalStep).getByTestId(
                                        "quickstart-goal-option-lender-fund-fast",
                                ),
                        );
                });

                const summary = wizardQueries.getByTestId("quickstart-summary-step");
                expect(summary.textContent).toMatch(/automation routing keeps borrowers moving/i);
                expect(
                        within(summary).getByTestId("quickstart-summary-template"),
                ).toBeDefined();

                const dataState = useQuickStartWizardDataStore.getState();
                expect(dataState.personaId).toBe("lender");
                expect(dataState.goalId).toBe("lender-fund-fast");
        });

        it("auto-launches the wizard for first-time visitors", async () => {
                act(() => {
                        useQuickStartWizardExperienceStore.getState().reset();
                });

                render(<QuickStartPage />);

                await waitFor(() => {
                        expect(useQuickStartWizardStore.getState().isOpen).toBe(true);
                });
        });

        it("persists dismissal so the wizard does not relaunch", async () => {
                act(() => {
                        useQuickStartWizardExperienceStore.getState().reset();
                });

                const { unmount } = render(<QuickStartPage />);

                const closeButton = screen.getByRole("button", { name: /close wizard/i });

                act(() => {
                        fireEvent.click(closeButton);
                });

                await waitFor(() => {
                        expect(useQuickStartWizardExperienceStore.getState().hasSeenWizard).toBe(true);
                });

                unmount();

                render(<QuickStartPage />);

                await waitFor(() => {
                        expect(useQuickStartWizardStore.getState().isOpen).toBe(false);
                });
        });

        it("resets wizard state when closed", async () => {
                render(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                await waitFor(() => {
                        expect(
                                screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                        ).toBeNull();
                });

                const [importButton] = await screen.findAllByRole("button", {
                        name: /import from any source/i,
                });

                act(() => {
                        fireEvent.click(importButton);
                });

                let wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                let wizardQueries = within(wizard);
                const closeWizardButton = wizardQueries.getByRole("button", { name: /close wizard/i });

                act(() => {
                        fireEvent.click(closeWizardButton);
                });

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.isOpen).toBe(false);
                expect(wizardState.activeStep).toBe(QUICK_START_DEFAULT_STEP);

                const wizardDataState = useQuickStartWizardDataStore.getState();
                expect(wizardDataState.personaId).toBeNull();
                expect(wizardDataState.goalId).toBeNull();

                act(() => {
                        fireEvent.click(importButton);
                });

                wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                wizardQueries = within(wizard);
                const dialogCloseButton = wizardQueries.getByRole("button", { name: /^close$/i });

                act(() => {
                        fireEvent.click(dialogCloseButton);
                });

                expect(
                        screen.queryByRole("dialog", { name: /quickstart wizard/i }),
                ).toBeNull();
        });

        it("surfaces the sample CSV download for lead imports", () => {
                downloadTemplateMock.mockReset();

                act(() => {
                        useQuickStartWizardDataStore.setState(
                                () =>
                                        ({
                                                leadSource: "csv-upload",
                                                csvFileName: null,
                                                csvRecordEstimate: null,
                                                selectedIntegrations: [],
                                                savedSearchName: "",
                                                personaId: "investor",
                                                goalId: "investor-pipeline",
                                        }) as Partial<ReturnType<typeof useQuickStartWizardDataStore.getState>>,
                        );
                });

                render(<LeadSourceSelector />);

                const button = screen.getByRole("button", { name: /download sample csv/i });
                expect(button).toBeDefined();

                fireEvent.click(button);

                expect(downloadTemplateMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                        }),
                );

                act(() => {
                        useQuickStartWizardDataStore.getState().reset();
                });
        });

});
