"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ChannelCustomizationStep, {
	TransferConditionalSchema,
	FormSchema,
} from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep";
import ChannelSelectionStep from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelSelectionStep";
import FinalizeCampaignStep from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/FinalizeCampaignStep";
import { TimingPreferencesStep } from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/TimingPreferencesStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { z } from "zod";
import CampaignSettingsDebug from "./CampaignSettingsDebug";

interface CampaignModalMainProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	initialLeadListId?: string;
	initialLeadListName?: string;
	initialLeadCount?: number;
	initialStep?: number;
	defaultChannel?: "call" | "text" | "social" | "directmail";
}

const allChannels: ("directmail" | "call" | "text" | "social")[] = [
	"call",
	"text",
	"directmail",
	"social",
];
const disabledChannels: ("directmail" | "call" | "text" | "social")[] = [];

export default function CampaignModalMain({
	isOpen,
	onOpenChange,
	initialLeadListId,
	initialLeadListName,
	initialLeadCount,
	initialStep = 0,
	defaultChannel,
}: CampaignModalMainProps) {
	const {
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		selectedLeadListAId,
		setSelectedLeadListAId,
		leadCount,
		setLeadCount,
		daysSelected,
		setDaysSelected,
		reachBeforeBusiness,
		reachAfterBusiness,
		reachOnWeekend,
		startDate,
		endDate,
		primaryChannel,
		setPrimaryChannel,
		campaignName,
		setCampaignName,
		abTestingEnabled,
		setAbTestingEnabled,
		isLeadListSelectionValid,
		reset,
	} = useCampaignCreationStore();

	const [step, setStep] = useState(initialStep);

	const customizationForm = useForm<z.input<typeof FormSchema>>({
		resolver: zodResolver(TransferConditionalSchema),
		defaultValues: {
			primaryPhoneNumber: "+11234567890",
			areaMode: areaMode || "leadList",
			selectedLeadListId: selectedLeadListId || "",
			templates: [],
			transferEnabled: true,
			transferType: "inbound_call",
			transferAgentId: "",
			transferGuidelines: "",
			transferPrompt: "",
			numberPoolingEnabled: false,
			senderPoolNumbersCsv: "",
			smartEncodingEnabled: true,
			optOutHandlingEnabled: true,
			perNumberDailyLimit: 75,
			messagingServiceSid: "",
			tcpaSourceLink: "",
			skipName: false,
			addressVerified: false,
			phoneVerified: false,
			emailAddress: "",
			emailVerified: false,
			possiblePhones: "",
			possibleEmails: "",
			possibleHandles: "",
		} as z.input<typeof FormSchema>,
	});

	const days = useMemo(() => {
		if (!startDate || !endDate) return 0;
		const diff =
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
			) + 1;
		return Math.max(diff, 1);
	}, [startDate, endDate]);

	const mutatedDays = useMemo(() => {
		if (days <= 0) return 0;
		return Math.round(days * (reachOnWeekend ? 1.35 : 1));
	}, [days, reachOnWeekend]);

	useEffect(() => {
		setDaysSelected(mutatedDays);
	}, [mutatedDays, setDaysSelected]);

	const estimatedCredits =
		leadCount > 0 && mutatedDays > 0 ? Math.round(leadCount * mutatedDays) : 0;

	useEffect(() => {
		if (!isOpen) {
			setStep(initialStep);
			return;
		}

		if (!primaryChannel && defaultChannel) {
			setPrimaryChannel(
				defaultChannel === "directmail" ? "email" : defaultChannel,
			);
		}

		if (initialLeadListId && initialLeadListId !== selectedLeadListId) {
			setAreaMode("leadList");
			setSelectedLeadListId(initialLeadListId);
			customizationForm.setValue("areaMode", "leadList");
			customizationForm.setValue("selectedLeadListId", initialLeadListId);
			if (abTestingEnabled && !selectedLeadListAId) {
				setSelectedLeadListAId(initialLeadListId);
			}
		}

		if (
			typeof initialLeadCount === "number" &&
			!Number.isNaN(initialLeadCount)
		) {
			setLeadCount(initialLeadCount);
		}

		if (initialLeadListName) {
			setCampaignName(`${initialLeadListName} Campaign`);
		}

		setStep(initialStep);
	}, [
		isOpen,
		initialLeadListId,
		initialLeadListName,
		initialLeadCount,
		initialStep,
		defaultChannel,
		primaryChannel,
		selectedLeadListId,
		abTestingEnabled,
		selectedLeadListAId,
		setAreaMode,
		setSelectedLeadListId,
		setSelectedLeadListAId,
		setPrimaryChannel,
		setLeadCount,
		setCampaignName,
		customizationForm,
	]);

	const closeModal = () => {
		reset();
		onOpenChange(false);
	};

	const nextStep = async () => {
		if (step === 1) {
			const isValid = await customizationForm.trigger();
			if (!isValid) return;
			if (
				areaMode === "leadList" &&
				abTestingEnabled &&
				!isLeadListSelectionValid()
			) {
				return;
			}
		}
		setStep((s) => s + 1);
	};

	const prevStep = () => setStep((s) => Math.max(0, s - 1));

	const launchCampaign = () => {
		// TODO: real launch logic
		closeModal();
	};

	const handleCreateAbTest = (label?: string) => {
		// Only create A/B test if explicitly requested
		console.log("Creating A/B test variant:", label);
		setAbTestingEnabled(true);
		const variantLabel = (label || "Variant B").trim();
		if (campaignName) {
			const base = campaignName.replace(/\s*\(Variant[^)]*\)$/i, "").trim();
			setCampaignName(`${base} (${variantLabel})`);
		}
		if (areaMode === "leadList" && selectedLeadListId && !selectedLeadListAId) {
			setSelectedLeadListAId(selectedLeadListId);
			setSelectedLeadListId("");
		}
		// Don't automatically go back to step 0 - let user continue with A/B setup
		// setStep(0);
	};

	useEffect(() => {
		if (!isOpen) {
			customizationForm.reset({
				primaryPhoneNumber: "+11234567890",
				areaMode: areaMode || "leadList",
				selectedLeadListId: selectedLeadListId || "",
				templates: [],
				transferEnabled: true,
				transferType: "inbound_call",
				transferAgentId: "",
				transferGuidelines: "",
				transferPrompt: "",
				numberPoolingEnabled: false,
				senderPoolNumbersCsv: "",
				smartEncodingEnabled: true,
				optOutHandlingEnabled: true,
				perNumberDailyLimit: 75,
				messagingServiceSid: "",
				tcpaSourceLink: "",
				skipName: false,
				addressVerified: false,
				phoneVerified: false,
				emailAddress: "",
				emailVerified: false,
				possiblePhones: "",
				possibleEmails: "",
				possibleHandles: "",
			} as z.input<typeof FormSchema>);
		}
	}, [isOpen, customizationForm, areaMode, selectedLeadListId]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex h-[85vh] max-h-[85vh] min-h-0 w-full max-w-xl flex-col gap-0 overflow-hidden rounded-xl border bg-background p-0 text-foreground shadow-lg outline-none">
				<div className="min-h-0 flex-1 overflow-y-auto bg-card px-6 pr-7 pb-6 text-card-foreground">
					{step === 0 && (
						<ChannelSelectionStep
							onNext={nextStep}
							onClose={closeModal}
							allChannels={allChannels}
							disabledChannels={disabledChannels}
						/>
					)}
					{step === 1 && (
						<ChannelCustomizationStep
							onNext={nextStep}
							onBack={prevStep}
							form={customizationForm}
							onCreateVariant={handleCreateAbTest}
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

					{/* Debug Log - Shows all selected campaign settings */}
					<CampaignSettingsDebug formData={customizationForm.getValues()} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
