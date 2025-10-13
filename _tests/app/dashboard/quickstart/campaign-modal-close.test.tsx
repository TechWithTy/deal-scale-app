import { render } from "@testing-library/react";
import React from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const onOpenChangeRef: {
	current: ((open: boolean) => void) | null;
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
		default: ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
			onOpenChangeRef.current = onOpenChange;
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

		render(<QuickStartPage />);

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
});
