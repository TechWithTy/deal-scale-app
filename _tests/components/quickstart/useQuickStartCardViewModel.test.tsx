import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QuickStartCardConfig } from "@/components/quickstart/types";

type UseQuickStartCardViewModelModule = typeof import(
	"@/components/quickstart/useQuickStartCardViewModel"
);
type QuickStartCardViewModelParams = Parameters<
	UseQuickStartCardViewModelModule["useQuickStartCardViewModel"]
>[0];

// Ensure legacy JSX runtime expectations during SSR-style evaluation.
(globalThis as Record<string, unknown>).React = React;

const createParams = () => {
	const onLaunchWizard = vi.fn();
	const onLaunchQuickStartFlow = vi.fn();
	const params: QuickStartCardViewModelParams = {
		bulkCsvFile: null as File | null,
		bulkCsvHeaders: [] as string[],
		onImport: vi.fn(),
		onSelectList: vi.fn(),
		onConfigureConnections: vi.fn(),
		onCampaignCreate: vi.fn(),
		onCreateAbTest: vi.fn(),
		onViewTemplates: vi.fn(),
		onOpenWebhookModal: vi.fn(),
		onBrowserExtension: vi.fn(),
		createRouterPush: vi.fn(() => vi.fn()),
		onStartNewSearch: vi.fn(),
		onOpenSavedSearches: vi.fn(),
		onAIGenerateSearch: vi.fn(),
		onAIGenerateCampaign: vi.fn(),
		onOpenSavedCampaignTemplates: vi.fn(),
		onAIGenerateWorkflow: vi.fn(),
		onOpenSavedWorkflows: vi.fn(),
		onLaunchWizard,
		onLaunchQuickStartFlow,
	} as const;

	return { params, onLaunchWizard, onLaunchQuickStartFlow };
};

const renderViewModel = async (
	params: QuickStartCardViewModelParams,
): Promise<QuickStartCardConfig[]> => {
	const { useQuickStartCardViewModel } = await import(
		"@/components/quickstart/useQuickStartCardViewModel"
	);
	let captured: QuickStartCardConfig[] | null = null;

	function TestComponent() {
		captured = useQuickStartCardViewModel(params);
		return null;
	}

	renderToStaticMarkup(React.createElement(TestComponent));
	return captured ?? [];
};

describe("useQuickStartCardViewModel", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("queues the guided plan action for the wizard card", async () => {
		const { params, onLaunchWizard, onLaunchQuickStartFlow } = createParams();

		const cards = await renderViewModel(params);

		const wizardCard = cards.find((card) => card.key === "wizard");
		expect(wizardCard).toBeDefined();

		wizardCard?.actions[0]?.onClick();

		expect(onLaunchWizard).toHaveBeenCalledTimes(1);
		expect(onLaunchQuickStartFlow).not.toHaveBeenCalled();

		const callArgs = onLaunchWizard.mock.calls[0] ?? [];
		expect(callArgs[0]).toEqual(wizardCard?.wizardPreset);
		expect(typeof callArgs[1]).toBe("function");

		(callArgs[1] as () => void)();

		expect(onLaunchQuickStartFlow).toHaveBeenCalledTimes(1);
	});
});

