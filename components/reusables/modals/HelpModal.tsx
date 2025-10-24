"use client";

import type { FC } from "react";
import React, { useState } from "react";
import {
	BookOpen,
	PlayCircle,
	HelpCircle,
	Settings,
	Users,
	Target,
	BarChart3,
	Zap,
	X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import WalkthroughModal from "@/components/leadsSearch/search/WalkthroughModal";

interface HelpCategory {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	options: HelpOption[];
}

interface HelpOption {
	id: string;
	title: string;
	description: string;
	type: "demo" | "video" | "docs" | "guide";
	url?: string;
	demoId?: string;
}

const helpCategories: HelpCategory[] = [
	{
		id: "getting-started",
		title: "Getting Started",
		description: "Learn the basics of Deal Scale",
		icon: <BookOpen className="h-6 w-6" />,
		color: "bg-blue-500",
		options: [
			{
				id: "quick-start-demo",
				title: "Interactive Demo",
				description: "Watch our step-by-step demo",
				type: "demo",
				demoId: "cmgpmix8616ou12sxl6bxk80s",
			},
			{
				id: "platform-overview",
				title: "Platform Overview",
				description: "Understanding the Deal Scale interface",
				type: "video",
				url: "https://www.youtube.com/watch?v=hyosynoNbSU",
			},
		],
	},
	{
		id: "campaigns",
		title: "Campaigns",
		description: "Create and manage campaigns",
		icon: <Target className="h-6 w-6" />,
		color: "bg-green-500",
		options: [
			{
				id: "create-campaign",
				title: "Creating Campaigns",
				description: "Step-by-step campaign creation",
				type: "demo",
				demoId: "campaign-demo-id", // Replace with actual demo ID
			},
			{
				id: "campaign-settings",
				title: "Campaign Settings",
				description: "Configure your campaign parameters",
				type: "guide",
				url: "/docs/campaigns/settings",
			},
		],
	},
	{
		id: "leads",
		title: "Lead Management",
		description: "Import and manage leads",
		icon: <Users className="h-6 w-6" />,
		color: "bg-purple-500",
		options: [
			{
				id: "import-leads",
				title: "Importing Leads",
				description: "How to import your lead data",
				type: "demo",
				demoId: "leads-import-demo", // Replace with actual demo ID
			},
			{
				id: "lead-search",
				title: "Lead Search",
				description: "Find and filter your leads",
				type: "guide",
				url: "/docs/leads/search",
			},
		],
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Track performance and insights",
		icon: <BarChart3 className="h-6 w-6" />,
		color: "bg-orange-500",
		options: [
			{
				id: "dashboard-overview",
				title: "Dashboard Analytics",
				description: "Understanding your dashboard metrics",
				type: "video",
				url: "https://www.youtube.com/watch?v=analytics-video", // Replace with actual video
			},
			{
				id: "reports",
				title: "Generating Reports",
				description: "Create custom reports",
				type: "guide",
				url: "/docs/analytics/reports",
			},
		],
	},
	{
		id: "integrations",
		title: "Integrations",
		description: "Connect your tools",
		icon: <Zap className="h-6 w-6" />,
		color: "bg-red-500",
		options: [
			{
				id: "api-setup",
				title: "API Integration",
				description: "Connect via API",
				type: "docs",
				url: "/docs/integrations/api",
			},
			{
				id: "webhooks",
				title: "Webhooks",
				description: "Set up webhook notifications",
				type: "guide",
				url: "/docs/integrations/webhooks",
			},
		],
	},
	{
		id: "support",
		title: "Support",
		description: "Get help and contact support",
		icon: <HelpCircle className="h-6 w-6" />,
		color: "bg-gray-500",
		options: [
			{
				id: "contact-support",
				title: "Contact Support",
				description: "Get help from our team",
				type: "docs",
				url: "/support",
			},
			{
				id: "faq",
				title: "FAQ",
				description: "Frequently asked questions",
				type: "docs",
				url: "/docs/faq",
			},
		],
	},
];

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const HelpModal: FC<HelpModalProps> = ({ isOpen, onClose }) => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [walkthroughUrl, setWalkthroughUrl] = useState("");
	const [walkthroughTitle, setWalkthroughTitle] = useState("");
	const [walkthroughSubtitle, setWalkthroughSubtitle] = useState("");

	if (!isOpen) return null;

	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
	};

	const handleOptionClick = (option: HelpOption) => {
		switch (option.type) {
			case "demo":
				if (option.demoId) {
					// Use Supademo SDK approach
					setWalkthroughUrl(
						`https://app.supademo.com/embed/${option.demoId}?embed_v=2&utm_source=embed`,
					);
					setWalkthroughTitle(option.title);
					setWalkthroughSubtitle(option.description);
					setShowWalkthrough(true);
				}
				break;
			case "video":
				if (option.url) {
					setWalkthroughUrl(option.url);
					setWalkthroughTitle(option.title);
					setWalkthroughSubtitle(option.description);
					setShowWalkthrough(true);
				}
				break;
			case "docs":
			case "guide":
				if (option.url) {
					window.open(option.url, "_blank");
				}
				break;
		}
	};

	const handleCloseWalkthrough = () => {
		setShowWalkthrough(false);
		setWalkthroughUrl("");
		setWalkthroughTitle("");
		setWalkthroughSubtitle("");
	};

	return (
		<>
			{/* Main Help Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
				<div className="w-full max-w-4xl rounded-lg bg-card p-6 shadow-lg">
					{/* Header */}
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-foreground">
								Help & Support
							</h2>
							<p className="text-muted-foreground">
								Choose a topic to get started
							</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="text-muted-foreground hover:text-foreground"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					{/* Help Categories Grid */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{helpCategories.map((category) => (
							<div key={category.id} className="space-y-3">
								{/* Category Button */}
								<button
									type="button"
									onClick={() => handleCategoryClick(category.id)}
									className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<div className="flex items-center space-x-3">
										<div
											className={`rounded-lg p-2 text-white ${category.color}`}
										>
											{category.icon}
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-foreground">
												{category.title}
											</h3>
											<p className="text-sm text-muted-foreground">
												{category.description}
											</p>
										</div>
									</div>
								</button>

								{/* Sub-options */}
								{selectedCategory === category.id && (
									<div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
										{category.options.map((option) => (
											<button
												type="button"
												key={option.id}
												onClick={() => handleOptionClick(option)}
												className="w-full rounded-md bg-muted p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												<div className="flex items-center space-x-2">
													<PlayCircle className="h-4 w-4 text-muted-foreground" />
													<div className="flex-1">
														<p className="text-sm font-medium text-foreground">
															{option.title}
														</p>
														<p className="text-xs text-muted-foreground">
															{option.description}
														</p>
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
						))}
					</div>

					{/* Footer */}
					<div className="mt-6 flex justify-end">
						<Button variant="outline" onClick={onClose} type="button">
							Close
						</Button>
					</div>
				</div>
			</div>

			{/* Walkthrough Modal for Demos/Videos */}
			<WalkthroughModal
				isOpen={showWalkthrough}
				onClose={handleCloseWalkthrough}
				videoUrl={walkthroughUrl}
				title={walkthroughTitle}
				subtitle={walkthroughSubtitle}
			/>
		</>
	);
};

export default HelpModal;
