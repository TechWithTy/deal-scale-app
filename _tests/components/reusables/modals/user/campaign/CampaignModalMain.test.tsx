// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

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
			<div>
				<h2>Finalize your campaign</h2>
				<label htmlFor="campaignName">Campaign Name</label>
				<input id="campaignName" defaultValue="Ready Campaign" />

				<label htmlFor="selectedAgentId">Assign AI Agent</label>
				<select id="selectedAgentId" defaultValue="1">
					<option value="1">John Doe</option>
				</select>

				<label htmlFor="selectedWorkflowId">Workflow</label>
				<select id="selectedWorkflowId" defaultValue="wf1">
					<option value="wf1">Default: Nurture 7-day</option>
				</select>

				<label htmlFor="selectedSalesScriptId">Sales Script</label>
				<select id="selectedSalesScriptId" defaultValue="ss1">
					<option value="ss1">General Sales Script</option>
				</select>

				<label htmlFor="campaignGoal">Campaign Goal</label>
				<textarea
					id="campaignGoal"
					placeholder="Enter your campaign goal (1 sentence min, 1-2 paragraphs max)"
					defaultValue="Generate at least 10 qualified leads for our sales team."
				/>

				<button type="button" onClick={onLaunch}>
					Launch Campaign
				</button>
			</div>
		),
	}),
);

vi.mock("@/components/ui/form", () => ({
	FormProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	FormField: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormItem: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	FormLabel: ({
		children,
		htmlFor,
		...props
	}: {
		children: React.ReactNode;
		htmlFor?: string;
		[key: string]: unknown;
	}) => (
		<label htmlFor={htmlFor} {...props}>
			{children}
		</label>
	),
	FormControl: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormMessage: () => null,
}));

vi.mock("@/components/ui/input", () => ({
	Input: ({ ...props }) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
	Textarea: ({ ...props }) => <textarea {...props} />,
}));

vi.mock("@/components/ui/select", () => ({
	Select: ({
		children,
		onValueChange,
	}: {
		children: React.ReactNode;
		onValueChange?: (value: string) => void;
	}) => <>{children}</>,
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	SelectItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	SelectValue: ({ placeholder }: { placeholder?: string }) => (
		<>{placeholder}</>
	),
}));
vi.mock("@radix-ui/react-icons", () => ({
	InfoCircledIcon: () => <div>Info</div>,
}));

vi.mock(
	"@/components/reusables/modals/user/campaign/CampaignSettingsDebug",
	() => ({
		__esModule: true,
		default: () => null,
	}),
);

describe("CampaignModalMain", () => {
        beforeEach(() => {
                pushMock.mockReset();
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

        it("closes the modal before notifying launch listeners", () => {
                const callOrder: string[] = [];
                const handleOpenChange = vi.fn((open: boolean) => {
                        if (!open) {
                                callOrder.push("close");
                        }
                });
                const handleCampaignLaunched = vi.fn(() => {
                        callOrder.push("launched");
                });

                pushMock.mockImplementation(() => {
                        callOrder.push("navigate");
                });

                render(
                        <CampaignModalMain
                                isOpen
                                onOpenChange={handleOpenChange}
                                initialStep={3}
                                onCampaignLaunched={handleCampaignLaunched}
                        />,
                );

                const launchButtons = screen.getAllByRole("button", {
                        name: /launch campaign/i,
                });
                const launchButton = launchButtons[launchButtons.length - 1];

                fireEvent.click(launchButton);

                expect(handleOpenChange).toHaveBeenCalledWith(false);
                expect(handleCampaignLaunched).toHaveBeenCalledTimes(1);
                expect(callOrder).toEqual(["close", "launched"]);
                expect(pushMock).not.toHaveBeenCalled();
                const payload = handleCampaignLaunched.mock.calls[0]?.[0];
                expect(payload?.campaignId).toMatch(/^campaign_\d+$/);
                expect(payload?.channelType).toBe("call");
        });

        it("navigates with campaign query parameters when no listeners are provided", () => {
                const callOrder: string[] = [];
                const handleOpenChange = vi.fn((open: boolean) => {
                        if (!open) {
                                callOrder.push("close");
                        }
                });

                pushMock.mockImplementation((destination: string) => {
                        callOrder.push("navigate");
                        return destination;
                });

                render(
                        <CampaignModalMain
                                isOpen
                                onOpenChange={handleOpenChange}
                                initialStep={3}
                        />,
                );

                const goalField = screen.getByLabelText(/campaign goal/i);
                fireEvent.change(goalField, {
                        target: {
                                value: "Generate at least 10 qualified leads for our sales team.",
                        },
                });

                const launchButtons = screen.getAllByRole("button", {
                        name: /launch campaign/i,
                });
                const launchButton = launchButtons[launchButtons.length - 1];
                fireEvent.click(launchButton);

                expect(callOrder).toEqual(["close", "navigate"]);
                expect(pushMock).toHaveBeenCalledTimes(1);
                const destination = pushMock.mock.calls[0]?.[0];
                expect(destination).toContain("/dashboard/campaigns?");
                expect(destination).toContain("type=call");
                expect(destination).toMatch(/campaignId=campaign_\d+/);
        });
});
