"use client";

import { useMemo } from "react";
import {
	Upload,
	List,
	Settings,
	Plus,
	Webhook,
	Rss,
	Database,
	Target,
	Home,
	Download,
} from "lucide-react";

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
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useMemo<QuickStartCardConfig[]>(
		() => [
			{
				key: "import",
				title: "Import & Manage Data",
				description:
					"Import leads from any source and manage your data connections seamlessly",
				icon: Upload,
				cardClassName:
					"border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
				titleClassName: "text-primary",
				iconWrapperClassName: "bg-primary/20 group-hover:bg-primary/30",
				featureChips: [
					{ label: "Investor CRM Sync", tone: "info" },
					{ label: "Bulk Upload Lists", tone: "accent" },
					{ label: "Instant Deduping", tone: "success" },
				],
				actions: [
					{
						label: "Import from Any Source",
						icon: Upload,
						variant: "default",
						onClick: onImport,
					},
					{
						label: "Browse Existing Lists",
						icon: List,
						variant: "outline",
						className: "border-primary/30 text-primary hover:bg-primary/10",
						onClick: onSelectList,
					},
					{
						label: "Configure Connections",
						icon: Settings,
						variant: "outline",
						className: "border-primary/30 text-primary hover:bg-primary/10",
						onClick: onConfigureConnections,
					},
				],
				footer: (
					<p className="text-center text-muted-foreground text-xs">
						Connect APIs, CRM systems, databases, and more
					</p>
				),
			},
			{
				key: "campaign",
				title: "Create Campaign",
				description:
					"Launch automated outreach campaigns with AI-powered messaging and lead management",
				icon: Plus,
				cardClassName:
					"border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-400/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20",
				titleClassName: "text-blue-600",
				iconWrapperClassName: "bg-blue-500/20 group-hover:bg-blue-500/30",
				featureChips: [
					{ label: "AI Messaging", tone: "primary" },
					{ label: "Multi-Channel Touches", tone: "accent" },
					{ label: "Auto Follow-Ups", tone: "success" },
				],
				actions: [
					{
						label: "Start Campaign",
						icon: Plus,
						onClick: onCampaignCreate,
					},
					{
						label: "View Templates",
						icon: List,
						variant: "outline",
						onClick: onViewTemplates,
					},
					{
						label: "View Campaigns",
						icon: Settings,
						variant: "outline",
						className: "border-blue-500/30 text-blue-600 hover:bg-blue-500/10",
						onClick: createRouterPush("/dashboard/campaigns"),
					},
				],
			},
			{
				key: "webhooks",
				title: "Webhooks & Feeds",
				description:
					"Connect DealScale with your CRM and publish updates instantly.",
				cardClassName:
					"border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-purple-400/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20",
				titleClassName: "text-purple-600",
				iconWrapperClassName:
					"relative bg-purple-500/20 group-hover:bg-purple-500/30",
				iconNode: (
					<>
						<Webhook className="h-6 w-6 text-purple-600" />
						<Rss className="-bottom-1 -right-1 absolute h-4 w-4 text-purple-600/70" />
					</>
				),
				featureChips: [
					{ label: "Real-time Alerts", tone: "warning" },
					{ label: "CRM Automation", tone: "primary" },
					{ label: "Custom Event Routing", tone: "accent" },
				],
				actions: [
					{
						label: "Trigger Campaigns",
						icon: Settings,
						onClick: () => onOpenWebhookModal("incoming"),
					},
					{
						label: "Sync Leads",
						icon: List,
						variant: "outline",
						className:
							"border-purple-500/30 text-purple-600 hover:bg-purple-500/10",
						onClick: () => onOpenWebhookModal("outgoing"),
					},
					{
						label: "Get Real Time Alerts",
						icon: Webhook,
						variant: "outline",
						className:
							"border-purple-500/30 text-purple-600 hover:bg-purple-500/10",
						onClick: () => onOpenWebhookModal("outgoing"),
					},
				],
			},
			{
				key: "control-data",
				title: "Control Your Data",
				description:
					"View & manage campaigns, export lead lists, conduct A/B tests, and analyze your data",
				icon: Database,
				cardClassName:
					"border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-teal-400/10 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/20",
				titleClassName: "text-teal-600",
				iconWrapperClassName: "bg-teal-500/20 group-hover:bg-teal-500/30",
				featureChips: [
					{ label: "Performance Dashboards", tone: "info" },
					{ label: "A/B Testing", tone: "warning" },
					{ label: "Data Governance", tone: "neutral" },
				],
				actions: [
					{
						label: "Download Leads",
						icon: Upload,
						onClick: createRouterPush(
							"/dashboard/lead-list?listId=default-lead-list&download=true",
						),
					},
					{
						label: "Create A/B Test",
						icon: List,
						variant: "outline",
						className: "border-teal-500/30 text-teal-600 hover:bg-teal-500/10",
						onClick: createRouterPush(
							"/dashboard/lead-lists?abtest=true&listname=ai-optimized-leads",
						),
					},
				],
			},
			{
				key: "market-deals",
				title: "Source of Market Deals",
				description:
					"Find distressed properties and motivated sellers - why some deals spread like wildfire in real estate",
				icon: Target,
				cardClassName:
					"border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-400/10 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20",
				titleClassName: "text-green-600",
				iconWrapperClassName: "bg-green-500/20 group-hover:bg-green-500/30",
				iconClassName: "text-green-600",
				featureChips: [
					{ label: "Distress Signals", tone: "warning" },
					{ label: "Geo Targeting", tone: "accent" },
					{ label: "Off-Market Alerts", tone: "success" },
				],
				actions: [
					{
						label: "Start New Search",
						icon: Target,
						onClick: onStartNewSearch,
					},
					{
						label: "Saved Searches",
						icon: List,
						variant: "outline",
						className:
							"border-green-500/30 text-green-600 hover:bg-green-500/10",
						onClick: onOpenSavedSearches,
					},
					{
						label: "Find Distressed Properties",
						icon: Home,
						variant: "outline",
						className:
							"border-green-500/30 text-green-600 hover:bg-green-500/10",
						onClick: createRouterPush(
							"/dashboard?distressed=true&foreclosure=true",
						),
					},
				],
			},
			{
				key: "extension",
				title: "Browser Extension",
				description:
					"Enhance your workflow with our browser extension for seamless lead capture",
				icon: Download,
				cardClassName:
					"border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-400/10 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20",
				titleClassName: "text-orange-600",
				iconWrapperClassName: "bg-orange-500/20 group-hover:bg-orange-500/30",
				iconClassName: "text-orange-600",
				featureChips: [
					{ label: "One-Click Capture", tone: "primary" },
					{ label: "Auto Enrich Profiles", tone: "success" },
					{ label: "Manage Conversations Anywhere", tone: "accent" },

					{ label: "Works on Any Site", tone: "info" },
				],
				actions: [
					{
						label: "Download Extension",
						icon: Download,
						variant: "outline",
						className:
							"bg-orange-500 text-white border-orange-500 hover:bg-orange-600",
						onClick: onBrowserExtension,
					},
					{
						label: "Manage Leads",
						icon: Settings,
						variant: "outline",
						className:
							"border-orange-500/30 text-orange-600 hover:bg-orange-500/10",
						onClick: createRouterPush("/dashboard/lead-lists"),
					},
				],
				footer: (
					<p className="text-center text-muted-foreground text-xs">
						Capture leads directly from any website
					</p>
				),
			},
		],
		[
			onCampaignCreate,
			onConfigureConnections,
			onImport,
			onSelectList,
			onConfigureConnections,
			onCampaignCreate,
			onViewTemplates,
			onBrowserExtension,
			onStartNewSearch,
			onOpenSavedSearches,
		],
	);
