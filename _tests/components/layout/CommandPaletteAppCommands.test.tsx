import React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CommandPaletteAppCommands from "@/components/layout/CommandPaletteAppCommands";
import { quickStartGoals } from "@/lib/config/quickstart/wizardFlows";
import { useModalStore } from "@/lib/stores/dashboard";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import {
	useUserPromptsStore,
	type PromptTemplate,
} from "@/lib/stores/user/prompts";
import { useAISettingsStore } from "@/lib/stores/user/ai/ai";
import {
	openFocusWidget,
	openHelpModal,
	showHelpIcon,
} from "@/lib/ui/helpActions";

const registerDynamicCommandsMock = vi.hoisted(() => vi.fn());
const showHelpIconMock = vi.hoisted(() => vi.fn());
const openHelpModalMock = vi.hoisted(() => vi.fn());
const openFocusWidgetMock = vi.hoisted(() => vi.fn());
const selectGoalMock = vi.hoisted(() => vi.fn());
const openWizardMock = vi.hoisted(() => vi.fn());
const openDailySpinMock = vi.hoisted(() => vi.fn());
const clipboardWriteTextMock = vi.hoisted(() =>
	vi.fn().mockResolvedValue(undefined),
);
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

const leadListFixtures = vi.hoisted(() => [
	{
		id: "list-1",
		listName: "Phoenix Absentee Owners",
		records: 345,
		emails: 210,
		phone: 180,
		leads: [],
	},
	{
		id: "list-2",
		listName: "Austin High Equity",
		records: 128,
		emails: 90,
		phone: 75,
		leads: [],
	},
]);

const campaignFixtures = vi.hoisted(() => ({
	callCampaigns: [{ id: "call-1", name: "Outbound Sellers", status: "active" }],
	textCampaigns: [{ id: "text-1", name: "Nurture SMS", status: "queued" }],
	emailCampaigns: [],
	socialCampaigns: [],
}));

vi.mock(
	"external/action-bar/components/providers/CommandPaletteProvider",
	() => ({
		useCommandPalette: () => ({
			registerDynamicCommands: registerDynamicCommandsMock,
		}),
	}),
);

