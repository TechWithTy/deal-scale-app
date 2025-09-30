import { Button } from "@/components/ui/button";
import type { FC } from "react";
import { toast } from "sonner";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { FeatureGuard } from "../../../../../../../components/access/FeatureGuard";

interface ChannelSelectionStepProps {
	onNext: () => void;
	onClose: () => void;
	allChannels: ("directmail" | "call" | "text" | "social")[];
	disabledChannels?: ("directmail" | "call" | "text" | "social")[];
}

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
		const storeChannel = primaryChannel as "email" | "call" | "text" | "social";
		const uiChannel: "directmail" | "call" | "text" | "social" = storeChannel === "email" ? "directmail" : storeChannel;
		const isBlockedChannel = uiChannel === "directmail" || uiChannel === "social";

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

	const handleBlockedClick = (reason: 'tier' | 'permission' | 'quota') => {
		console.log(`Channel blocked due to: ${reason}`);
		// The FeatureGuard component will handle the actual actions (opening URLs, etc.)
	};

	return (
		<div className={`w-full max-w-md mx-auto ${
			typeof window !== 'undefined' && window.innerWidth < 640 ? 'px-2' : 'px-4'
		}`}>
			<h2 className={`mb-4 font-semibold ${
				typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-base' : 'text-lg'
			}`}>
				Select Primary Channel
			</h2>
			<div className={`mb-4 flex flex-col gap-3 ${
				typeof window !== 'undefined' && window.innerWidth < 640 ? 'gap-2' : 'gap-3'
			}`}>
				{allChannels.map((channel) => {
					// Normalize store channel (which uses 'email' for direct mail) to UI channel label
					type StoreChannel = "email" | "call" | "text" | "social";
					type UiChannel = "directmail" | "call" | "text" | "social";
					const toUi = (c: StoreChannel | null): UiChannel | null =>
						c === "email" ? "directmail" : c;
					const toStore = (c: UiChannel): StoreChannel =>
						c === "directmail" ? "email" : c;

					const storePrimary = primaryChannel as StoreChannel | null;
					const uiPrimary: UiChannel | null = toUi(storePrimary);
					const isActive = uiPrimary === channel;

					// Only apply feature blocking to direct mail and social media
					const needsFeatureBlock = channel === "directmail" || channel === "social";

					// Create tab button content with enhanced styling for blocked features
					const handleChannelClick = () => {
						// Always set the primary channel, even for blocked features (for UI state)
						(setPrimaryChannel as (c: StoreChannel) => void)(
							toStore(channel),
						);
					};

					const button = (
						<Button
							key={channel}
							onClick={handleChannelClick}
							variant={isActive ? "default" : "outline"}
							className={`flex items-center justify-between capitalize transition-all duration-200 w-full ${
								isActive
									? "bg-primary text-primary-foreground shadow-md"
									: needsFeatureBlock
										? `bg-gradient-to-r from-muted/50 to-muted/30 border-orange-200/50 hover:from-orange-50/50 hover:to-orange-50/30 hover:border-orange-300/70 hover:shadow-sm ${
											typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-sm py-2' : 'py-3'
										}`
										: `hover:bg-muted/80 hover:shadow-sm ${
											typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-sm py-2' : 'py-3'
										}`
							}`}
							type="button"
						>
							<span className={`${needsFeatureBlock ? "text-foreground/70" : ""} ${
								typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-sm' : ''
							}`}>
								{channel}
							</span>
							{needsFeatureBlock && (
								<span className={`opacity-60 ${
									typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-xs' : 'text-xs'
								}`} title="Premium Feature">
									✨
								</span>
							)}
						</Button>
					);

					return needsFeatureBlock ? (
						<FeatureGuard
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
							{button}
						</FeatureGuard>
					) : (
						button
					);
				})}
			</div>
			<div className={`flex justify-end gap-2 ${
				typeof window !== 'undefined' && window.innerWidth < 640 ? 'gap-1' : 'gap-2'
			}`}>
				<Button
					onClick={onClose}
					variant="ghost"
					type="button"
					className={typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-sm px-3 py-1' : ''}
				>
					Cancel
				</Button>
				<Button
					onClick={handleNextStep}
					type="button"
					className={typeof window !== 'undefined' && window.innerWidth < 640 ? 'text-sm px-3 py-1' : ''}
				>
					Next
				</Button>
			</div>
		</div>
	);
};

export default ChannelSelectionStep;
