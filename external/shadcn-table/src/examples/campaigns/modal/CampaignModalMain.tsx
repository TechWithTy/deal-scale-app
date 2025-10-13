"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import ChannelCustomizationStep, {
	TransferConditionalSchema,
	type FormSchema,
} from "./steps/ChannelCustomizationStep";
import ChannelSelectionStep from "./steps/ChannelSelectionStep";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";
import { TimingPreferencesStep } from "./steps/TimingPreferencesStep";

// * Centralized Campaign Main Component
const allChannels: ("directmail" | "call" | "text" | "social")[] = [
	"call",
	"text",
	"directmail",
	"social",
];
const disabledChannels: ("directmail" | "call" | "text" | "social")[] = [];

const DEFAULT_CUSTOMIZATION_VALUES: z.input<typeof FormSchema> = {
	primaryPhoneNumber: "+11234567890",
	areaMode: "leadList",
	selectedLeadListId: "",
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
};

export default function CampaignModalMain({
	open: controlledOpen,
	onOpenChange,
	defaultChannel,
	initialLeadListId,
	initialLeadListName,
	initialLeadCount,
	initialStep = 0,
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultChannel?: "directmail" | "call" | "text" | "social";
	initialLeadListId?: string;
	initialLeadListName?: string;
	initialLeadCount?: number;
	initialStep?: number;
}) {
	const {
		areaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		selectedLeadListAId,
		setSelectedLeadListAId,
		leadCount,
		daysSelected,
		setDaysSelected,
		reachBeforeBusiness,
		reachAfterBusiness,
		reachOnWeekend,
		startDate,
		endDate,
		primaryChannel,
		setPrimaryChannel,
		reset,
		// A/B testing and naming
		abTestingEnabled,
		setAbTestingEnabled,
		campaignName,
		setCampaignName,
		// validation helper
		isLeadListSelectionValid,
	} = useCampaignCreationStore();

	const days =
		startDate && endDate
			? Math.max(
					1,
					Math.ceil(
						(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
					) + 1,
				)
			: 0;

	const mutatedDays =
		days > 0 ? Math.round(days * (reachOnWeekend ? 1.35 : 1)) : 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: sync derived state
	useEffect(() => {
		setDaysSelected(mutatedDays);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mutatedDays, reachOnWeekend]);

	const estimatedCredits =
		leadCount > 0 && mutatedDays > 0 ? Math.round(leadCount * mutatedDays) : 0;

	// Controlled/uncontrolled open
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = (v: boolean) => {
		if (onOpenChange) onOpenChange(v);
		else setUncontrolledOpen(v);
	};

	const [step, setStep] = useState(0);

	// Define customization form before any usage and align types with zod schema (use input type)
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
		},
	});

	const nextStep = async () => {
		if (step === 1) {
			const isValid = await customizationForm.trigger();
			if (!isValid) return;
			// Additional guard: if A/B testing is enabled with lead lists, require both lists
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
	const closeModal = () => setOpen(false);
	const launchCampaign = () => {
		// TODO: hook up real launch
		closeModal();
	};

	const handleCreateAbTest = (label?: string) => {
		// Enable A/B testing and duplicate current campaign setup.
		// Keep dialog open and restart at step 0 with all data preserved in the store.
		setAbTestingEnabled(true);
		// Use provided variation label (from popover) with a sensible default
		const variantLabel = (label || "Variant B").trim();
		if (campaignName) {
			// Remove any existing (Variant[^)]*) suffix to avoid duplications, then apply the new one
			const base = campaignName.replace(/\s*\(Variant[^)]*\)$/i, "").trim();
			setCampaignName(`${base} (${variantLabel})`);
		}
		// If the user had a single lead list selected before enabling A/B, seed Variant A with it
		if (areaMode === "leadList" && selectedLeadListId && !selectedLeadListAId) {
			setSelectedLeadListAId(selectedLeadListId);
			// Optionally clear the single-select field to avoid ambiguity in UI state
			setSelectedLeadListId("");
		}
		setStep(0);
	};

	const previousOpenRef = useRef(open);
	const setPrimaryChannelRef = useRef(setPrimaryChannel);
	const setSelectedLeadListIdRef = useRef(setSelectedLeadListId);
	const setSelectedLeadListAIdRef = useRef(setSelectedLeadListAId);
	const setCampaignNameRef = useRef(setCampaignName);
	const resetRef = useRef(reset);
	const customizationFormRef = useRef(customizationForm);

	useEffect(() => {
		setPrimaryChannelRef.current = setPrimaryChannel;
	}, [setPrimaryChannel]);

	useEffect(() => {
		setSelectedLeadListIdRef.current = setSelectedLeadListId;
	}, [setSelectedLeadListId]);

	useEffect(() => {
		setSelectedLeadListAIdRef.current = setSelectedLeadListAId;
	}, [setSelectedLeadListAId]);

	useEffect(() => {
		setCampaignNameRef.current = setCampaignName;
	}, [setCampaignName]);

	useEffect(() => {
		resetRef.current = reset;
	}, [reset]);

	useEffect(() => {
		customizationFormRef.current = customizationForm;
	}, [customizationForm]);

	useEffect(() => {
		if (!open) return;

		setStep(initialStep);

		if (defaultChannel) {
			const mapped: "email" | "call" | "text" | "social" =
				defaultChannel === "directmail" ? "email" : defaultChannel;
			setPrimaryChannelRef.current?.(mapped);
		}

		if (initialLeadListId) {
			const {
				selectedLeadListId: currentLeadListId,
				abTestingEnabled: abTestingIsEnabled,
				selectedLeadListAId: currentLeadListAId,
			} = useCampaignCreationStore.getState();

			if (initialLeadListId !== currentLeadListId) {
				setSelectedLeadListIdRef.current?.(initialLeadListId);
				customizationFormRef.current?.setValue(
					"selectedLeadListId",
					initialLeadListId,
				);
			}

			if (abTestingIsEnabled && !currentLeadListAId) {
				setSelectedLeadListAIdRef.current?.(initialLeadListId);
			}
		}

		if (initialLeadListName) {
			setCampaignNameRef.current?.(`${initialLeadListName} Campaign`);
		}
	}, [
		open,
		initialStep,
		defaultChannel,
		initialLeadListId,
		initialLeadListName,
	]);

	useEffect(() => {
		const wasOpen = previousOpenRef.current;
		if (wasOpen && !open) {
			setStep(0);
			resetRef.current?.();
			customizationFormRef.current?.reset({
				...DEFAULT_CUSTOMIZATION_VALUES,
			});
		}

		previousOpenRef.current = open;
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex h-[85vh] max-h-[85vh] min-h-0 w-full max-w-xl flex-col gap-0 overflow-hidden rounded-xl border bg-background p-0 text-foreground shadow-lg outline-none">
				<div className="relative p-6 pb-0">
					{/* Optional header space for title/actions if needed */}
				</div>
				{/* Body scroll area: use flex-1 + min-h-0 to allow internal scrolling */}
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pr-7 pb-6">
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
						/>
					)}
					{step === 2 && (
						<TimingPreferencesStep onBack={prevStep} onNext={nextStep} />
					)}
					{process.env.NODE_ENV === "development" && (
						<p className="mt-3 text-muted-foreground text-xs">
							DEBUG: leadCount={leadCount}, startDate={String(startDate)},
							endDate={String(endDate)}, days={days}, mutatedDays={mutatedDays},
							reachBeforeBusiness={String(reachBeforeBusiness)},
							reachAfterBusiness={String(reachAfterBusiness)}, reachOnWeekend=
							{String(reachOnWeekend)}, estimatedCredits={estimatedCredits}
						</p>
					)}
					{step === 3 && (
						<FinalizeCampaignStep
							onBack={prevStep}
							onLaunch={launchCampaign}
							onCreateAbTest={handleCreateAbTest}
							estimatedCredits={estimatedCredits}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
