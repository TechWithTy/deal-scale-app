import { useState } from "react";
import ChannelCustomizationStep from "./steps/ChannelCustomizationStep";
import ChannelSelectionStep from "./steps/ChannelSelectionStep";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";

// * Centralized Campaign Main Component
const allChannels = ["phone", "email", "twitter", "instagram", "linkedin"];

const CampaignModalMain = () => {
	// * Centralized state for all steps
	const [step, setStep] = useState(0);
	const [primaryChannel, setPrimaryChannel] = useState("");
	const [campaignName, setCampaignName] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [estimatedCredits, setEstimatedCredits] = useState(0);

	// todo: Add more state for phone/email/social customization as needed

	// * Step navigation handlers
	const nextStep = () => setStep((s) => s + 1);
	const prevStep = () => setStep((s) => Math.max(0, s - 1));
	const closeModal = () => {
		// todo: Implement modal close logic
	};
	const launchCampaign = () => {
		// todo: Implement campaign launch logic
	};

	return (
		<div className="mx-auto w-full max-w-xl">
			{step === 0 && (
				<ChannelSelectionStep
					primaryChannel={primaryChannel}
					setPrimaryChannel={setPrimaryChannel}
					onNext={nextStep}
					onClose={closeModal}
					allChannels={allChannels}
				/>
			)}
			{step === 1 && (
				<ChannelCustomizationStep
					primaryChannel={primaryChannel}
					// todo: Pass phone/email/social customization props
					onNext={nextStep}
					onBack={prevStep}
				/>
			)}
			{step === 2 && (
				<FinalizeCampaignStep
					campaignName={campaignName}
					setCampaignName={setCampaignName}
					startDate={startDate}
					setStartDate={setStartDate}
					endDate={endDate}
					setEndDate={setEndDate}
					estimatedCredits={estimatedCredits}
					onLaunch={launchCampaign}
					onBack={prevStep}
				/>
			)}
		</div>
	);
};

export default CampaignModalMain;
