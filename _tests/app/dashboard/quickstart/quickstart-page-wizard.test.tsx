import React, { act } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { QUICK_START_DEFAULT_STEP } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";

(globalThis as Record<string, unknown>).React = React;

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
                savedSearchModalOpen: false,
        }),
}));

describe("QuickStartPage inline wizard", () => {
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

        it("opens the inline wizard with template presets when wizard card is clicked", () => {
                render(<QuickStartPage />);

                const [launchWizardButton] = screen.getAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getAllByTestId("quickstart-wizard")[0];
                const wizardQueries = within(wizard);
                expect(wizard).toBeTruthy();
                expect(wizard.textContent).toMatch(/lead intake/i);

                const campaignState = useCampaignCreationStore.getState();
                expect(campaignState.campaignName).toContain("Lead Import");

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.activeStep).toBe("lead-intake");
                expect(wizardState.activePreset?.templateId).toBe("lead-import");

                expect(
                        wizardQueries.getAllByTestId("lead-intake-step")[0].textContent,
                ).toMatch(/upload csv/i);
        });

        it("resets wizard state when closed", () => {
                render(<QuickStartPage />);

                const [importButton] = screen.getAllByRole("button", {
                        name: /import from any source/i,
                });

                act(() => {
                        fireEvent.click(importButton);
                });

                const wizard = screen.getAllByTestId("quickstart-wizard")[0];
                const wizardQueries = within(wizard);
                const [closeButton] = wizardQueries.getAllByRole("button", { name: /close wizard/i });

                act(() => {
                        fireEvent.click(closeButton);
                });

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.isOpen).toBe(false);
                expect(wizardState.activeStep).toBe(QUICK_START_DEFAULT_STEP);

                const wizardDataState = useQuickStartWizardDataStore.getState();
                expect(wizardDataState.targetMarkets).toHaveLength(0);
        });

        it("persists lead intake data when navigating between steps", () => {
                render(<QuickStartPage />);

                const [launchWizardButton] = screen.getAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchWizardButton);
                });

                const wizard = screen.getAllByTestId("quickstart-wizard")[0];
                const wizardQueries = within(wizard);
                const leadIntakeStep = wizardQueries.getAllByTestId("lead-intake-step")[0];
                const leadIntakeQueries = within(leadIntakeStep);
                const [marketInput] = leadIntakeQueries.getAllByTestId("lead-intake-market-input");
                act(() => {
                        fireEvent.change(marketInput, { target: { value: "94107" } });
                        fireEvent.keyDown(marketInput, { key: "Enter" });
                });

                expect(leadIntakeQueries.getAllByText("94107")[0]).toBeDefined();

                const [basicsStepButton] = wizardQueries.getAllByRole("button", {
                        name: /campaign basics/i,
                });

                act(() => {
                        fireEvent.click(basicsStepButton);
                });

                expect(wizardQueries.getAllByTestId("campaign-basics-step")[0]).toBeTruthy();

                const [leadIntakeStepButton] = wizardQueries.getAllByRole("button", {
                        name: /lead intake/i,
                });

                act(() => {
                        fireEvent.click(leadIntakeStepButton);
                });

                const leadIntakeStepReturn = wizardQueries.getAllByTestId("lead-intake-step")[0];
                const leadIntakeReturnQueries = within(leadIntakeStepReturn);
                expect(leadIntakeStepReturn).toBeTruthy();
                expect(leadIntakeReturnQueries.getAllByText("94107")[0]).toBeDefined();
        });
});
