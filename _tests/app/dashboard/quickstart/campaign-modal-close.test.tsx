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

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock(
	"@/components/reusables/modals/user/campaign/CampaignModalMain",
	() => ({
		__esModule: true,
		default: ({
			onOpenChange,
			onCampaignLaunched,
		}: {
			onOpenChange: (open: boolean) => void;
			onCampaignLaunched?: (payload: {
				campaignId: string;
				channelType: string;
			}) => void;
		}) => {
			onOpenChangeRef.current = onOpenChange;
			onCampaignLaunchedRef.current = onCampaignLaunched ?? null;
			return <div data-testid="campaign-modal-mock" />;
		},
	}),
);

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
		vi.useFakeTimers();
		act(() => {
			useCampaignCreationStore.getState().reset();
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("resets the campaign store once when the modal transitions from open to closed", () => {
		const resetSpy = vi.spyOn(useCampaignCreationStore.getState(), "reset");

		renderWithNuqs(<QuickStartPage />);

		expect(onOpenChangeRef.current).toBeTypeOf("function");

		act(() => {
			onOpenChangeRef.current?.(true);
		});

		act(() => {
			onOpenChangeRef.current?.(false);
		});

		act(() => {
			vi.runAllTimers();
		});

		expect(resetSpy).toHaveBeenCalledTimes(1);

		resetSpy.mockClear();

		act(() => {
			onOpenChangeRef.current?.(false);
		});

		act(() => {
			vi.runAllTimers();
		});

		expect(resetSpy).not.toHaveBeenCalled();

		resetSpy.mockRestore();
	});

	it("closes the modal and navigates when a campaign launches", () => {
		renderWithNuqs(<QuickStartPage />);

		expect(onCampaignLaunchedRef.current).toBeTypeOf("function");

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

	it("defers the campaign store reset until the close timers flush after launch", () => {
		renderWithNuqs(<QuickStartPage />);

		const resetSpy = vi.spyOn(useCampaignCreationStore.getState(), "reset");

		expect(onOpenChangeRef.current).toBeTypeOf("function");
		expect(onCampaignLaunchedRef.current).toBeTypeOf("function");

		act(() => {
			onOpenChangeRef.current?.(true);
		});

		resetSpy.mockClear();

		act(() => {
			onCampaignLaunchedRef.current?.({
				campaignId: "campaign_test",
				channelType: "call",
			});
		});

		expect(resetSpy).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(149);
		});

		expect(resetSpy).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(1);
		});

		expect(resetSpy).toHaveBeenCalledTimes(1);
		resetSpy.mockRestore();
	});
});
