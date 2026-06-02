import React, { act } from "react";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
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

        afterEach(() => {
                // Close any open wizards
                act(() => {
                        useQuickStartWizardStore.getState().reset();
                });
                cleanup();
        });

        it("shows the summary template for a preset wizard", async () => {
                renderWithNuqs(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().open({
                                personaId: "investor",
                                goalId: "investor-pipeline",
                                templateId: "lead-import",
                        });
                });

                const summaryTemplate = await screen.findByTestId(
                        "quickstart-summary-template",
                        {},
                        { timeout: 10000 },
                );

                expect(summaryTemplate).toHaveTextContent(/workflow: lead import launch/i);
                expect(summaryTemplate).toHaveTextContent(/primary channel: text/i);
        });

	it("defers wizard card actions until the plan is completed", async () => {
		renderWithNuqs(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardExperienceStore.getState().markWizardSeen();
                });

                // Wait for the current dashboard shell to render.
                await screen.findByTestId("quickstart-background", {}, { timeout: 5000 });

                const [downloadExtensionButton] = await screen.findAllByRole("button", {
                        name: /download extension/i,
                }, { timeout: 5000 });

		act(() => {
			fireEvent.click(downloadExtensionButton);
		});

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/dashboard/extensions");
		}, { timeout: 5000 });

		expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
	});

	it("cancels pending wizard actions when the wizard is closed", async () => {
                renderWithNuqs(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().launchWithAction(undefined, () => {
                                pushMock("/dashboard/extensions");
                        });
                });

                expect(useQuickStartWizardStore.getState().isOpen).toBe(true);

                act(() => {
                        useQuickStartWizardStore.getState().cancel();
                });

                await waitFor(() => {
                        expect(pushMock).not.toHaveBeenCalled();
                }, { timeout: 5000 });
                expect(pushMock).not.toHaveBeenCalled();
                expect(useQuickStartWizardStore.getState().isOpen).toBe(false);
        });

        it("applies the selected template before completing the guided flow", async () => {
                renderWithNuqs(<QuickStartPage />);

                act(() => {
                        useQuickStartWizardStore.getState().launchWithAction(
                                {
                                        personaId: "investor",
                                        goalId: "investor-pipeline",
                                        templateId: "lead-import",
                                },
                                () => {
                                        pushMock("/dashboard/extensions");
                                },
                        );
                });

                const summaryTemplate = await screen.findByTestId(
                        "quickstart-summary-template",
                        {},
                        { timeout: 10000 },
                );

                expect(summaryTemplate).toHaveTextContent(/workflow: lead import launch/i);

                act(() => {
                        useQuickStartWizardStore.getState().complete();
                });

                await waitFor(() => {
                        expect(pushMock).toHaveBeenCalledWith("/dashboard/extensions");
                }, { timeout: 5000 });
                expect(useQuickStartWizardStore.getState().isOpen).toBe(false);
                expect(pushMock).toHaveBeenCalledWith("/dashboard/extensions");
                expect(screen.getByTestId("quickstart-background")).toBeInTheDocument();
        });
});
