import { Button } from "@/components/ui/button";
import type { FC } from "react";
import { toast } from "sonner";

// * Step 1: Channel Selection
interface ChannelSelectionStepProps {
	primaryChannel: string;
	setPrimaryChannel: (channel: string) => void;
	onNext: () => void;
	onClose: () => void;
	allChannels: string[];
}

const ChannelSelectionStep: FC<ChannelSelectionStepProps> = ({
	primaryChannel,
	setPrimaryChannel,
	onNext,
	onClose,
	allChannels,
}) => {
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
				{allChannels.map((channel) => (
					<Button
						key={channel}
						onClick={() => setPrimaryChannel(channel)}
						variant={primaryChannel === channel ? "default" : "outline"}
						className="capitalize"
						type="button"
					>
						{channel}
					</Button>
				))}
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
