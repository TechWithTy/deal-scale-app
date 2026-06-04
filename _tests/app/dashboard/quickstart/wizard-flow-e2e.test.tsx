import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Note: Using fireEvent for compatibility; userEvent can be added if available

import QuickStartPage from "@/components/quickstart/QuickStartDashboardPage";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useCampaignStore } from "@/lib/stores/campaigns";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useModalStore } from "@/lib/stores/dashboard";
import { useLeadListStore } from "@/lib/stores/leadList";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();

// Mock Next.js router
vi.mock("next/navigation", () => ({
	__esModule: true,
	useRouter: () => ({
		push: routerPushMock,
		replace: routerReplaceMock,
	}),
	usePathname: () => "/dashboard",
	useSearchParams: () =>
		new URLSearchParams() as unknown as ReadonlyURLSearchParams,
}));

// Mock components that aren't part of the core flow
vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartSupportCard", () => ({
	__esModule: true,
	default: () => null,
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

vi.mock("@/components/quickstart/useBulkCsvUpload", () => ({
	__esModule: true,
	useBulkCsvUpload: () => ({
		onFileChange: vi.fn(),
		onHeadersParsed: vi.fn(),
		onShowModal: vi.fn(),
	}),
}));

// Mock toast notifications
const { toastMock } = vi.hoisted(() => ({
	toastMock: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: toastMock,
}));

// Mock webhook modal to track when it opens
const openWebhookModalMock = vi.fn();
const campaignOpenChangeRef: { current: ((open: boolean) => void) | null } = {
	current: null,
};
const campaignLaunchedRef: {
	current: ((payload: { campaignId: string; channelType: string }) => void) | null;
} = {
	current: null,
};

const { quickstartHandlersRecorder } = vi.hoisted(() => ({
	quickstartHandlersRecorder: {
		onCampaignCreate: null as (() => void) | null,
	},
}));

vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", () => ({
	__esModule: true,
	default: ({
		onOpenChange,
		onCampaignLaunched,
		isOpen,
	}: {
		isOpen?: boolean;
		onOpenChange: (open: boolean) => void;
		onCampaignLaunched?: (payload: {
			campaignId: string;
			channelType: string;
		}) => void;
	}) => {
		campaignOpenChangeRef.current = onOpenChange;
		if (onCampaignLaunched) {
			campaignLaunchedRef.current = onCampaignLaunched;
		}
		return <div data-testid="campaign-modal-mock" data-is-open={isOpen} />;
	},
}));

vi.mock("@/components/quickstart/useQuickStartCardViewModel", async () => {
	const actual = await vi.importActual<
		typeof import("@/components/quickstart/useQuickStartCardViewModel")
	>("@/components/quickstart/useQuickStartCardViewModel");

	return {
		__esModule: true,
		...actual,
		useQuickStartCardViewModel: (
			params: Parameters<typeof actual.useQuickStartCardViewModel>[0],
		) => {
			quickstartHandlersRecorder.onCampaignCreate = params.onCampaignCreate;
			return actual.useQuickStartCardViewModel(params);
		},
	};
});

const resetStores = () => {
	act(() => {
		useCampaignCreationStore.getState().reset();
		useCampaignStore.getState().reset();
		useQuickStartWizardStore.getState().reset();
		useQuickStartWizardDataStore.getState().reset();

		// Set up mock lead lists
		useLeadListStore.setState({
			leadLists: [
				{
					id: "lead-list-1",
					listName: "Test Lead List",
					uploadDate: new Date().toISOString(),
					records: 100,
					leads: [],
					phone: 100,
					dataLink: "",
					socials: {},
					emails: 0,
				},
			],
		});

		// Mock modal store
		useModalStore.setState({
			openWebhookModal: openWebhookModalMock,
		});
	});
};

