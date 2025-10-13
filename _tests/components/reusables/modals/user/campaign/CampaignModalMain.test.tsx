import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

void React;

vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogContent: ({
		children,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
	TooltipProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock(
	"@/components/reusables/modals/user/campaign/steps/FinalizeCampaignStep",
	() => ({
		__esModule: true,
		default: ({ onLaunch }: { onLaunch: () => void }) => (
			<button type="button" onClick={onLaunch}>
				Launch Campaign
			</button>
		),
	}),
);

vi.mock(
	"@/components/reusables/modals/user/campaign/CampaignSettingsDebug",
	() => ({
		__esModule: true,
		default: () => null,
	}),
);

describe("CampaignModalMain", () => {
	beforeEach(() => {
		act(() => {
			const store = useCampaignCreationStore.getState();
			store.reset();
			store.setPrimaryChannel("call");
			store.setCampaignName("Ready Campaign");
			store.setSelectedAgentId("1");
			store.setSelectedWorkflowId("wf1");
			store.setSelectedSalesScriptId("ss1");
		});
	});

	it("closes the modal and notifies listeners after launching", () => {
		const handleOpenChange = vi.fn();
		const handleCampaignLaunched = vi.fn();

		render(
			<CampaignModalMain
				isOpen
				onOpenChange={handleOpenChange}
				initialStep={3}
				onCampaignLaunched={handleCampaignLaunched}
			/>,
		);

		const launchButton = screen.getByRole("button", {
			name: /launch campaign/i,
		});

		fireEvent.click(launchButton);

		expect(handleOpenChange).toHaveBeenCalledWith(false);
		expect(handleCampaignLaunched).toHaveBeenCalledTimes(1);
		const payload = handleCampaignLaunched.mock.calls[0]?.[0];
		expect(payload?.campaignId).toMatch(/^campaign_\d+$/);
		expect(payload?.channelType).toBe("call");
	});
});
