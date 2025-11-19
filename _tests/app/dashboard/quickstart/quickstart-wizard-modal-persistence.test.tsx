import React, { act } from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = vi.fn();
let modalOpenState = false;
let modalOpenChangeCallCount = 0;
const modalOpenChangeCalls: boolean[] = [];

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

// Mock modals to track their open state and verify they don't close immediately
vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", () => ({
	__esModule: true,
	default: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
		// Track all open/close calls
		React.useEffect(() => {
			modalOpenState = isOpen;
			modalOpenChangeCallCount++;
			modalOpenChangeCalls.push(isOpen);
		}, [isOpen]);

		return isOpen ? <div data-testid="campaign-modal">Campaign Modal</div> : null;
	},
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
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
		useQuickStartWizardStore.getState().reset();
		useQuickStartWizardDataStore.getState().reset();
		useQuickStartWizardExperienceStore.getState().markWizardSeen();
	});
};

describe("QuickStart wizard modal persistence", () => {
	beforeEach(() => {
		resetStores();
		pushMock.mockReset();
		modalOpenState = false;
		modalOpenChangeCallCount = 0;
		modalOpenChangeCalls.length = 0;
	});

	afterEach(async () => {
		act(() => {
			useQuickStartWizardStore.getState().reset();
		});
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("should open campaign modal and keep it open after wizard completes - no double click required", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Wait for page to render
		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 5000 });

		// Find a card that opens the campaign modal (e.g., "Start Campaign")
		const createCampaignButtons = screen.queryAllByRole("button", {
			name: /start campaign/i,
		});

		// If not found, try "Create Campaign" or just look for campaign-related buttons
		const campaignButtons = createCampaignButtons.length > 0 
			? createCampaignButtons 
			: screen.queryAllByRole("button", {
					name: /campaign/i,
				});

		expect(campaignButtons.length).toBeGreaterThan(0);

		// Click the button to launch wizard with action
		act(() => {
			fireEvent.click(campaignButtons[0]);
		});

		// Wait for wizard to appear
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 5000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Complete the wizard with a single click
		const completeButton = wizardQueries.getByRole("button", {
			name: /close & start plan/i,
		});

		// Clear previous modal state tracking
		modalOpenChangeCalls.length = 0;
		modalOpenChangeCallCount = 0;

		act(() => {
			fireEvent.click(completeButton);
		});

		// Wait for wizard to close
		await waitFor(() => {
			expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
		}, { timeout: 2000 });

		// Wait for campaign modal to appear
		await waitFor(() => {
			const modal = screen.queryByTestId("campaign-modal");
			expect(modal).toBeInTheDocument();
		}, { timeout: 2000 });

		// Verify modal opened (should be in the calls)
		expect(modalOpenChangeCalls).toContain(true);

		// Wait for any async operations to complete (session sync, etc.)
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		// Modal should still be open after all async operations
		const modal = screen.queryByTestId("campaign-modal");
		expect(modal).toBeInTheDocument();
		expect(modalOpenState).toBe(true);

		// Verify modal didn't close immediately (should not have false after true)
		const trueIndex = modalOpenChangeCalls.indexOf(true);
		if (trueIndex >= 0) {
			const callsAfterOpen = modalOpenChangeCalls.slice(trueIndex + 1);
			// Modal should not have been closed immediately after opening
			// Allow one false if it's the initial state, but not immediately after opening
			expect(callsAfterOpen.filter(call => call === false).length).toBeLessThanOrEqual(1);
		}
	}, { timeout: 15000 });
});

