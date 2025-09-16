import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import ChannelCustomizationStep, {
	FormSchema,
} from "./steps/ChannelCustomizationStep";
import ChannelSelectionStep from "./steps/ChannelSelectionStep";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";
import { TimingPreferencesStep } from "./steps/TimingPreferencesStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation"; // Zustand campaign creation store
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

	// * Form for ChannelCustomizationStep
	const customizationForm = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			primaryPhoneNumber: mockUserProfile?.personalNum ?? "",
			areaMode: areaMode || "leadList",
			selectedLeadListId: selectedLeadListId || "",
		},
	});

	// * Step navigation handlers
	const nextStep = async () => {
		if (step === 1) {
			console.log("Validating form data:", customizationForm.getValues());
			const isValid = await customizationForm.trigger();
			if (!isValid) {
				console.error(
					"Validation failed. Errors:",
					customizationForm.formState.errors,
				);
				return; // * Don't advance if validation fails
			}
		}
		setStep((s) => s + 1);
	};
	const prevStep = () => setStep((s) => Math.max(0, s - 1));
	const closeModal = () => setOpen(false);
	const launchCampaign = () => {
		// todo: Implement campaign launch logic
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="w-full max-w-xl bg-card p-0 text-card-foreground shadow-lg sm:rounded-lg">
				<button
					onClick={closeModal}
					className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
					aria-label="Close"
					type="button"
				>
					<X size={20} />
				</button>
				<div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pr-7 bg-card text-card-foreground">
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
						<ChannelCustomizationStep
							onNext={nextStep}
							onBack={prevStep}
							form={customizationForm}
						/>
					)}
					{step === 2 && (
						<TimingPreferencesStep onBack={prevStep} onNext={nextStep} />
					)}
					{step === 3 && (
						<FinalizeCampaignStep
							onBack={prevStep}
							onLaunch={launchCampaign}
							estimatedCredits={estimatedCredits}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CampaignModalMain;