vi.mock("@/lib/ui/helpActions", () => ({
	showHelpIcon: showHelpIconMock,
	openHelpModal: openHelpModalMock,
	openFocusWidget: openFocusWidgetMock,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock("@/lib/stores/leadList", () => ({
	useLeadListStore: (
		selector: (state: { leadLists: typeof leadListFixtures }) => unknown,
	) => selector({ leadLists: leadListFixtures }),
}));

vi.mock("@/lib/stores/user/userProfile", () => {
	const mockState = {
		userProfile: {
			companyInfo: { campaigns: campaignFixtures },
		},
	};
	const useUserProfileStoreMock = (
		selector: (state: typeof mockState) => unknown,
	) => selector(mockState);
	Object.assign(useUserProfileStoreMock, {
		getState: () => mockState,
		subscribe: () => () => undefined,
	});
	return {
		useUserProfileStore: useUserProfileStoreMock,
	};
});

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

type WizardDataState = ReturnType<typeof useQuickStartWizardDataStore.getState>;
type WizardStoreState = ReturnType<typeof useQuickStartWizardStore.getState>;
type ModalStoreState = ReturnType<typeof useModalStore.getState>;

let wizardDataSpy: ReturnType<typeof vi.spyOn>;
let wizardStoreSpy: ReturnType<typeof vi.spyOn>;
let modalStoreSpy: ReturnType<typeof vi.spyOn>;
let aiSettingsSpy: ReturnType<typeof vi.spyOn>;
let windowOpenSpy: ReturnType<typeof vi.spyOn>;

const promptTemplateFixtures: PromptTemplate[] = [
	{
		id: "campaign_kickoff",
		name: "Campaign Kickoff",
		description: "Launches a multi-channel campaign with recommended defaults.",
		category: "campaign",
		content: "Prompt content for campaign kickoff",
		variables: ["campaignName", "budget"],
		tags: ["launch", "campaign"],
		isBuiltIn: true,
	},
];

beforeEach(() => {
	registerDynamicCommandsMock.mockClear();
	showHelpIconMock.mockClear();
	openHelpModalMock.mockClear();
	openFocusWidgetMock.mockClear();
	selectGoalMock.mockClear();
	openWizardMock.mockClear();
	openDailySpinMock.mockClear();
	clipboardWriteTextMock.mockClear();
	toastSuccessMock.mockClear();
	toastErrorMock.mockClear();
	pushMock.mockClear();

	useUserPromptsStore.setState({ templates: promptTemplateFixtures });
	aiSettingsSpy = vi.spyOn(useAISettingsStore, "getState").mockReturnValue({
		preferredProvider: "openai",
	} as ReturnType<typeof useAISettingsStore.getState>);

	Object.defineProperty(navigator, "clipboard", {
		value: { writeText: clipboardWriteTextMock },
		configurable: true,
	});
	windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

	wizardDataSpy = vi
		.spyOn(useQuickStartWizardDataStore, "getState")
		.mockReturnValue({
			selectGoal: selectGoalMock,
		} as unknown as WizardDataState);
	wizardStoreSpy = vi
		.spyOn(useQuickStartWizardStore, "getState")
		.mockReturnValue({
			open: openWizardMock,
		} as unknown as WizardStoreState);
	modalStoreSpy = vi.spyOn(useModalStore, "getState").mockReturnValue({
		openWheelSpinnerModal: openDailySpinMock,
	} as unknown as ModalStoreState);
});

afterEach(() => {
	wizardDataSpy.mockRestore();
	wizardStoreSpy.mockRestore();
	modalStoreSpy.mockRestore();
	aiSettingsSpy.mockRestore();
	windowOpenSpy.mockRestore();
	useUserPromptsStore.getState().reset();
});

const getRegisteredCommands = () => {
	const lastCall = registerDynamicCommandsMock.mock.calls.at(-1);
	return (lastCall?.[0] ?? []) as Array<{
		id: string;
		group: string;
		label: string;
		hint?: string;
		action?: () => void;
		chips?: Array<{ key: string; label?: string }>;
		children?: Array<{
			id: string;
			label: string;
			hint?: string;
			action?: () => void;
			chips?: Array<{ key: string; label?: string }>;
			children?: Array<{
				id: string;
				label: string;
				hint?: string;
				action?: () => void;
				chips?: Array<{ key: string; label?: string }>;
			}>;
		}>;
	}>;
};

type CommandTreeItem = {
	id: string;
	children?: Array<CommandTreeItem>;
	[key: string]: unknown;
};

const findCommandById = (
	items: Array<CommandTreeItem> = [],
	id: string,
) => {
	for (const item of items) {
		if (item.id === id) return item;
		if (item.children) {
			const childResult = findCommandById(item.children, id);
			if (childResult) return childResult;
		}
	}
	return undefined;
};

describe("CommandPaletteAppCommands", () => {
	it("registers assistance commands with working actions", () => {
		render(<CommandPaletteAppCommands />);

		const commands = getRegisteredCommands();
		const assist = commands.filter((cmd) => cmd.group === "Assist");
		expect(assist.map((cmd) => cmd.label)).toEqual(
			expect.arrayContaining([
				"Show Help Icon",
				"Open Help Modal",
				"Open Focus Player",
			]),
		);

		assist.find((cmd) => cmd.id === "assist-help-icon")?.action?.();
		expect(showHelpIconMock).toHaveBeenCalled();

		assist.find((cmd) => cmd.id === "assist-help-modal")?.action?.();
		expect(openHelpModalMock).toHaveBeenCalled();

		assist.find((cmd) => cmd.id === "assist-focus-player")?.action?.();
		expect(openFocusWidgetMock).toHaveBeenCalled();
	});

	it("mirrors all quick start goals with contextual hints", () => {
		render(<CommandPaletteAppCommands />);

		const commands = getRegisteredCommands();
		const goalsRoot = findCommandById(commands, "goals-root");
		expect(goalsRoot?.children?.length).toBeGreaterThan(0);

		const oneClickGoal = quickStartGoals.find(
			(goal) => goal.isOneClickAutomatable,
		);
		if (oneClickGoal) {
			const command = findCommandById(
				(goalsRoot?.children ?? []) as any,
				`goal-${oneClickGoal.id}`,
			);
			const chipLabels = command?.chips?.map((chip) => chip.label ?? "");
			expect(chipLabels).toEqual(
				expect.arrayContaining([expect.stringMatching(/ONE CLICK/i)]),
			);
			command?.action?.();
			expect(selectGoalMock).toHaveBeenCalledWith(oneClickGoal.id);
			expect(openWizardMock).toHaveBeenCalledWith(
				expect.objectContaining({
					goalId: oneClickGoal.id,
					personaId: oneClickGoal.personaId,
				}),
			);
		}

		const guidedGoal = quickStartGoals.find(
			(goal) => goal.isOneClickAutomatable === false,
		);
		if (guidedGoal) {
			const command = findCommandById(
				(goalsRoot?.children ?? []) as any,
				`goal-${guidedGoal.id}`,
			);
			const chipLabels = command?.chips?.map((chip) => chip.label ?? "");
			expect(chipLabels).toEqual(
				expect.arrayContaining([expect.stringMatching(/GUIDED/i)]),
			);
		}
	});

	it("registers prompt templates with categorized chips and copies to clipboard", async () => {
		render(<CommandPaletteAppCommands />);

		const commands = getRegisteredCommands();
		const categoryCommand = commands.find(
			(cmd) => cmd.id === "ai-templates-campaign",
		);
		const providerChild = categoryCommand?.children?.[0];
		expect(providerChild?.label).toMatch(/Open in/i);
		providerChild?.action?.();
		expect(windowOpenSpy).toHaveBeenCalled();
		const templateCommand = categoryCommand?.children?.[1];
		expect(templateCommand?.label).toBe(promptTemplateFixtures[0].name);
		expect(templateCommand?.chips?.map((chip) => chip.key) ?? []).toEqual(
			expect.arrayContaining(promptTemplateFixtures[0].variables),
		);

		templateCommand?.action?.();
		await waitFor(() =>
			expect(clipboardWriteTextMock).toHaveBeenCalledWith(
				promptTemplateFixtures[0].content,
			),
		);
		expect(toastSuccessMock).toHaveBeenCalled();
		expect(toastErrorMock).not.toHaveBeenCalled();
	});

	it("registers lead list and campaign commands with navigation actions", () => {
		render(<CommandPaletteAppCommands />);

		const commands = getRegisteredCommands();
		const leadRoot = commands.find((cmd) => cmd.id === "lead-lists-root");
		expect(leadRoot?.children).toBeTruthy();
		const allButton = leadRoot?.children?.find(
			(child) => child?.id === "lead-lists-all",
		);
		pushMock.mockClear();
		allButton?.action?.();
		expect(pushMock).toHaveBeenCalledWith("/dashboard/lead-list");

		const leadChild = leadRoot?.children?.find(
			(child) => child?.id === "lead-list-list-1",
		);
		pushMock.mockClear();
		leadChild?.action?.();
		expect(pushMock).toHaveBeenCalledWith("/dashboard/lead-list?listId=list-1");

		const campaignsRoot = findCommandById(commands, "campaigns-root");
		expect(campaignsRoot?.children?.length).toBeGreaterThan(0);
		const callGroup = campaignsRoot?.children?.find((child) => {
			const typedChild = child as CommandTreeItem;
			return typedChild.id === "campaigns-call";
		});
		expect(callGroup?.children?.length).toBeGreaterThan(0);
		const firstCampaign = callGroup?.children?.[0];
		pushMock.mockClear();
		firstCampaign?.action?.();
		expect(pushMock).toHaveBeenCalledWith(
			"/dashboard/campaigns?type=call&campaignId=call-1",
		);
	});
});
