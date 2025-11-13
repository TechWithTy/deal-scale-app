import {
	List,
	PlayCircle,
	Plus,
	Rss,
	Settings,
	Sparkles,
	Upload,
	Webhook,
	Mic,
	FileText,
	Bot,
	Wand2,
} from "lucide-react";
import React from "react";

import { cn } from "@/lib/_utils";

import {
	handlerAction,
	outlinePrimary,
	primaryCardStyles,
	routeAction,
	webhookAction,
} from "./factories";
import type { QuickStartCardDescriptor } from "./types";

export const primaryQuickStartCards: readonly QuickStartCardDescriptor[] = [
	{
		id: "wizard",
		enabled: true,
		order: 5,
		title: "✨ Guided QuickStart",
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
				label: "✨ Guided Setup",
				icon: Sparkles,
				handler: "onLaunchQuickStartFlow",
				variant: "default",
				className:
					"bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/30",
			}),
		],
		wizardPreset: {},
		...primaryCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-primary !to-primary/70 !bg-clip-text !text-transparent dark:!from-primary/90 dark:!to-primary/60",
		cardClassName: cn(
			primaryCardStyles.cardClassName,
			"md:col-span-2 md:row-span-2 xl:col-span-2 xl:row-span-2",
			"relative overflow-hidden",
			"border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background",
			"shadow-2xl shadow-primary/20 hover:shadow-primary/30",
			"ring-2 ring-primary/30 hover:ring-primary/40",
		),
		showBorderBeam: true,
		borderBeamConfig: {
			size: 250,
			duration: 6,
			delay: 0,
			colorFrom: "#f59e0b",
			colorTo: "#8b5cf6",
		},
	},
	{
		id: "import",
		enabled: true,
		order: 10,
		title: "📥 Import & Manage Data",
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
				variant: "default",
				className:
					"bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30",
			}),
			handlerAction({
				id: "import-browse-lists",
				label: "Browse Existing Lists",
				icon: List,
				handler: "onSelectList",
				variant: "outline",
				className: outlinePrimary,
			}),
			routeAction({
				id: "import-configure",
				label: "Configure Connections",
				icon: Settings,
				href: "/dashboard/profile#oauth",
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
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-blue-600 !to-cyan-600 !bg-clip-text !text-transparent dark:!from-blue-400 dark:!to-cyan-400",
	},
	{
		id: "campaign",
		enabled: true,
		order: 20,
		title: "🚀 Create Campaign",
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
				id: "campaign-ai-generate",
				label: "AI Generate Campaign",
				icon: Sparkles,
				handler: "onAIGenerateCampaign",
				variant: "default",
				className:
					"bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30",
			}),
			handlerAction({
				id: "campaign-start",
				label: "Start Campaign",
				icon: Plus,
				handler: "onCampaignCreate",
				variant: "default",
				className:
					"bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30",
			}),
			handlerAction({
				id: "campaign-templates",
				label: "Saved Templates",
				icon: FileText,
				handler: "onOpenSavedCampaignTemplates",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		wizardPreset: {
			personaId: "wholesaler",
			goalId: "wholesaler-dispositions",
			templateId: "campaign-default",
		},
		...primaryCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-purple-600 !to-pink-600 !bg-clip-text !text-transparent dark:!from-purple-400 dark:!to-pink-400",
	},
	{
		id: "webhooks",
		enabled: true,
		order: 27,
		title: "⚡ Webhooks & Feeds",
		description:
			"Connect DealScale with your CRM and publish updates instantly.",
		icon: Webhook,
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
			personaId: "loan_officer",
			goalId: "lender-fund-fast",
			templateId: "automation-routing",
		},
		...primaryCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-orange-600 !to-amber-600 !bg-clip-text !text-transparent dark:!from-orange-400 dark:!to-amber-400",
	},
	{
		id: "workflows",
		enabled: true,
		order: 28,
		title: "🪄 AI Workflow Generator",
		description:
			"Generate powerful n8n, Make, and Kestra workflows with AI. Automate your entire lead pipeline.",
		icon: Wand2,
		featureChips: [
			{ label: "AI-Powered", tone: "primary" },
			{ label: "Multi-Platform", tone: "accent" },
			{ label: "One-Click Export", tone: "success" },
		],
		cardClassName: cn(
			"relative overflow-hidden",
			"bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5",
			"border-2 border-primary/40 hover:border-primary/60",
			"shadow-2xl shadow-primary/30 hover:shadow-primary/50",
			"transition-all duration-300 hover:scale-[1.02]",
			"before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-primary/3 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
		),
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-primary !to-primary/70 !bg-clip-text !text-transparent dark:!from-primary/90 dark:!to-primary/60",
		iconWrapperClassName:
			"bg-gradient-to-br from-primary/40 to-primary/30 group-hover:from-primary/60 group-hover:to-primary/50 ring-2 ring-primary/30 group-hover:ring-primary/50",
		iconClassName: "text-primary drop-shadow-lg",
		actions: [
			handlerAction({
				id: "workflow-ai-generate",
				label: "AI Generate Workflow",
				icon: Sparkles,
				handler: "onAIGenerateWorkflow",
				variant: "default",
				className:
					"bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md",
			}),
			handlerAction({
				id: "workflow-saved",
				label: "Saved Workflows",
				icon: FileText,
				handler: "onOpenSavedWorkflows",
				variant: "outline",
				className: "border-primary/30 hover:bg-primary/10",
			}),
			routeAction({
				id: "workflow-connect",
				label: "Connect Platforms",
				icon: Settings,
				href: "/dashboard/settings/integrations",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		footer: (
			<p className="text-center text-muted-foreground text-xs">
				🚀 Connect n8n, Make.com, and Kestra for enterprise automation
			</p>
		),
		wizardPreset: undefined,
	},
	{
		id: "customize",
		enabled: true,
		order: 35,
		title: "🎨 Customize & Personalize",
		description:
			"Upload sales scripts, clone your voice, and create AI assistants for automated outreach",
		icon: Wand2,
		featureChips: [
			{ label: "Voice Cloning", tone: "accent" },
			{ label: "AI Assistants", tone: "primary" },
			{ label: "Custom Scripts", tone: "success" },
		],
		cardClassName: cn(
			"bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5",
			"border-purple-500/20 hover:border-purple-500/40",
			"shadow-lg shadow-purple-500/10",
		),
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-purple-600 !to-blue-600 !bg-clip-text !text-transparent dark:!from-purple-400 dark:!to-blue-400",
		iconWrapperClassName:
			"bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30",
		iconClassName: "text-purple-600 dark:text-purple-400",
		actions: [
			routeAction({
				id: "customize-ai-assistant",
				label: "Create AI Assistant",
				icon: Bot,
				href: "/dashboard/agents",
				variant: "default",
			}),
			routeAction({
				id: "customize-clone-voice",
				label: "Clone Voice",
				icon: Mic,
				href: "/dashboard/profile/knowledgebase?action=clone-voice",
				variant: "outline",
				className: "border-purple-500/30 hover:bg-purple-500/10",
			}),
			routeAction({
				id: "customize-upload-script",
				label: "Upload Sales Script",
				icon: FileText,
				href: "/dashboard/profile/knowledgebase?action=upload-script",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		footer: (
			<p className="text-center text-muted-foreground text-xs">
				Personalize your AI-powered sales automation
			</p>
		),
		wizardPreset: undefined,
	},
];
