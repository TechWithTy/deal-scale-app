import { Button } from "@/components/ui/button";
import type { FC } from "react";

// * Step 2: Channel Customization
interface ChannelCustomizationStepProps {
	primaryChannel: string;
	phoneNumber?: string | null;
	email?: string | null;
	socialAccounts?: string[];
	onConnectAccount?: (platform: string) => void;
	onNext: () => void;
	onBack: () => void;
}

const ChannelCustomizationStep: FC<ChannelCustomizationStepProps> = ({
	primaryChannel,
	phoneNumber = null,
	email = null,
	socialAccounts = [],
	onConnectAccount,
	onNext,
	onBack,
}) => {
	// todo: Add UI for customizing the selected channel (phone, email, social, etc.)
	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">
				Customize Channel: {primaryChannel}
			</h2>
			{/* todo: Render channel-specific customization fields */}
			<div className="mt-8 flex justify-between gap-2">
				<Button onClick={onBack} variant="ghost" type="button">
					Back
				</Button>
				<Button onClick={onNext} type="button">
					Next
				</Button>
			</div>
		</div>
	);
};

export default ChannelCustomizationStep;
