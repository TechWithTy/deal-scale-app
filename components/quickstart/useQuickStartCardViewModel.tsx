import { useMemo } from "react";

import type {
	QuickStartCardConfig,
	QuickStartWizardPreset,
} from "@/components/quickstart/types";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";
import type { WebhookStage } from "@/lib/stores/dashboard";

interface QuickStartCardViewModelParams {
	readonly bulkCsvFile: File | null;
	readonly bulkCsvHeaders: readonly string[];
	readonly onImport: () => void;
	readonly onSelectList: () => void;
	readonly onConfigureConnections: () => void;
	readonly onCampaignCreate: () => void;
	readonly onViewTemplates: () => void;
	readonly onOpenWebhookModal: (stage: WebhookStage) => void;
	readonly onBrowserExtension: () => void;
	readonly createRouterPush: (path: string) => () => void;
	readonly onStartNewSearch: () => void;
	readonly onOpenSavedSearches: () => void;
	readonly onLaunchWizard: (
		preset: QuickStartWizardPreset | undefined,
		action: () => void,
	) => void;
}

const enhanceCard = (
	card: QuickStartCardConfig,
	bulkCsvFile: File | null,
	bulkCsvHeaders: readonly string[],
	onLaunchWizard: (
		preset: QuickStartWizardPreset | undefined,
		action: () => void,
	) => void,
): QuickStartCardConfig => {
	const footer =
		card.key === "import" && bulkCsvFile ? (
			<div className="text-center text-muted-foreground text-sm">
				<p className="font-medium">{bulkCsvFile.name}</p>
				<p className="text-xs">{bulkCsvHeaders.length} columns detected</p>
				<p className="text-xs">We’ll open the list wizard to finish setup.</p>
			</div>
		) : (
			card.footer
		);

	if (!card.wizardPreset) {
		return { ...card, footer };
	}

	const actions = card.actions.map((action, index) => {
		if (index !== 0) {
			return action;
		}

		return {
			...action,
			onClick: () => {
				onLaunchWizard(card.wizardPreset, action.onClick);
			},
		};
	});

	return { ...card, footer, actions };
};

export const useQuickStartCardViewModel = (
	params: QuickStartCardViewModelParams,
) => {
	const cards = useQuickStartCards({
		onImport: params.onImport,
		onSelectList: params.onSelectList,
		onConfigureConnections: params.onConfigureConnections,
		onCampaignCreate: params.onCampaignCreate,
		onViewTemplates: params.onViewTemplates,
		onOpenWebhookModal: params.onOpenWebhookModal,
		onBrowserExtension: params.onBrowserExtension,
		createRouterPush: params.createRouterPush,
		onStartNewSearch: params.onStartNewSearch,
		onOpenSavedSearches: params.onOpenSavedSearches,
	});

	const { bulkCsvFile, bulkCsvHeaders, onLaunchWizard } = params;

	return useMemo(
		() =>
			cards.map((card) =>
				enhanceCard(card, bulkCsvFile, bulkCsvHeaders, onLaunchWizard),
			),
		[cards, bulkCsvFile, bulkCsvHeaders, onLaunchWizard],
	);
};
