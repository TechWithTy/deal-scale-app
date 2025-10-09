"use client";

import {
	Database,
	DollarSign,
	Download,
	Home,
	List,
	MapPin,
	Plus,
	Rss,
	Settings,
	Target,
	Upload,
	Webhook,
} from "lucide-react";
import { useMemo } from "react";

import type { QuickStartCardConfig } from "@/components/quickstart/QuickStartActionsGrid";
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
}

export const useQuickStartCards = ({
	onImport,
	onSelectList,
	onConfigureConnections,
	onCampaignCreate,
	onViewTemplates,
	onOpenWebhookModal,
	onBrowserExtension,
	createRouterPush,
}: UseQuickStartCardsParams) =>
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
						variant: "outline",
						className: "border-primary/30 text-primary hover:bg-primary/10",
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
						className: "border-primary/30 text-primary hover:bg-primary/10",
						onClick: createRouterPush("/dashboard/campaigns"),
					},
				],
			},
			{
				key: "webhooks",
				title: "Webhooks & Feeds",
				description:
					"Connect DealScale with your CRM and publish updates instantly.",
				iconWrapperClassName: "relative",
				iconNode: (
					<>
						<Webhook className="h-6 w-6 text-primary" />
						<Rss className="-bottom-1 -right-1 absolute h-4 w-4 text-primary/70" />
					</>
				),
				featureChips: [
					{ label: "Real-time Alerts", tone: "warning" },
					{ label: "CRM Automation", tone: "primary" },
					{ label: "Custom Event Routing", tone: "accent" },
				],
				actions: [
					{
						label: "Setup Incoming",
						icon: Settings,
						onClick: () => onOpenWebhookModal("incoming"),
					},
					{
						label: "Setup Outgoing",
						icon: List,
						variant: "outline",
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
					"border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
				titleClassName: "text-primary",
				iconWrapperClassName: "bg-primary/20 group-hover:bg-primary/30",
				featureChips: [
					{ label: "Performance Dashboards", tone: "info" },
					{ label: "A/B Testing", tone: "warning" },
					{ label: "Data Governance", tone: "neutral" },
				],
				actions: [
					{
						label: "Download Leads",
						icon: Upload,
						onClick: createRouterPush("/dashboard/lead-lists?download=true"),
					},
					{
						label: "Create A/B Test",
						icon: List,
						variant: "outline",
						className: "border-primary/30 text-primary hover:bg-primary/10",
						onClick: createRouterPush(
							"/dashboard/lead-lists?abtest=true&listname=ai-optimized-leads",
						),
					},
					{
						label: "Manage Leads",
						icon: Settings,
						variant: "outline",
						onClick: createRouterPush("/dashboard/lead-lists"),
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
					{ label: "Works on Any Site", tone: "info" },
				],
				actions: [
					{
						label: "Download Extension",
						icon: Download,
						variant: "outline",
						className:
							"border-orange-500/30 text-orange-600 hover:bg-orange-500/10",
						onClick: onBrowserExtension,
					},
				],
				footer: (
					<p className="text-center text-muted-foreground text-xs">
						Capture leads directly from any website
					</p>
				),
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
						label: "Target by ZIP Code",
						icon: MapPin,
						onClick: createRouterPush("/dashboard?zipcode=true"),
					},
					{
						label: "Filter by Price Range",
						icon: DollarSign,
						variant: "outline",
						className:
							"border-green-500/30 text-green-600 hover:bg-green-500/10",
						onClick: createRouterPush("/dashboard?pricerange=true"),
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
		],
		[
			onCampaignCreate,
			onConfigureConnections,
			onImport,
			onOpenWebhookModal,
			onSelectList,
			onViewTemplates,
			createRouterPush,
			onBrowserExtension,
		],
	);
