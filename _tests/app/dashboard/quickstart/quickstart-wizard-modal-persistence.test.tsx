import React, { act } from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/components/quickstart/QuickStartDashboardPage";
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

	it("should complete the wizard once and keep the flow stable after the pending action runs", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Open the wizard via the explicit guided setup button so the test is deterministic.
		const [guidedSetupButton] = await screen.findAllByRole("button", {
			name: /guided setup/i,
		});

		act(() => {
			fireEvent.click(guidedSetupButton);
		});

		// Wait for wizard to appear
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 5000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		act(() => {
			fireEvent.click(
				wizardQueries.getByTestId("quickstart-persona-option-loan_officer"),
			);
		});

		await waitFor(() => {
			expect(
				wizardQueries.queryByTestId("quickstart-goal-option-lender-fund-fast"),
			).toBeInTheDocument();
		}, { timeout: 5000 });

		act(() => {
			fireEvent.click(
				wizardQueries.getByTestId("quickstart-goal-option-lender-fund-fast"),
			);
		});

		await waitFor(() => {
			expect(
				wizardQueries.getByRole("button", { name: /close & start plan/i }),
			).toBeInTheDocument();
		}, { timeout: 5000 });

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

		// Wait for any async operations to complete (session sync, etc.)
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
		expect(screen.queryByTestId("campaign-modal")).toBeNull();
		expect(modalOpenState).toBe(false);
		expect(modalOpenChangeCalls.every((call) => call === false)).toBe(true);
	}, { timeout: 15000 });
});
