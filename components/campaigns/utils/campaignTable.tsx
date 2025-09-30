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

export default function CampaignCallTablePage() {
	type ParentTab = "calls" | "text" | "social" | "directMail";
	const [tab, setTab] = React.useState<ParentTab>("calls");
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
			<div className="mb-2 text-muted-foreground text-xs">Active: {tab}</div>
			<div className="mb-3 flex items-center justify-between gap-3">
				<h2 className="font-semibold text-xl">
					{tab === "calls" && "Page: Calls Demo"}
					{tab === "text" && "Page: Text Demo"}
					{tab === "social" && "Page: Social Demo"}
				</h2>
				{/* Create Campaign button is rendered inside each example header to keep placement consistent */}
			</div>

			{/* Enhanced Tab Navigation with Feature Blocking */}
			<div className="mb-4 flex items-center justify-between gap-4 p-1 bg-muted rounded-lg">
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
								onClick={() => setTab(key)}
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
					onNavigate={(next: ParentTab) => setTab(next)}
				/>
			)}
			{tab === "text" && (
				<TextCampaignsDemoTable
					key="text"
					onNavigate={(next: ParentTab) => setTab(next)}
				/>
			)}
			{tab === "social" && (
				<FeatureGuard
					featureKey="campaigns.table.socialMedia"
					onBlockedClick={handleBlockedClick}
				>
					<SocialCampaignsDemoTable
						key="social"
						onNavigate={(next: ParentTab) => setTab(next)}
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
						onNavigate={(next: ParentTab) => setTab(next)}
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
