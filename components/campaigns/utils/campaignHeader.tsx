"use client";
import { cn } from "@/lib/_utils";
import { useCampaignStore } from "@/lib/stores/campaigns"; // Import the Zustand store
import type {
	CallCampaign,
	SocialMediaCampaign,
	Stat,
} from "@/types/_dashboard/campaign"; // Types for campaigns
import { Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import StatCard from "./statCard";

import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { GHLTextMessageCampaign } from "@/types/goHighLevel/text";

import {
	MockUserProfile,
	mockUserProfile,
} from "@/constants/_faker/profile/userProfile";

import { HelpCircle } from "lucide-react";
const creditsRemaining =
	mockUserProfile && "subscription" in mockUserProfile
		? mockUserProfile.subscription.aiCredits.allotted -
			mockUserProfile.subscription.aiCredits.used
		: 0;

const CampaignHeader: React.FC = () => {
	const [activeIndex, setActiveIndex] = useState(0); // Track the currently animated card
	const [animationComplete, setAnimationComplete] = useState(false); // Track if the animation is completed
	const [activeFilter, setActiveFilter] = useState("all"); // Track the active filter

	const setCampaignType = useCampaignStore((state) => state.setCampaignType);
	const filterCampaignsByStatus = useCampaignStore(
		(state) => state.filterCampaignsByStatus,
	);
	// const filteredCampaigns = useCampaignStore(
	//   (state) => state.filteredCampaigns
	// ); // Filtered campaigns after applying the filter

	// Function to handle filter clicks
	const handleFilterClick = (filter: string) => {
		setActiveFilter(filter);
		filterCampaignsByStatus(
			filter as "all" | "scheduled" | "active" | "completed",
		);
	};

	// Function to handle card click and trigger campaign type change
	const handleCardClick = (statType: string) => {
		switch (statType) {
			case "email":
				setCampaignType("email");
				break;
			case "call":
				setCampaignType("call");
				break;
			case "text":
				setCampaignType("text");
				break;
			case "dm": // For social media campaigns
				setCampaignType("social");
				break;
			default:
				break;
		}
	};

	// Example past 24-hour data
	const past24HoursData = {
		totalConversations: 150,
		totalDMs: 120,
		totalTextCampaigns: 100,
		totalEmailCampaigns: 80,
		totalCalls: 70,
	};

	// Assume you have these arrays from your campaign data
	const socialCampaigns: SocialMediaCampaign[] = MockUserProfile
		? MockUserProfile.companyInfo.campaigns.socialCampaigns
		: []; // Replace with actual data
	const textCampaigns: GHLTextMessageCampaign[] = MockUserProfile
		? MockUserProfile.companyInfo.campaigns.textCampaigns
		: []; // Replace with actual data
	const emailCampaigns: EmailCampaign[] = MockUserProfile
		? MockUserProfile.companyInfo.campaigns.emailCampaigns
		: []; // Replace with actual data
	const callCampaigns: CallCampaign[] = MockUserProfile
		? MockUserProfile.companyInfo.campaigns.callCampaigns
		: []; // Replace with actual data

	// Calculate total campaigns, conversations, and actions
	const totalSocialCampaigns = socialCampaigns.length;
	const totalTextCampaigns = textCampaigns.length;
	const totalEmailCampaigns = emailCampaigns.length;
	const totalCallCampaigns = callCampaigns.length;

	// Calculate total conversations (sum of texts and emails)
	const totalTextMessages = textCampaigns.reduce(
		(sum, campaign) => sum + campaign.totalMessages,
		0,
	);
	const totalEmailMessages = emailCampaigns.reduce(
		(sum, campaign) => sum + campaign.emails.length,
		0,
	);
	const totalConversations = totalTextMessages + totalEmailMessages;

	// Calculate total campaigns across all types
	const totalCampaigns =
		totalSocialCampaigns +
		totalTextCampaigns +
		totalEmailCampaigns +
		totalCallCampaigns;

	// Calculate total calls (inbound + outbound)
	// const totalCalls = callCampaigns.reduce(
	//   (sum, campaign) => sum + campaign.calls,
	//   0
	// );

	// Aggregate other campaign data as needed (e.g., DMs)
	const totalDMs = socialCampaigns.reduce(
		(sum, campaign) => sum + campaign.actions.length,
		0,
	);

	const campaignFilters = [
		{ label: "All Campaigns", value: "all", color: "bg-gray-500" },
		{
			label: "Scheduled Campaigns",
			value: "scheduled",
			color: "bg-yellow-500",
		},
		{ label: "Active Campaigns", value: "active", color: "bg-green-500" },
		{ label: "Completed Campaigns", value: "completed", color: "bg-blue-500" },
	];

	// Now define your `stats` array
	const stats: (Stat & { comingSoon?: boolean })[] = [
		{
			title: "Total Campaigns",
			value: totalCampaigns,
			statType: "total",
			click: false,
		},
		{
			title: "Total Conversations",
			value: totalConversations,
			statType: "conversations",
			click: false,
			past24hours: past24HoursData.totalConversations,
		},
		{
			title: "Total Call Campaigns",
			value: totalCallCampaigns,
			statType: "call",
			click: true,
			past24hours: past24HoursData.totalCalls,
		},
		{
			title: "Total Text Campaigns",
			value: totalTextCampaigns,
			statType: "text",
			click: true,
			past24hours: past24HoursData.totalTextCampaigns,
		},
		{
			title: "Total Social Campaigns",
			value: totalDMs,
			statType: "dm",
			click: true,
			past24hours: past24HoursData.totalDMs,
			comingSoon: true, // ! Show overlay
		},
		{
			title: "Total Email Campaigns",
			value: totalEmailCampaigns,
			statType: "email",
			click: true,
			past24hours: past24HoursData.totalEmailCampaigns,
			comingSoon: true, // ! Show overlay
		},
	];

	useEffect(() => {
		// Check if the animation has already been completed from localStorage
		const isAnimationComplete =
			localStorage.getItem("animationComplete") === "true";

		// If animation is already complete, no need to run the effect
		if (isAnimationComplete) {
			setAnimationComplete(true); // Skip the animation
			return;
		}

		let currentIndex = 2; // Start from the third card (skip the first two)

		const interval = setInterval(() => {
			// Update active index
			setActiveIndex(currentIndex);

			// Stop the loop after reaching the last card
			if (currentIndex === stats.length - 1) {
				clearInterval(interval);

				// Let the last card animate for 3 more seconds
				setTimeout(() => {
					setAnimationComplete(true); // Mark animation as complete

					// Store the completion state in localStorage
					localStorage.setItem("animationComplete", "true");
				}, 3000); // Keep the last card animated for 3 seconds
			} else {
				currentIndex++; // Increment index for the next card
			}
		}, 3000); // Switch active card every 3 seconds

		return () => clearInterval(interval); // Cleanup interval on unmount
	}, [stats.length]);

	return (
		<div className="p-4">
			<div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
				<div className="flex-1 space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Campaigns
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						Create, manage, and analyze multi-channel campaigns. View
						performance metrics, segment audiences, and download leads.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						if (typeof window !== "undefined") {
							window.dispatchEvent(new Event("dealScale:helpFab:show"));
						}
					}}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label="Show help and demo"
				>
					<HelpCircle className="h-5 w-5" />
				</button>
			</div>

			{/* Credits Remaining */}
			<div className="mb-4 text-center sm:text-left">
				<div className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
					<span className="text-sm text-muted-foreground">
						Credits Remaining:
					</span>
					<span className="font-semibold text-foreground text-lg">
						{creditsRemaining}
					</span>
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative mb-4">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 transform text-muted-foreground" />
				<input
					type="text"
					placeholder="Search"
					className="w-full rounded-md border border-input bg-transparent px-4 py-2 pl-10 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>

			{/* Campaign Filter Buttons */}
			<div className="mb-4 flex w-full flex-wrap gap-2 sm:gap-4">
				{campaignFilters.map((filter) => {
					const isActive = activeFilter === filter.value;
					return (
						<button
							key={filter.label}
							type="button"
							onClick={() => handleFilterClick(filter.value)}
							className={cn(
								"flex w-full min-w-[120px] max-w-full items-center justify-center rounded-md px-3 py-2 transition-colors duration-150 sm:w-1/4 sm:min-w-0",
								isActive ? "bg-muted" : "bg-muted/50",
							)}
							style={{ flex: "1 1 45%" }}
						>
							<span className={cn("h-2 w-2 rounded-full", filter.color)} />
							<span className="ml-2 truncate text-xs sm:text-sm">
								{filter.label}
							</span>
						</button>
					);
				})}
			</div>

			{/* Statistics Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{stats.map((stat, index) => (
					<StatCard
						key={stat.title}
						title={stat.title}
						addedToday={stat.past24hours}
						value={stat.value}
						onClick={() => handleCardClick(stat.statType)}
						isActive={index === activeIndex}
						click={stat.click}
						animationComplete={animationComplete}
						comingSoon={stat.comingSoon}
					/>
				))}
			</div>
		</div>
	);
};

export default CampaignHeader;
