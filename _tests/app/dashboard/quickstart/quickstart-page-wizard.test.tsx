import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { QUICK_START_DEFAULT_STEP } from "@/lib/stores/quickstartWizard";
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
        });

        it("opens the inline wizard with template presets when card actions are clicked", () => {
                render(<QuickStartPage />);

                const [importButton] = screen.getAllByRole("button", {
                        name: /import from any source/i,
                });

                act(() => {
                        fireEvent.click(importButton);
                });

                const wizard = screen.getAllByTestId("quickstart-wizard")[0];
                expect(wizard).toBeTruthy();
                expect(wizard.textContent).toMatch(/lead intake/i);

                const campaignState = useCampaignCreationStore.getState();
                expect(campaignState.campaignName).toContain("Lead Import");

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.activeStep).toBe("lead-intake");
                expect(wizardState.activePreset?.templateId).toBe("lead-import");
        });

        it("resets wizard state when closed", () => {
                render(<QuickStartPage />);

                const [importButton] = screen.getAllByRole("button", {
                        name: /import from any source/i,
                });

                act(() => {
                        fireEvent.click(importButton);
                });

                const [closeButton] = screen.getAllByRole("button", { name: /close wizard/i });

                act(() => {
                        fireEvent.click(closeButton);
                });

                const wizardState = useQuickStartWizardStore.getState();
                expect(wizardState.isOpen).toBe(false);
                expect(wizardState.activeStep).toBe(QUICK_START_DEFAULT_STEP);
        });
});
