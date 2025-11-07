"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCampaignStore } from "@/lib/stores/campaigns";
import type {
	CallCampaign,
	DirectMailCampaign,
} from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import { Mail, MessageSquare, Phone, Search, Send, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

type CampaignRecord = CallCampaign | EmailCampaign | DirectMailCampaign;
type CampaignChannel = "all" | "call" | "text" | "social" | "email" | "direct";

interface CampaignSelectorModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (campaign: CampaignRecord) => void;
}

const campaignTypeIcons = {
	call: Phone,
	text: MessageSquare,
	social: Share2,
	email: Mail,
	direct: Send,
};

const campaignTypeLabels = {
	call: "Call",
	text: "Text",
	social: "Social",
	email: "Email",
	direct: "Direct Mail",
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "delivering":
		case "active":
			return "bg-blue-500 text-white";
		case "completed":
			return "bg-green-600 text-white";
		case "pending":
		case "queued":
			return "bg-yellow-500 text-white";
		case "paused":
			return "bg-gray-600 text-white";
		default:
			return "bg-red-600 text-white";
	}
};

const getCampaignType = (campaign: CampaignRecord): CampaignChannel => {
	if ("callInformation" in campaign) return "call";
	if ("emails" in campaign) return "email";
	if ("sentCount" in campaign && "listCount" in campaign) return "direct";
	return "social";
};

export function CampaignSelectorModal({
	isOpen,
	onOpenChange,
	onSelect,
}: CampaignSelectorModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<CampaignChannel>("all");

	// Get campaigns from store
	const { campaignsByType } = useCampaignStore();

	// Flatten all campaigns into a single array
	const allCampaigns = useMemo<CampaignRecord[]>(() => {
		return [
			...campaignsByType.call,
			...campaignsByType.text,
			...campaignsByType.social,
			...campaignsByType.email,
			...campaignsByType.direct,
		];
	}, [campaignsByType]);

	// Filter campaigns
	const filteredCampaigns = useMemo(() => {
		let campaigns = allCampaigns;

		// Apply type filter
		if (typeFilter !== "all") {
			campaigns = campaigns.filter((c) => getCampaignType(c) === typeFilter);
		}

		// Apply search query
		if (searchQuery) {
			campaigns = campaigns.filter((c) =>
				c.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		return campaigns;
	}, [allCampaigns, typeFilter, searchQuery]);

	const handleSelect = (campaign: CampaignRecord) => {
		onSelect(campaign);
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Select Campaign for A/B Test</DialogTitle>
					<DialogDescription>
						Choose an existing campaign to create a variant for A/B testing.
						Click on any campaign to select it.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Filter Dropdown */}
					<div className="flex items-center gap-3">
						<label
							htmlFor="type-filter"
							className="whitespace-nowrap font-medium text-sm"
						>
							Campaign Type:
						</label>
						<Select
							value={typeFilter}
							onValueChange={(value) => setTypeFilter(value as CampaignChannel)}
						>
							<SelectTrigger id="type-filter" className="w-[200px]">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="call">Call</SelectItem>
								<SelectItem value="text">Text</SelectItem>
								<SelectItem value="social">Social</SelectItem>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="direct">Direct Mail</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Campaign List */}
					<div className="rounded-lg border bg-card">
						<div className="border-b px-3 py-2">
							<div className="flex items-center gap-2">
								<Search className="h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Search campaigns..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
								/>
							</div>
						</div>
						<div className="max-h-[400px] overflow-y-auto p-2">
							{filteredCampaigns.length === 0 ? (
								<div className="py-6 text-center text-muted-foreground text-sm">
									No campaigns found.
								</div>
							) : (
								<div className="space-y-1">
									{filteredCampaigns.map((campaign) => {
										const type = getCampaignType(campaign);
										const Icon = campaignTypeIcons[type];
										const statusColor = getStatusColor(campaign.status);

										return (
											<button
												key={campaign.id}
												onClick={() => handleSelect(campaign)}
												className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
											>
												<div className="flex min-w-0 flex-1 items-center gap-3">
													<div
														className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10`}
													>
														<Icon className="h-5 w-5 flex-shrink-0 text-primary" />
													</div>
													<div className="min-w-0 flex-1">
														<div className="truncate font-semibold text-foreground">
															{campaign.name}
														</div>
														<div className="text-muted-foreground text-xs">
															{campaignTypeLabels[type]} Campaign
														</div>
													</div>
												</div>
												<div className="flex flex-shrink-0 items-center gap-2">
													<span
														className={`rounded-full px-3 py-1.5 font-semibold text-xs uppercase tracking-wide ${statusColor}`}
													>
														{campaign.status}
													</span>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
