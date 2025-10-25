import React from "react";
import {
	List,
	Plus,
	Settings,
	Upload,
	Webhook,
	Rss,
	Sparkles,
	PlayCircle,
} from "lucide-react";

import { cn } from "@/lib/_utils";

import {
	handlerAction,
	primaryCardStyles,
	routeAction,
	webhookAction,
	outlinePrimary,
} from "./factories";
import type { QuickStartCardDescriptor } from "./types";

export const primaryQuickStartCards: readonly QuickStartCardDescriptor[] = [
	{
		id: "wizard",
		enabled: true,
		order: 5,
		title: "Guided QuickStart",
		description:
			"Launch the guided wizard to import leads, enrich data, and build campaigns in minutes.",
		icon: Sparkles,
		featureChips: [
			{ label: "Guided Setup", tone: "primary" },
			{ label: "Prefilled Templates", tone: "accent" },
			{ label: "State Persistence", tone: "success" },
		],
		actions: [
			handlerAction({
				id: "wizard-launch",
				label: "Launch Guided Setup",
				icon: PlayCircle,
				handler: "onWizardStub",
			}),
		],
		wizardPreset: {},
		...primaryCardStyles,
		cardClassName: cn(
			primaryCardStyles.cardClassName,
			"md:row-span-2 md:col-span-2 md:max-w-none xl:row-span-2",
		),
	},
	{
		id: "import",
		enabled: true,
		order: 10,
		title: "Import & Manage Data",
		description:
			"Import leads from any source and manage your data connections seamlessly",
		icon: Upload,
		featureChips: [
			{ label: "Investor CRM Sync", tone: "info" },
			{ label: "Bulk Upload Lists", tone: "accent" },
			{ label: "Instant Deduping", tone: "success" },
		],
		actions: [
			handlerAction({
				id: "import-upload",
				label: "Import from Any Source",
				icon: Upload,
				handler: "onImport",
				variant: "outline",
				className: outlinePrimary,
			}),
			handlerAction({
				id: "import-browse-lists",
				label: "Browse Existing Lists",
				icon: List,
				handler: "onSelectList",
				variant: "outline",
				className: outlinePrimary,
			}),
			handlerAction({
				id: "import-configure",
				label: "Configure Connections",
				icon: Settings,
				handler: "onConfigureConnections",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		footer: (
			<p className="text-center text-muted-foreground text-xs">
				Connect APIs, CRM systems, databases, and more
			</p>
		),
		wizardPreset: {
			personaId: "investor",
			goalId: "investor-pipeline",
			templateId: "lead-import",
		},
		...primaryCardStyles,
	},
	{
		id: "campaign",
		enabled: true,
		order: 20,
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
			handlerAction({
				id: "campaign-start",
				label: "Start Campaign",
				icon: Plus,
				handler: "onCampaignCreate",
			}),
			handlerAction({
				id: "campaign-view-templates",
				label: "View Templates",
				icon: List,
				handler: "onViewTemplates",
				variant: "outline",
			}),
			routeAction({
				id: "campaign-view",
				label: "View Campaigns",
				icon: Settings,
				href: "/dashboard/campaigns",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		wizardPreset: {
			personaId: "wholesaler",
			goalId: "wholesaler-dispositions",
			templateId: "campaign-default",
		},
	},
	{
		id: "webhooks",
		enabled: true,
		order: 30,
		title: "Webhooks & Feeds",
		description:
			"Connect DealScale with your CRM and publish updates instantly.",
		iconNode: (
			<>
				<Webhook className="h-6 w-6 text-primary" />
				<Rss className="-bottom-1 -right-1 absolute h-4 w-4 text-primary/70" />
			</>
		),
		iconWrapperClassName: "relative",
		featureChips: [
			{ label: "Real-time Alerts", tone: "warning" },
			{ label: "CRM Automation", tone: "primary" },
			{ label: "Custom Event Routing", tone: "accent" },
		],
		actions: [
			webhookAction({
				id: "webhooks-incoming",
				label: "Setup Incoming",
				icon: Settings,
				stage: "incoming",
			}),
			webhookAction({
				id: "webhooks-outgoing",
				label: "Setup Outgoing",
				icon: List,
				stage: "outgoing",
				variant: "outline",
			}),
		],
		wizardPreset: {
			personaId: "lender",
			goalId: "lender-fund-fast",
			templateId: "automation-routing",
		},
	},
];
