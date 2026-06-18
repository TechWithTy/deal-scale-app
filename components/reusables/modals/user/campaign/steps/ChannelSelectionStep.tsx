import { Button } from "@/components/ui/button";
import {
	type CampaignPrimaryChannel,
	useCampaignCreationStore,
} from "@/lib/stores/campaignCreation";
import type { FC } from "react";
import { toast } from "sonner";

// * Step 1: Channel Selection
type ChannelOption = Exclude<CampaignPrimaryChannel, "email" | "social">;

const channelLabels: Record<ChannelOption, string> = {
	call: "Calls",
	text: "Text",
	directmail: "Direct Mail",
	linkedin: "LinkedIn",
	facebook: "Facebook",
};

interface ChannelSelectionStepProps {
	onNext: () => void;
	onClose: () => void;
	allChannels: ChannelOption[];
	disabledChannels?: ChannelOption[];
}

const ChannelSelectionStep: FC<ChannelSelectionStepProps> = ({
	onNext,
	onClose,
	allChannels,
	disabledChannels = [],
}) => {
	const { primaryChannel, setPrimaryChannel } = useCampaignCreationStore();
	const validateChannel = () => !!primaryChannel;

	const handleNextStep = () => {
		if (validateChannel()) {
			onNext();
		} else {
			toast("Please select a primary channel.");
		}
	};

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">Select Primary Channel</h2>
			<div className="mb-4 flex flex-col gap-3">
				{allChannels.map((channel) => {
					const isDisabled = disabledChannels.includes(channel);
					return (
						<Button
							key={channel}
							onClick={() => !isDisabled && setPrimaryChannel(channel)}
							variant={
								primaryChannel === channel ||
								(primaryChannel === "email" && channel === "directmail") ||
								(primaryChannel === "social" && channel === "linkedin")
									? "default"
									: "outline"
							}
							className="flex items-center justify-between"
							disabled={isDisabled}
							type="button"
						>
							<span>{channelLabels[channel]}</span>
							{isDisabled && (
								<span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-gray-500 text-xs">
									Coming Soon
								</span>
							)}
						</Button>
					);
				})}
			</div>
			<div className="flex justify-end gap-2">
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
