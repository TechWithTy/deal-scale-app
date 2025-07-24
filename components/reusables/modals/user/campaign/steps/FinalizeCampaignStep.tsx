import { Button } from "@/components/ui/button";
import type { FC } from "react";

// * Step 3: Finalize Campaign
interface FinalizeCampaignStepProps {
	campaignName: string;
	setCampaignName: (name: string) => void;
	startDate: string;
	setStartDate: (date: string) => void;
	endDate: string;
	setEndDate: (date: string) => void;
	estimatedCredits: number;
	onLaunch: () => void;
	onBack: () => void;
}

const FinalizeCampaignStep: FC<FinalizeCampaignStepProps> = ({
	campaignName,
	setCampaignName,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	estimatedCredits,
	onLaunch,
	onBack,
}) => {
	// todo: Add UI for campaign details, date pickers, credit estimate, etc.
	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">Finalize Campaign</h2>
			{/* todo: Render campaign name, dates, and credit estimation UI */}
			<div className="mt-8 flex justify-between gap-2">
				<Button onClick={onBack} variant="ghost" type="button">
					Back
				</Button>
				<Button onClick={onLaunch} type="button">
					Launch Campaign
				</Button>
			</div>
		</div>
	);
};

export default FinalizeCampaignStep;
