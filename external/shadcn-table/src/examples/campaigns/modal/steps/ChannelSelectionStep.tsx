import { Button } from "@/components/ui/button";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import type { FC } from "react";
import { toast } from "sonner";
import { FeatureGuard } from "../../../../../../../components/access/FeatureGuard";

interface ChannelSelectionStepProps {
	onNext: () => void;
	onClose: () => void;
	allChannels: ("directmail" | "call" | "text" | "linkedin" | "facebook")[];
	disabledChannels?: (
		| "directmail"
		| "call"
		| "text"
		| "linkedin"
		| "facebook"
	)[];
}

type StoreChannel =
	| "email"
	| "call"
	| "text"
	| "linkedin"
	| "facebook"
	| "social";
type UiChannel = "directmail" | "call" | "text" | "linkedin" | "facebook";

const channelLabels: Record<UiChannel, string> = {
	call: "Calls",
	text: "Text",
	directmail: "Direct Mail",
	linkedin: "LinkedIn",
	facebook: "Facebook",
};

const toUi = (channel: StoreChannel | null): UiChannel | null => {
	if (channel === "email") return "directmail";
	if (channel === "social") return "linkedin";
	return channel;
};

const toStore = (channel: UiChannel): StoreChannel =>
	channel === "directmail" ? "email" : channel;

const ChannelSelectionStep: FC<ChannelSelectionStepProps> = ({
	onNext,
	onClose,
	allChannels,
	disabledChannels = [],
}) => {
	const { primaryChannel, setPrimaryChannel } = useCampaignCreationStore();
	const validateChannel = () => {
		if (!primaryChannel) return false;

		// Check if the selected channel is blocked
		// Convert store channel to UI channel for comparison
		const storeChannel = primaryChannel as StoreChannel;
		const uiChannel = toUi(storeChannel);
		const isBlockedChannel =
			uiChannel === "directmail" ||
			uiChannel === "linkedin" ||
			uiChannel === "facebook";

		// For now, allow selection of blocked channels (they'll show overlay)
		// In the future, this could prevent progression if needed
		return true;
	};

	const handleNextStep = () => {
		if (validateChannel()) {
			onNext();
		} else {
			toast("Please select a primary channel.");
		}
	};

	const handleBlockedClick = (reason: "tier" | "permission" | "quota") => {
		console.log(`Channel blocked due to: ${reason}`);
		// The FeatureGuard component will handle the actual actions (opening URLs, etc.)
	};

	return (
		<div className="mx-auto w-full max-w-md" data-tour="campaign-channel-step">
			<h2 className="mb-6 font-semibold text-xl">Select Primary Channel</h2>
			<div
				className="mb-6 flex flex-col gap-3"
				data-tour="campaign-channel-options"
			>
				{allChannels.map((channel) => {
					// Normalize store channel (which uses 'email' for direct mail) to UI channel label
					const storePrimary = primaryChannel as StoreChannel | null;
					const uiPrimary: UiChannel | null = toUi(storePrimary);
					const isActive = uiPrimary === channel;

					// Only apply feature blocking to direct mail and social media
					const needsFeatureBlock =
						channel === "directmail" ||
						channel === "linkedin" ||
						channel === "facebook";

					// Create tab button content with enhanced styling for blocked features
					const handleChannelClick = () => {
						// Always set the primary channel, even for blocked features (for UI state)
						(setPrimaryChannel as (c: StoreChannel) => void)(toStore(channel));
					};

					const compact =
						typeof window !== "undefined" && window.innerWidth < 640;
					const inactiveClass = needsFeatureBlock
						? `bg-gradient-to-r from-muted/50 to-muted/30 border-orange-200/50 hover:from-orange-50/50 hover:to-orange-50/30 hover:border-orange-300/70 hover:shadow-sm ${
								compact ? "py-2 text-sm" : "py-3"
							}`
						: `hover:bg-muted/80 hover:shadow-sm ${
								compact ? "py-2 text-sm" : "py-3"
							}`;
					const buttonClassName = `flex items-center justify-between capitalize transition-all duration-200 w-full ${
						isActive
							? "bg-primary text-primary-foreground shadow-md"
							: inactiveClass
					}`;
					const labelClassName = `${needsFeatureBlock ? "text-foreground/70" : ""} ${
						compact ? "text-sm" : ""
					}`;

					if (needsFeatureBlock) {
						return (
							<FeatureGuard
								key={channel}
								featureKey={
									channel === "directmail"
										? "campaigns.createCampaign.directMail"
										: "campaigns.createCampaign.socialMedia"
								}
								showPopover={true}
								orientation="vertical"
								iconOnly={true}
								onBlockedClick={handleBlockedClick}
							>
								<Button
									onClick={handleChannelClick}
									variant={isActive ? "default" : "outline"}
									className={buttonClassName}
									type="button"
								>
									<span className={labelClassName}>
										{channelLabels[channel]}
									</span>
									<span
										className={`opacity-60 ${compact ? "text-xs" : "text-xs"}`}
										title="Premium Feature"
									>
										✨
									</span>
								</Button>
							</FeatureGuard>
						);
					}

					return (
						<Button
							key={channel}
							onClick={handleChannelClick}
							variant={isActive ? "default" : "outline"}
							className={buttonClassName}
							type="button"
						>
							<span className={labelClassName}>{channelLabels[channel]}</span>
						</Button>
					);
				})}
			</div>
			<div
				className="mt-8 flex justify-end gap-3"
				data-tour="campaign-channel-next"
			>
				<Button onClick={onClose} variant="ghost" type="button">
					Cancel
				</Button>
				<Button onClick={handleNextStep} type="button">
					Next
				</Button>
			</div>
		</div>
	);
};

export default ChannelSelectionStep;
