import React, { act } from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = vi.fn();

vi.mock("next/link", () => ({
        __esModule: true,
        default: ({ children, ...props }: React.PropsWithChildren<{ href: string }>) => (
                <a {...props}>{children}</a>
        ),
}));

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

const resetStores = () => {
        act(() => {
                useCampaignCreationStore.getState().reset();
                useQuickStartWizardStore.getState().reset();
                useQuickStartWizardDataStore.getState().reset();
        });
};

describe("QuickStart wizard deferred actions", () => {
        beforeEach(() => {
                resetStores();
                pushMock.mockReset();
        });

        it("labels the summary CTA as 'Close wizard' when no follow-up action is queued", () => {
                renderWithNuqs(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().open({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                                templateId: "lead-import",
                        });
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                const closeButtons = wizardQueries.getAllByRole("button", {
                        name: /close wizard/i,
                });

                expect(closeButtons).toHaveLength(2);
                const summaryButton = closeButtons[1];

                expect(summaryButton.textContent ?? "").toMatch(/close wizard/i);
        });

        it("defers wizard card actions until the plan is completed", () => {
                renderWithNuqs(<QuickStartPage />);

                const [downloadExtensionButton] = screen.getAllByRole("button", {
                        name: /download extension/i,
                });

                act(() => {
                        fireEvent.click(downloadExtensionButton);
                });

                expect(pushMock).not.toHaveBeenCalled();

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                const completeButton = wizardQueries.getByRole("button", {
                        name: /close & start plan/i,
                });

                act(() => {
                        fireEvent.click(completeButton);
                });

                expect(pushMock).toHaveBeenCalledWith("/dashboard/extensions");
        });

        it("cancels pending wizard actions when the wizard is closed", () => {
                renderWithNuqs(<QuickStartPage />);

                const [downloadExtensionButton] = screen.getAllByRole("button", {
                        name: /download extension/i,
                });

                act(() => {
                        fireEvent.click(downloadExtensionButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                const closeButton = wizardQueries.getByRole("button", { name: /close wizard/i });

                act(() => {
                        fireEvent.click(closeButton);
                });

                expect(pushMock).not.toHaveBeenCalled();
                expect(screen.queryByRole("dialog", { name: /quickstart wizard/i })).toBeNull();
        });

        it("relaunches the first guided plan step when the wizard is completed", async () => {
                const fileClickSpy = vi
                        .spyOn(HTMLInputElement.prototype, "click")
                        .mockImplementation(() => {});

                renderWithNuqs(<QuickStartPage />);

                const [launchGuidedButton] = screen.getAllByRole("button", {
                        name: /launch guided setup/i,
                });

                act(() => {
                        fireEvent.click(launchGuidedButton);
                });

                const wizard = screen.getByRole("dialog", { name: /quickstart wizard/i });
                const wizardQueries = within(wizard);

                act(() => {
                        fireEvent.click(
                                wizardQueries.getByTestId(
                                        "quickstart-persona-option-lender",
                                ),
                        );
                });

                act(() => {
                        fireEvent.click(
                                wizardQueries.getByTestId(
                                        "quickstart-goal-option-lender-fund-fast",
                                ),
                        );
                });

                const completeButton = wizardQueries.getByRole("button", {
                        name: /close & start plan/i,
                });

                act(() => {
                        fireEvent.click(completeButton);
                });

                await waitFor(() => {
                        expect(screen.queryByRole("dialog", { name: /quickstart wizard/i })).toBeNull();
                });

                expect(fileClickSpy).toHaveBeenCalled();
                fileClickSpy.mockRestore();
        });
});
