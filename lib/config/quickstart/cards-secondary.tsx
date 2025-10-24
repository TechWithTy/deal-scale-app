import React from "react";
import { Database, Download, Home, List, Settings, Target } from "lucide-react";

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
		title: "Control Your Data",
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
				href: "/dashboard/lead-lists?download=true",
			}),
			routeAction({
				id: "control-abtest",
				label: "Create A/B Test",
				icon: List,
				href: "/dashboard/lead-lists?abtest=true&listname=ai-optimized-leads",
				variant: "outline",
				className: outlinePrimary,
			}),
			routeAction({
				id: "control-manage",
				label: "Manage Leads",
				icon: Settings,
				href: "/dashboard/lead-lists",
				variant: "outline",
			}),
		],
		...primaryCardStyles,
	},
	{
		id: "extension",
		enabled: true,
		order: 50,
		title: "Browser Extension",
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
		wizardPreset: { startStep: "lead-capture" },
		...orangeCardStyles,
	},
	{
		id: "market-deals",
		enabled: true,
		order: 60,
		title: "Source of Market Deals",
		description:
			"Find distressed properties and motivated sellers - why some deals spread like wildfire in real estate",
		icon: Target,
		featureChips: [
			{ label: "Distress Signals", tone: "warning" },
			{ label: "Geo Targeting", tone: "accent" },
			{ label: "Off-Market Alerts", tone: "success" },
		],
		actions: [
			handlerAction({
				id: "market-start",
				label: "Start New Search",
				icon: Target,
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
			routeAction({
				id: "market-distressed",
				label: "Find Distressed Properties",
				icon: Home,
				href: "/dashboard?distressed=true&foreclosure=true",
				variant: "outline",
				className: outlineGreen,
			}),
		],
		wizardPreset: {
			startStep: "market-discovery",
			templateId: "market-research",
		},
		...greenCardStyles,
	},
];
