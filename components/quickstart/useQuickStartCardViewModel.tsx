import { useMemo } from "react";

import type {
	QuickStartCardConfig,
	QuickStartWizardPreset,
} from "@/components/quickstart/types";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { Sparkles } from "lucide-react";

interface QuickStartCardViewModelParams {
	readonly bulkCsvFile: File | null;
	readonly bulkCsvHeaders: readonly string[];
	readonly onImport: () => void;
	readonly onSelectList: () => void;
	readonly onConfigureConnections: () => void;
	readonly onCampaignCreate: () => void;
	readonly onCreateAbTest: () => void;
	readonly onViewTemplates: () => void;
	readonly onOpenWebhookModal: (stage: WebhookStage) => void;
	readonly onBrowserExtension: () => void;
	readonly createRouterPush: (path: string) => () => void;
	readonly onStartNewSearch: () => void;
	readonly onOpenSavedSearches: () => void;
	readonly onAIGenerateSearch: () => void;
	readonly onAIGenerateCampaign: () => void;
	readonly onOpenSavedCampaignTemplates: () => void;
	readonly onAIGenerateWorkflow: () => void;
	readonly onOpenSavedWorkflows: () => void;
	readonly onLaunchWizard: (
		preset: QuickStartWizardPreset | undefined,
		action: () => void,
	) => void;
	readonly onLaunchQuickStartFlow: () => void;
}

const enhanceCard = (
	card: QuickStartCardConfig,
	bulkCsvFile: File | null,
	bulkCsvHeaders: readonly string[],
	onLaunchWizard: (
		preset: QuickStartWizardPreset | undefined,
		action: () => void,
	) => void,
	onLaunchQuickStartFlow: () => void,
): QuickStartCardConfig => {
	const footer =
		card.key === "import" && bulkCsvFile ? (
			<div className="text-center text-muted-foreground text-sm">
				<p className="font-medium">{bulkCsvFile.name}</p>
				<p className="text-xs">{bulkCsvHeaders.length} columns detected</p>
				<p className="text-xs">We'll open the list wizard to finish setup.</p>
			</div>
		) : (
			card.footer
		);

	// Only add "Guided Setup" button to the main wizard card
	if (card.key === "wizard") {
		const actions = [
			{
				label: "Guided Setup",
				icon: Sparkles,
				variant: "default" as const,
				onClick: () => {
					onLaunchWizard(card.wizardPreset, onLaunchQuickStartFlow);
				},
			},
		];
		return { ...card, footer, actions };
	}

	// For all other cards, return unchanged (no "Guided Setup" button)
	return { ...card, footer };
};

export const useQuickStartCardViewModel = (
	params: QuickStartCardViewModelParams,
) => {
	const cards = useQuickStartCards({
		onImport: params.onImport,
		onSelectList: params.onSelectList,
		onConfigureConnections: params.onConfigureConnections,
		onCampaignCreate: params.onCampaignCreate,
		onCreateAbTest: params.onCreateAbTest,
		onViewTemplates: params.onViewTemplates,
		onOpenWebhookModal: params.onOpenWebhookModal,
		onBrowserExtension: params.onBrowserExtension,
		createRouterPush: params.createRouterPush,
		onStartNewSearch: params.onStartNewSearch,
		onOpenSavedSearches: params.onOpenSavedSearches,
		onAIGenerateSearch: params.onAIGenerateSearch,
		onAIGenerateCampaign: params.onAIGenerateCampaign,
		onOpenSavedCampaignTemplates: params.onOpenSavedCampaignTemplates,
		onAIGenerateWorkflow: params.onAIGenerateWorkflow,
		onOpenSavedWorkflows: params.onOpenSavedWorkflows,
		onLaunchQuickStartFlow: params.onLaunchQuickStartFlow,
	});

	const { bulkCsvFile, bulkCsvHeaders, onLaunchWizard } = params;

	return useMemo(
		() =>
			cards.map((card) =>
				enhanceCard(
					card,
					bulkCsvFile,
					bulkCsvHeaders,
					onLaunchWizard,
					params.onLaunchQuickStartFlow,
				),
			),
		[
			cards,
			bulkCsvFile,
			bulkCsvHeaders,
			onLaunchWizard,
			params.onLaunchQuickStartFlow,
		],
	);
};