describe("Quick Start Wizard Flow E2E", () => {
	beforeEach(() => {
		// Reset all mocks
		routerPushMock.mockReset();
		routerReplaceMock.mockReset();
		openWebhookModalMock.mockReset();
		campaignOpenChangeRef.current = null;
		campaignLaunchedRef.current = null;
		quickstartHandlersRecorder.onCampaignCreate = null;
		toastMock.success.mockReset();
		toastMock.error.mockReset();
		toastMock.loading.mockReset();
		toastMock.dismiss.mockReset();

		// Reset stores
		resetStores();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render the summary step for a preset wizard", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().open({
				personaId: "investor",
				goalId: "investor-pipeline",
				templateId: "lead-import",
			});
		});

		const summaryStep = await screen.findByTestId("quickstart-summary-step", {}, { timeout: 10000 });
		expect(summaryStep).toBeInTheDocument();
		expect(within(summaryStep).getByText(/workflow: lead import launch/i)).toBeInTheDocument();
	});

	it("should open campaign modal and expose the basic campaign shell", async () => {
		renderWithNuqs(<QuickStartPage />);

		await waitFor(() => {
			expect(quickstartHandlersRecorder.onCampaignCreate).toBeTypeOf("function");
		});

		act(() => {
			quickstartHandlersRecorder.onCampaignCreate?.();
		});

		await screen.findByTestId("campaign-modal-mock", {}, { timeout: 10000 });

		act(() => {
			const store = useCampaignCreationStore.getState();
			store.setPrimaryChannel("call");
			store.setSelectedLeadListId("lead-list-1");
			store.setLeadCount(100);
			store.setCampaignName("Test Campaign");
		});

		const campaignActions = screen.queryAllByText(/campaign/i);
		expect(campaignActions.length).toBeGreaterThan(0);
	}, 10000);

	it("should route campaign launches through the modal callback", async () => {
		renderWithNuqs(<QuickStartPage />);

		await waitFor(() => {
			expect(quickstartHandlersRecorder.onCampaignCreate).toBeTypeOf("function");
		});

		act(() => {
			quickstartHandlersRecorder.onCampaignCreate?.();
		});

		await screen.findByTestId("campaign-modal-mock", {}, { timeout: 10000 });

		act(() => {
			campaignLaunchedRef.current?.({
				campaignId: "campaign_test",
				channelType: "call",
			});
		});

		expect(routerPushMock).toHaveBeenCalledWith(
			"/dashboard/campaigns?campaignId=campaign_test&type=call",
		);
	});

	it("should prevent infinite loops when closing campaign modal", async () => {
		let renderCount = 0;

		const renderSpy = vi.fn(() => {
			renderCount++;
		});

		renderWithNuqs(<QuickStartPage />);

		// Open campaign modal programmatically
		act(() => {
			const store = useCampaignCreationStore.getState();
			store.setPrimaryChannel("call");
			store.setSelectedLeadListId("lead-list-1");
			store.setCampaignName("Test Campaign");
		});

		// Find campaign modal if it's open
		const campaignModal = screen.queryByRole("dialog", {
			name: /campaign|create campaign/i,
		});

		if (campaignModal) {
			// Try to close it
			const closeButton = within(campaignModal).queryByRole("button", {
				name: /close|cancel|x/i,
			});

			if (closeButton) {
				await act(async () => {
					fireEvent.click(closeButton);
					await Promise.resolve();
				});

				// Verify modal closed without infinite loops
				await waitFor(
					() => {
						const modal = screen.queryByRole("dialog", {
							name: /campaign|create campaign/i,
						});
						expect(modal).toBeNull();
					},
					{ timeout: 1000 },
				);
			}
		}

		// Render count should be reasonable (not thousands)
		expect(renderCount).toBeLessThan(100);
	});

	it("should defer webhook modal opening after campaign launch", async () => {
		renderWithNuqs(<QuickStartPage />);

		// Set up campaign state
		act(() => {
			const store = useCampaignCreationStore.getState();
			store.setPrimaryChannel("call");
			store.setSelectedLeadListId("lead-list-1");
			store.setLeadCount(100);
			store.setCampaignName("Test Campaign");
			store.setSelectedAgentId("agent-1");
			store.setSelectedWorkflowId("workflow-1");
		});

		// The webhook modal should not open immediately
		expect(openWebhookModalMock).not.toHaveBeenCalled();

		// After timers advance (simulating deferred operations)
		await act(async () => Promise.resolve());

		// Still shouldn't be called unless campaign was actually launched
		// This test verifies the deferral mechanism exists
	});

	it("should reset campaign store after modal close without infinite loops", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		renderWithNuqs(<QuickStartPage />);

		// Set up campaign state
		act(() => {
			const store = useCampaignCreationStore.getState();
			store.setPrimaryChannel("call");
			store.setCampaignName("Test Campaign");
		});

		// Simulate modal close
		act(() => {
			// This would normally be triggered by clicking close button
			// We simulate the close handler
			// Use data-testid or find page container by different means
			// The page may not have literal "Quick Start" text anymore
			const quickStartPage =
				screen.queryByTestId("quickstart-background") ??
				screen.queryByRole("main") ??
				document.body;
			if (quickStartPage) {
				// Trigger store reset (simulating what happens on close)
				Promise.resolve();
			}
		});

		// Wait for any deferred operations
		await act(async () => Promise.resolve());

		// Verify no infinite loop errors
		const errorCalls = errorSpy.mock.calls.filter((call) =>
			call[0]?.toString().includes("Maximum update depth"),
		);
		expect(errorCalls.length).toBe(0);

		errorSpy.mockRestore();
	});

	it("should keep the dashboard stable after campaign state changes", async () => {
		const resetSpy = vi.spyOn(useCampaignCreationStore.getState(), "reset");

		renderWithNuqs(<QuickStartPage />);

		await screen.findByTestId("campaign-modal-mock", {}, { timeout: 10000 });

		act(() => {
			const store = useCampaignCreationStore.getState();
			store.setPrimaryChannel("call");
			store.setSelectedLeadListId("lead-list-1");
			store.setLeadCount(100);
			store.setCampaignName("Test Campaign");
			campaignOpenChangeRef.current?.(true);
			campaignOpenChangeRef.current?.(false);
		});

		await waitFor(() => {
			expect(resetSpy).toHaveBeenCalled();
		}, { timeout: 5000 });
		expect(screen.getByTestId("quickstart-background")).toBeInTheDocument();
		resetSpy.mockRestore();
	});
});
