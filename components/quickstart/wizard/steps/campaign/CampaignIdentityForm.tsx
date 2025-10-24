"use client";

import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { shallow } from "zustand/shallow";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

type CampaignCreationSlice = ReturnType<typeof useCampaignCreationStore>;
type PrimaryChannelOption = NonNullable<
	CampaignCreationSlice["primaryChannel"]
>;

const CHANNEL_OPTIONS: Array<{ value: PrimaryChannelOption; label: string }> = [
	{ value: "call", label: "Phone Calls" },
	{ value: "text", label: "Text Messaging" },
	{ value: "email", label: "Email Outreach" },
	{ value: "social", label: "Social DMs" },
	{ value: "directmail", label: "Direct Mail" },
];

const CampaignIdentityForm = () => {
	const { campaignName, setCampaignName, primaryChannel, setPrimaryChannel } =
		useCampaignCreationStore(
			(state) => ({
				campaignName: state.campaignName,
				setCampaignName: state.setCampaignName,
				primaryChannel: state.primaryChannel,
				setPrimaryChannel: state.setPrimaryChannel,
			}),
			shallow,
		);

	const placeholder = useMemo(
		() => (campaignName ? undefined : "e.g. Phoenix Sellers Spring Blitz"),
		[campaignName],
	);

	return (
		<Card>
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<CardTitle className="text-xl">Campaign Identity</CardTitle>
					<CardDescription>
						Name the initiative and select the channel that should anchor
						outreach.
					</CardDescription>
				</div>
				<ClipboardList className="hidden h-10 w-10 text-primary sm:block" />
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="campaign-name" className="text-sm font-medium">
						Campaign name
					</Label>
					<Input
						id="campaign-name"
						value={campaignName}
						onChange={(event) => setCampaignName(event.target.value)}
						placeholder={placeholder}
					/>
				</div>
				<div className="space-y-2">
					<Label className="text-sm font-medium">Primary channel</Label>
					<Select
						value={primaryChannel ?? undefined}
						onValueChange={(value) =>
							setPrimaryChannel(value as PrimaryChannelOption)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose a channel" />
						</SelectTrigger>
						<SelectContent>
							{CHANNEL_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
};

export default CampaignIdentityForm;
