import React, { act } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { QUICK_START_DEFAULT_STEP } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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

describe("QuickStartPage wizard modal", () => {
        beforeEach(() => {
                act(() => {
                        useCampaignCreationStore.getState().reset();
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardDataStore.getState().reset();
                });
                pushMock.mockReset();
        });

        it("renders quickstart cards from configuration", () => {
                render(<QuickStartPage />);

                expect(
                        screen.getByRole("heading", { name: /quick start/i, level: 1 }),
                ).toBeDefined();
                expect(
                        screen.getAllByRole("button", { name: /import from any source/i })[0],
                ).toBeDefined();
                expect(
                        screen.getAllByRole("button", { name: /launch guided setup/i })[0],
                ).toBeDefined();
        });

        it("opens the wizard on the persona step when the guided card is selected", () => {
                render(<QuickStartPage />);

                const [launchWizardButton] = screen.getAllByRole("button", {
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

        it("applies presets and generates a summary plan when launched from a card", () => {
                render(<QuickStartPage />);

                const [launchWizardButton] = screen.getAllByRole("button", {
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

        it("lets users choose persona and goal before showing a summary", () => {
                render(<QuickStartPage />);

                const [launchWizardButton] = screen.getAllByRole("button", {
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

        it("resets wizard state when closed", () => {
                render(<QuickStartPage />);

                const [importButton] = screen.getAllByRole("button", {
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

});
