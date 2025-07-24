import { Button } from "@/components/ui/button";
import type { FC } from "react";
import { toast } from "sonner";

// * Step 1: Channel Selection
interface ChannelSelectionStepProps {
	onNext: () => void;
	onClose: () => void;
	allChannels: ("email" | "call" | "text" | "social")[];
	disabledChannels?: ("email" | "call" | "text" | "social")[];
}

import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

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
							variant={primaryChannel === channel ? "default" : "outline"}
							className="flex items-center justify-between capitalize"
							disabled={isDisabled}
							type="button"
						>
							<span>{channel}</span>
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
