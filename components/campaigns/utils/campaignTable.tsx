"use client";

import * as React from "react";
import CallCampaignsDemoTable from "../../../external/shadcn-table/src/examples/call-campaigns-demo-table";
import TextCampaignsDemoTable from "../../../external/shadcn-table/src/examples/text-campaigns-demo-table";
import SocialCampaignsDemoTable from "../../../external/shadcn-table/src/examples/social-campaigns-demo-table";
import DirectMailCampaignsDemoTable from "../../../external/shadcn-table/src/examples/direct-mail-campaigns-demo-table";
import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import CampaignModalMain from "../../../external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCampaignStore } from "@/lib/stores/campaigns";
import { shallow } from "zustand/shallow";
import type { CallCampaign } from "@/types/_dashboard/campaign";
import type { DirectMailCampaign } from "external/shadcn-table/src/examples/DirectMail/utils/mock";

export default function CampaignCallTablePage({
	urlParams,
}: {
	urlParams?: {
		type?: string | null;
		campaignId?: string | null;
	};
}) {
	type ParentTab = "calls" | "text" | "social" | "directMail";

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams?.toString() ?? "";

	// Always read from searchParams (hook), not urlParams (prop)
	const currentTypeParam = searchParams?.get("type") ?? urlParams?.type ?? null;
	const currentCampaignIdParam =
		searchParams?.get("campaignId") ?? urlParams?.campaignId ?? null;

	const tabToType = React.useMemo<
		Record<ParentTab, "call" | "text" | "social" | "direct">
	>(
		() => ({
			calls: "call",
			text: "text",
			social: "social",
			directMail: "direct",
		}),
		[],
	);

	// Map URL type parameter to tab
	const getInitialTab = React.useCallback((type?: string | null): ParentTab => {
		switch (type) {
			case "call":
				return "calls";
			case "text":
				return "text";
			case "social":
				return "social";
			case "direct":
				return "directMail";
			default:
				return "calls";
		}
	}, []);

	const [tab, setTab] = React.useState<ParentTab>(() =>
		getInitialTab(currentTypeParam),
	);

	const pushParams = React.useCallback(
		(nextTab: ParentTab, nextCampaignId?: string | null) => {
			const params = new URLSearchParams(searchParamsString);
			params.set("type", tabToType[nextTab]);
			if (nextCampaignId) {
				params.set("campaignId", nextCampaignId);
			} else {
				params.delete("campaignId");
			}
			const query = params.toString();
			router.push(query ? `${pathname}?${query}` : pathname);
		},
		[pathname, router, searchParamsString, tabToType],
	);

	const handleTabChange = React.useCallback(
		(next: ParentTab) => {
			setTab(next);
			pushParams(next, null);
		},
		[pushParams, tab],
	);

	const handleCampaignSelect = React.useCallback(
		(id: string) => {
			pushParams(tab, id);
		},
		[pushParams, tab],
	);

	// Update tab when URL params change ONLY if different from local state
	// This prevents race conditions where router.push hasn't updated searchParams yet
	React.useEffect(() => {
		// Only sync if we have a type param and it's different from current tab
		if (currentTypeParam && currentTypeParam !== tabToType[tab]) {
			const newTab = getInitialTab(currentTypeParam);
			setTab(newTab);
		}
	}, [currentTypeParam, tab, getInitialTab, tabToType]);
	const { callCampaigns, textCampaigns, socialCampaigns, directMailCampaigns } =
		useCampaignStore(
			React.useCallback(
				(state) => ({
					callCampaigns: state.campaignsByType.call,
					textCampaigns: state.campaignsByType.text,
					socialCampaigns: state.campaignsByType.social,
					directMailCampaigns: state.campaignsByType.direct,
				}),
				[],
			),
			shallow,
		);

	const memoizedCallCampaigns = React.useMemo<CallCampaign[]>(
		() => callCampaigns.map((campaign) => ({ ...campaign })),
		[callCampaigns],
	);

	const memoizedTextCampaigns = React.useMemo<CallCampaign[]>(
		() => textCampaigns.map((campaign) => ({ ...campaign })),
		[textCampaigns],
	);

	const memoizedSocialCampaigns = React.useMemo<CallCampaign[]>(
		() => socialCampaigns.map((campaign) => ({ ...campaign })),
		[socialCampaigns],
	);

	const memoizedDirectMailCampaigns = React.useMemo<DirectMailCampaign[]>(
		() => directMailCampaigns.map((campaign) => ({ ...campaign })),
		[directMailCampaigns],
	);

	const [isLeadModalOpen, setIsLeadModalOpen] = React.useState(false);
	const [isSkipTraceOpen, setIsSkipTraceOpen] = React.useState(false);
	const [isCampaignModalOpen, setIsCampaignModalOpen] = React.useState(false);
	const [skipTraceInit, setSkipTraceInit] = React.useState<
		{ type: "list"; file?: File } | { type: "single" } | undefined
	>(undefined);

	const handleBlockedClick = (reason: "tier" | "permission" | "quota") => {
		console.log(`Tab blocked due to: ${reason}`);
		// The FeatureGuard component will handle the actual actions (opening URLs, etc.)
	};

	// Tab configuration with feature blocking info
	const tabs = [
		{ key: "calls" as ParentTab, label: "Calls", featureKey: null },
		{ key: "text" as ParentTab, label: "Text", featureKey: null },
		{
			key: "social" as ParentTab,
			label: "Social",
			featureKey: "campaigns.table.socialMedia",
		},
		{
			key: "directMail" as ParentTab,
			label: "Direct Mail",
			featureKey: "campaigns.table.directMail",
		},
	];

	return (
		// ! Use full width with min-w-0 to prevent forcing layout wider than sidebar
		<div className="w-full min-w-0 p-4">
			{/* Enhanced Tab Navigation with Feature Blocking */}
			<div className="bg-muted flex gap-4 items-center justify-between mb-4 p-1 rounded-lg">
				<div className="flex items-center gap-2">
					{tabs.map(({ key, label, featureKey }) => {
						const isActive = tab === key;

						// Create tab button content
						const tabButton = (
							<Button
								key={key}
								type="button"
								variant={isActive ? "default" : "ghost"}
								size="sm"
								className={`relative ${isActive ? "" : "hover:bg-background/50"}`}
								onClick={() => handleTabChange(key)}
							>
								{label}
							</Button>
						);

						// Wrap with FeatureGuard if needed, but only show visual indicators
						if (featureKey) {
							return (
								<FeatureGuard
									key={key}
									featureKey={featureKey}
									modeOverride="overlay"
									wrapperClassName="inline-block"
									orientation="horizontal"
									iconOnly={true}
									onBlockedClick={handleBlockedClick}
								>
									{tabButton}
								</FeatureGuard>
							);
						}

						return <div key={key}>{tabButton}</div>;
					})}
				</div>

				{/* Create Campaign Button */}
				<Button
					type="button"
					size="sm"
					onClick={() => setIsCampaignModalOpen(true)}
					className="bg-primary hover:bg-primary/90"
				>
					Create Campaign
				</Button>
			</div>

			{/* Render tables directly; avoid creating an extra scroll container that breaks sticky */}
			{tab === "calls" && (
				<CallCampaignsDemoTable
					key="calls"
					onNavigate={handleTabChange}
					campaignId={currentCampaignIdParam}
					onCampaignSelect={handleCampaignSelect}
					initialCampaigns={memoizedCallCampaigns}
				/>
			)}
			{tab === "text" && (
				<TextCampaignsDemoTable
					key="text"
					onNavigate={handleTabChange}
					campaignId={currentCampaignIdParam}
					onCampaignSelect={handleCampaignSelect}
					initialCampaigns={memoizedTextCampaigns}
				/>
			)}
			{tab === "social" && (
				<FeatureGuard
					featureKey="campaigns.table.socialMedia"
					onBlockedClick={handleBlockedClick}
				>
					<SocialCampaignsDemoTable
						key="social"
						onNavigate={handleTabChange}
						campaignId={currentCampaignIdParam}
						onCampaignSelect={handleCampaignSelect}
						initialCampaigns={memoizedSocialCampaigns}
					/>
				</FeatureGuard>
			)}
			{tab === "directMail" && (
				<FeatureGuard
					featureKey="campaigns.table.directMail"
					onBlockedClick={handleBlockedClick}
				>
					<DirectMailCampaignsDemoTable
						key="directMail"
						onNavigate={handleTabChange}
						campaignId={currentCampaignIdParam}
						onCampaignSelect={handleCampaignSelect}
						initialCampaigns={memoizedDirectMailCampaigns}
					/>
				</FeatureGuard>
			)}
			{/* Modals */}
			<LeadMainModal
				isOpen={isLeadModalOpen}
				onClose={() => setIsLeadModalOpen(false)}
			/>
			<SkipTraceModalMain
				isOpen={isSkipTraceOpen}
				onClose={() => setIsSkipTraceOpen(false)}
				initialData={skipTraceInit}
			/>
			{/* Campaign Creation Modal */}
			<CampaignModalMain
				open={isCampaignModalOpen}
				onOpenChange={setIsCampaignModalOpen}
			/>
		</div>
	);
}
