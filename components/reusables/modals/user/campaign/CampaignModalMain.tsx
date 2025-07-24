import { useState, useEffect } from "react";
import ChannelCustomizationStep from "./steps/ChannelCustomizationStep";
import ChannelSelectionStep from "./steps/ChannelSelectionStep";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";
import { TimingPreferencesStep } from "./steps/TimingPreferencesStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation"; // Zustand campaign creation store
import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogPortal,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// * Centralized Campaign Main Component
const allChannels: ("email" | "call" | "text" | "social")[] = [
	"call",
	"text",
	"email",
	"social",
];
const disabledChannels: ("email" | "call" | "text" | "social")[] = [
	"email",
	"social",
];

const CampaignModalMain = () => {
	// * Zustand campaign creation store
	const {
		primaryChannel,
		setPrimaryChannel,
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		campaignArea,
		setCampaignArea,
		leadCount,
		setLeadCount,
		daysSelected,
		setDaysSelected,
		reachBeforeBusiness,
		reachAfterBusiness,
		reachOnWeekend,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		reset,
	} = useCampaignCreationStore();

	// Helper to count only weekdays (Mon-Fri) between two dates
	function countWeekdays(start: Date, end: Date): number {
		let count = 0;
		const current = new Date(start);
		while (current <= end) {
			const day = current.getDay();
			if (day !== 0 && day !== 6) count++;
			current.setDate(current.getDate() + 1);
		}
		return count;
	}

	const days =
		startDate && endDate
			? Math.max(
					1,
					Math.ceil(
						(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
					) + 1,
				)
			: 0;

	// Use reachOnWeekend (from Zustand) for all weekend logic
	// Apply 35% increase/decrease to the number of days, not credits
	const mutatedDays =
		days > 0 ? Math.round(days * (reachOnWeekend ? 1.35 : 1)) : 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setDaysSelected(mutatedDays);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mutatedDays, reachOnWeekend]);

	const estimatedCredits =
		leadCount > 0 && mutatedDays > 0 ? Math.round(leadCount * mutatedDays) : 0;

	// * Modal open state
	const [open, setOpen] = useState(true);
	const [step, setStep] = useState(0);

	// * Step navigation handlers
	const nextStep = () => setStep((s) => s + 1);
	const prevStep = () => setStep((s) => Math.max(0, s - 1));
	const closeModal = () => setOpen(false);
	const launchCampaign = () => {
		// todo: Implement campaign launch logic
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPortal>
				<DialogOverlay className="fixed inset-0 z-50 bg-black/40" />
				<DialogContent className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-xl rounded-lg bg-white p-6 shadow-lg focus:outline-none">
					<button
						onClick={closeModal}
						className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
						aria-label="Close"
						type="button"
					>
						<X size={20} />
					</button>
					{step === 0 && (
						<ChannelSelectionStep
							onNext={nextStep}
							onClose={closeModal}
							allChannels={
								allChannels as ("email" | "call" | "text" | "social")[]
							}
							disabledChannels={
								disabledChannels as ("email" | "call" | "text" | "social")[]
							}
						/>
					)}
					{step === 1 && (
						<ChannelCustomizationStep onNext={nextStep} onBack={prevStep} />
					)}
					{step === 2 && (
						<TimingPreferencesStep onBack={prevStep} onNext={nextStep} />
					)}
					<p style={{ color: "blue", fontSize: "12px" }}>
						DEBUG: leadCount={leadCount}, startDate={String(startDate)},
						endDate={String(endDate)}, days={days}, mutatedDays={mutatedDays},
						reachBeforeBusiness={String(reachBeforeBusiness)},
						reachAfterBusiness={String(reachAfterBusiness)}, reachOnWeekend=
						{String(reachOnWeekend)}, estimatedCredits={estimatedCredits}
					</p>
					{step === 3 && (
						<FinalizeCampaignStep
							onBack={prevStep}
							onLaunch={launchCampaign}
							estimatedCredits={estimatedCredits}
						/>
					)}
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};

export default CampaignModalMain;
