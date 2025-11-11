import {
	Database,
	Download,
	List,
	Settings,
	Target,
	Users,
} from "lucide-react";
import React from "react";

import {
	greenCardStyles,
	handlerAction,
	orangeCardStyles,
	outlineGreen,
	outlineOrange,
	outlinePrimary,
	primaryCardStyles,
	routeAction,
} from "./factories";
import type { QuickStartCardDescriptor } from "./types";

export const secondaryQuickStartCards: readonly QuickStartCardDescriptor[] = [
	{
		id: "control-data",
		enabled: true,
		order: 40,
		title: "📊 Control Your Data",
		description:
			"View & manage campaigns, export lead lists, conduct A/B tests, and analyze your data",
		icon: Database,
		featureChips: [
			{ label: "Performance Dashboards", tone: "info" },
			{ label: "A/B Testing", tone: "warning" },
			{ label: "Data Governance", tone: "neutral" },
		],
		actions: [
			routeAction({
				id: "control-download",
				label: "Download Leads",
				icon: Download,
				href: "/dashboard/lead-list?download=true",
			}),
			routeAction({
				id: "control-manage",
				label: "Manage Leads",
				icon: Settings,
				href: "/dashboard/lead-list",
				variant: "outline",
				className: outlinePrimary,
			}),
		],
		...primaryCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-blue-600 !to-indigo-600 !bg-clip-text !text-transparent dark:!from-blue-400 dark:!to-indigo-400",
	},
	{
		id: "extension",
		enabled: true,
		order: 50,
		title: "🔌 Browser Extension",
		description:
			"Enhance your workflow with our browser extension for seamless lead capture",
		icon: Download,
		featureChips: [
			{ label: "One-Click Capture", tone: "primary" },
			{ label: "Auto Enrich Profiles", tone: "success" },
			{ label: "Works on Any Site", tone: "info" },
		],
		actions: [
			handlerAction({
				id: "extension-download",
				label: "Download Extension",
				icon: Download,
				handler: "onBrowserExtension",
				variant: "outline",
				className: outlineOrange,
			}),
		],
		wizardPreset: {
			personaId: "agent",
			goalId: "agent-expansion",
		},
		...orangeCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-orange-600 !to-red-600 !bg-clip-text !text-transparent dark:!from-orange-400 dark:!to-red-400",
	},
	{
		id: "market-deals",
		enabled: true,
		order: 60,
		title: "🎯 Generate Look-Alike Audiences",
		description:
			"Build targeted audiences by finding people similar to your best customers and leads",
		icon: Users,
		featureChips: [
			{ label: "AI Matching", tone: "primary" },
			{ label: "Geo Targeting", tone: "accent" },
			{ label: "People Search", tone: "success" },
		],
		actions: [
			handlerAction({
				id: "market-start",
				label: "Generate Look-Alike Audience",
				icon: Users,
				handler: "onStartNewSearch",
			}),
			handlerAction({
				id: "market-saved",
				label: "Saved Searches",
				icon: List,
				handler: "onOpenSavedSearches",
				variant: "outline",
				className: outlineGreen,
			}),
			handlerAction({
				id: "market-ai-generate",
				label: "Generate with AI ✨",
				icon: Target,
				handler: "onAIGenerateSearch",
				variant: "outline",
				className:
					"border-purple-500/30 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
			}),
		],
		wizardPreset: {
			personaId: "investor",
			goalId: "investor-market",
			templateId: "market-research",
		},
		...greenCardStyles,
		titleClassName:
			"!text-2xl !font-extrabold !bg-gradient-to-r !from-green-600 !to-emerald-600 !bg-clip-text !text-transparent dark:!from-green-400 dark:!to-emerald-400",
	},
];
