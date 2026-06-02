import { act } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const onOpenChangeRef: {
	current: ((open: boolean) => void) | null;
} = { current: null };

const onCampaignLaunchedRef: {
	current:
		| ((payload: { campaignId: string; channelType: string }) => void)
		| null;
} = { current: null };

const routerPushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPushMock,
	}),
}));

vi.mock("@/components/quickstart/QuickStartHeader", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartBadgeList", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartHelp", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartActionsGrid", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartInputCard", () => ({
	__esModule: true,
	QuickStartInputCard: () => <div data-testid="quickstart-input-card-mock" />,
	default: () => <div data-testid="quickstart-input-card-mock" />,
}));

vi.mock("@/components/magicui/typing-animation", () => ({
	__esModule: true,
	TypingAnimation: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="typing-animation-mock">{children}</span>
	),
	default: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="typing-animation-mock">{children}</span>
	),
}));

vi.mock("@/components/quickstart/QuickStartLegacyModals", () => ({
	__esModule: true,
	default: ({
		onCampaignModalToggle,
		onCampaignLaunched,
		showCampaignModal,
	}: {
		onCampaignModalToggle: (open: boolean) => void;
		onCampaignLaunched?: (payload: {
			campaignId: string;
			channelType: string;
		}) => void;
		showCampaignModal?: boolean;
	}) => {
		onOpenChangeRef.current = onCampaignModalToggle;
		if (onCampaignLaunched) {
			onCampaignLaunchedRef.current = onCampaignLaunched;
		}
		return (
			<div
				data-testid="campaign-modal-mock"
				data-is-open={showCampaignModal ? "true" : "false"}
			/>
		);
	},
}));

vi.mock("@/components/ui/background-beams-with-collision", () => ({
	__esModule: true,
	BackgroundBeamsWithCollision: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="background-beams-mock">{children}</div>
	),
}));

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/useQuickStartCards", () => ({
	useQuickStartCards: () => [],
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
	__esModule: true,
	default: () => null,
}));

describe("QuickStartPage campaign modal reset timing", () => {
	beforeEach(() => {
		onOpenChangeRef.current = null;
		onCampaignLaunchedRef.current = null;
		routerPushMock.mockReset();
		act(() => {
			useCampaignCreationStore.getState().reset();
		});
	});

	it("captures the modal callbacks from the dashboard shell", async () => {
		renderWithNuqs(<QuickStartPage />);

		await act(async () => {
			await Promise.resolve();
		});

		expect(onOpenChangeRef.current).toBeTypeOf("function");
		expect(onCampaignLaunchedRef.current).toBeTypeOf("function");
	});

	it("routes when a campaign launch payload is submitted", async () => {
		renderWithNuqs(<QuickStartPage />);

		await act(async () => {
			await Promise.resolve();
		});

		act(() => {
			onCampaignLaunchedRef.current?.({
				campaignId: "campaign_test",
				channelType: "call",
			});
		});

		expect(routerPushMock).toHaveBeenCalledTimes(1);
		expect(routerPushMock).toHaveBeenCalledWith(
			"/dashboard/campaigns?campaignId=campaign_test&type=call",
		);
	});

	it("accepts open/close toggles without duplicating the campaign reset", async () => {
		const resetSpy = vi.spyOn(useCampaignCreationStore.getState(), "reset");

		renderWithNuqs(<QuickStartPage />);

		await act(async () => {
			await Promise.resolve();
		});

		act(() => {
			onOpenChangeRef.current?.(true);
			onOpenChangeRef.current?.(false);
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		expect(resetSpy).toHaveBeenCalledTimes(1);
		resetSpy.mockRestore();
	});
});
