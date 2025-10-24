"use client";

import { useMemo } from "react";

import type { QuickStartCardConfig } from "@/components/quickstart/types";
import {
	quickStartCardDescriptors,
	type QuickStartActionDescriptor,
	type QuickStartActionHandlerKey,
	type QuickStartCardDescriptor,
} from "@/lib/config/quickstart";
import type { WebhookStage } from "@/lib/stores/dashboard";

interface UseQuickStartCardsParams {
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
}

const sortDescriptors = (descriptors: readonly QuickStartCardDescriptor[]) =>
	[...descriptors]
		.filter((descriptor) => descriptor.enabled)
		.sort((left, right) => {
			if (left.order !== right.order) {
				return left.order - right.order;
			}

			return left.id.localeCompare(right.id);
		});

const logMissingHandler = (actionId: string) => {
	if (process.env.NODE_ENV !== "production") {
		console.error(
			`[useQuickStartCards] Missing handler for action "${actionId}".`,
		);
	}
};

export const useQuickStartCards = ({
	onImport,
	onSelectList,
	onConfigureConnections,
	onCampaignCreate,
	onViewTemplates,
	onOpenWebhookModal,
	onBrowserExtension,
	createRouterPush,
	onStartNewSearch,
	onOpenSavedSearches,
}: UseQuickStartCardsParams) =>
	useMemo<QuickStartCardConfig[]>(() => {
		const handlerMap: Record<QuickStartActionHandlerKey, () => void> = {
			onImport,
			onSelectList,
			onConfigureConnections,
			onCampaignCreate,
			onViewTemplates,
			onBrowserExtension,
			onStartNewSearch,
			onOpenSavedSearches,
			onWizardStub: () => {},
		};

		const resolveAction = (descriptor: QuickStartActionDescriptor) => {
			const base = {
				label: descriptor.label,
				icon: descriptor.icon,
				variant: descriptor.variant,
				className: descriptor.className,
			} as const;

			if (descriptor.kind === "handler") {
				const handler = handlerMap[descriptor.handler];
				if (!handler) {
					logMissingHandler(descriptor.id);
					return { ...base, onClick: () => {} };
				}

				return { ...base, onClick: handler };
			}

			if (descriptor.kind === "route") {
				return { ...base, onClick: createRouterPush(descriptor.href) };
			}

			return {
				...base,
				onClick: () => onOpenWebhookModal(descriptor.stage),
			};
		};

		return sortDescriptors(quickStartCardDescriptors).map((descriptor) => ({
			key: descriptor.id,
			title: descriptor.title,
			description: descriptor.description,
			icon: descriptor.icon,
			iconNode: descriptor.iconNode,
			cardClassName: descriptor.cardClassName,
			titleClassName: descriptor.titleClassName,
			iconWrapperClassName: descriptor.iconWrapperClassName,
			iconClassName: descriptor.iconClassName,
			footer: descriptor.footer,
			featureChips: descriptor.featureChips,
			actions: descriptor.actions.map(resolveAction),
			wizardPreset: descriptor.wizardPreset,
		}));
	}, [
		onImport,
		onSelectList,
		onConfigureConnections,
		onCampaignCreate,
		onViewTemplates,
		onOpenWebhookModal,
		onBrowserExtension,
		createRouterPush,
		onStartNewSearch,
		onOpenSavedSearches,
	]);
