"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import {
	calculateCampaignCost,
	getEstimatedCredits,
} from "@/lib/utils/campaignCostCalculator";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import ChannelCustomizationStep, {
	TransferConditionalSchema,
	type FormSchema,
} from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep";
import ChannelSelectionStep from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelSelectionStep";
import { TimingPreferencesStep } from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/TimingPreferencesStep";
import CampaignSettingsDebug from "./CampaignSettingsDebug";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";
import { shallow } from "zustand/shallow";
interface CampaignModalMainProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	initialLeadListId?: string;
	initialLeadListName?: string;
	initialLeadCount?: number;
	initialStep?: number;
	defaultChannel?: "call" | "text" | "social" | "directmail";
	onCampaignLaunched?: (payload: {
		campaignId: string;
		channelType: string;
	}) => void;
}

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
	transferEnabled: false,
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
};

export default function CampaignModalMain({
	isOpen,
	onOpenChange,
	initialLeadListId,
	initialLeadListName,
	initialLeadCount,
	initialStep = 0,
	defaultChannel,
	onCampaignLaunched,
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
		minDailyAttempts,
		maxDailyAttempts,
		doVoicemailDrops,
		includeWeekends,
		isLeadListSelectionValid,
		availableAgents,
		perNumberDailyLimit,
	} = useCampaignCreationStore(
		(state) => ({
			areaMode: state.areaMode,
			setAreaMode: state.setAreaMode,
			selectedLeadListId: state.selectedLeadListId,
			setSelectedLeadListId: state.setSelectedLeadListId,
			selectedLeadListAId: state.selectedLeadListAId,
			setSelectedLeadListAId: state.setSelectedLeadListAId,
			leadCount: state.leadCount,
			setLeadCount: state.setLeadCount,
			setDaysSelected: state.setDaysSelected,
			reachBeforeBusiness: state.reachBeforeBusiness,
			reachAfterBusiness: state.reachAfterBusiness,
			reachOnWeekend: state.reachOnWeekend,
			startDate: state.startDate,
			endDate: state.endDate,
			primaryChannel: state.primaryChannel,
			setPrimaryChannel: state.setPrimaryChannel,
			campaignName: state.campaignName,
			setCampaignName: state.setCampaignName,
			abTestingEnabled: state.abTestingEnabled,
			setAbTestingEnabled: state.setAbTestingEnabled,
			minDailyAttempts: state.minDailyAttempts,
			maxDailyAttempts: state.maxDailyAttempts,
			doVoicemailDrops: state.doVoicemailDrops,
			includeWeekends: state.includeWeekends,
			isLeadListSelectionValid: state.isLeadListSelectionValid,
			availableAgents: state.availableAgents,
			perNumberDailyLimit: state.perNumberDailyLimit,
		}),
		shallow,
	);

	const router = useRouter();

	const [step, setStep] = useState(initialStep);

	const customizationForm = useForm<z.input<typeof FormSchema>>({
		resolver: zodResolver(TransferConditionalSchema),
		defaultValues: {
			...DEFAULT_CUSTOMIZATION_VALUES,
			areaMode: areaMode || DEFAULT_CUSTOMIZATION_VALUES.areaMode,
			selectedLeadListId:
				selectedLeadListId || DEFAULT_CUSTOMIZATION_VALUES.selectedLeadListId,
		},
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
		if (!isOpen) return;
		const currentDaysSelected =
			useCampaignCreationStore.getState().daysSelected;
		if (currentDaysSelected === mutatedDays) return;
		setDaysSelected(mutatedDays);
	}, [isOpen, mutatedDays, setDaysSelected]);

	const watchedCustomizationValues = customizationForm.watch();
	const campaignCost = useMemo(() => {
		// Debug logging for troubleshooting
		console.log("Campaign Cost Calculation Debug:", {
			primaryChannel,
			leadCount,
			minDailyAttempts,
			maxDailyAttempts,
			perNumberDailyLimit,
			includeWeekends,
			doVoicemailDrops,
			plan: "starter", // Default plan since it's not in form schema yet
		});

		// Only calculate if we have valid data
		if (!primaryChannel || leadCount <= 0) {
			console.log("Invalid campaign data for cost calculation");
			return {
				CampaignName: campaignName || "Unnamed Campaign",
				Channel: primaryChannel || "unknown",
				LeadsTargeted: leadCount,
				TotalDays: mutatedDays,
				TotalAttempts: 0,
				CallCost: 0,
				SmsCost: 0,
				SocialCost: 0,
				DirectMailCost: 0,
				TotalCost: 0,
				AgentsAvailable: availableAgents?.length || 0,
				Plan: "starter",
				TotalBillableCredits: 0,
				Margin: 0.85,
			};
		}

		const result = calculateCampaignCost({
			primaryChannel,
			leadCount,
			minDailyAttempts,
			maxDailyAttempts,
			dailyLimit: perNumberDailyLimit,
			includeWeekends,
			doVoicemailDrops,
			transferEnabled: !!watchedCustomizationValues?.transferEnabled,
			transferType: watchedCustomizationValues?.transferType,
			startDate,
			endDate,
			daysSelected: mutatedDays,
			campaignName,
			availableAgents,
			plan: "starter", // Default plan for now
		});

		console.log("Campaign Cost Result:", result);
		return result;
	}, [
		primaryChannel,
		leadCount,
		minDailyAttempts,
		maxDailyAttempts,
		perNumberDailyLimit,
		includeWeekends,
		doVoicemailDrops,
		watchedCustomizationValues?.transferEnabled,
		watchedCustomizationValues?.transferType,
		startDate,
		endDate,
		mutatedDays,
		campaignName,
		availableAgents,
	]);

	const estimatedCredits = getEstimatedCredits(campaignCost);

	// Debug estimated credits calculation
	console.log("Estimated Credits Debug:", {
		campaignCost,
		estimatedCredits,
		totalCost: campaignCost.TotalCost,
		totalBillableCredits: campaignCost.TotalBillableCredits,
		// Force a minimum cost for testing
		testCredits: Math.max(estimatedCredits, leadCount > 0 ? 100 : 0),
	});

	const hasInitializedRef = useRef(false);
	const previousIsOpenRef = useRef(isOpen);

	useEffect(() => {
		if (!isOpen) {
			hasInitializedRef.current = false;
			if (previousIsOpenRef.current) {
				customizationForm.reset(DEFAULT_CUSTOMIZATION_VALUES);
			}
			previousIsOpenRef.current = isOpen;
			return;
		}

		previousIsOpenRef.current = isOpen;

		const runInitialization = () => {
			if (defaultChannel) {
				setPrimaryChannel(
					defaultChannel === "directmail" ? "email" : defaultChannel,
				);
			}
			if (initialLeadListId) {
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
		};

		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true;
			runInitialization();
			return;
		}

		// Handle updated initial lead list while staying on channel selection
		if (
			step === 0 &&
			initialLeadListId &&
			initialLeadListId !== selectedLeadListId
		) {
			setAreaMode("leadList");
			setSelectedLeadListId(initialLeadListId);
			customizationForm.setValue("areaMode", "leadList");
			customizationForm.setValue("selectedLeadListId", initialLeadListId);
			if (abTestingEnabled && !selectedLeadListAId) {
				setSelectedLeadListAId(initialLeadListId);
			}
		}
	}, [
		isOpen,
		step,
		initialLeadListId,
		initialLeadListName,
		initialLeadCount,
		initialStep,
		defaultChannel,
		abTestingEnabled,
		selectedLeadListId,
		selectedLeadListAId,
		setAreaMode,
		setSelectedLeadListId,
		setSelectedLeadListAId,
		setPrimaryChannel,
		setLeadCount,
		setCampaignName,
		customizationForm,
	]);

	const closeModal = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

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

	const launchCampaign = useCallback(() => {
		console.log("🚀 CAMPAIGN LAUNCH DEBUG - Starting launchCampaign");
		console.log("📊 CAMPAIGN STATE DEBUG:", {
			primaryChannel,
			campaignName,
			leadCount,
			areaMode,
			step,
			isOpen,
		});

		try {
			// Generate a campaign ID (using timestamp for now)
			const campaignId = `campaign_${Date.now()}`;
			console.log("🆔 CAMPAIGN ID DEBUG:", { campaignId });

			// Map primary channel to campaign type
			const channelTypeMap: Record<string, string> = {
				call: "call",
				text: "text",
				social: "social",
				directmail: "direct",
				email: "direct", // Map email to direct for now
			};

			const campaignType = channelTypeMap[primaryChannel || ""] || "call";
			console.log("📡 CAMPAIGN TYPE DEBUG:", { campaignType, primaryChannel });

			const params = new URLSearchParams({
				type: campaignType,
				campaignId,
			});
			console.log("🔗 URL PARAMS DEBUG:", params.toString());

			const fullUrl = `/dashboard/campaigns?${params.toString()}`;
			console.log("🌐 FULL URL DEBUG:", fullUrl);

			// Check if router exists
			console.log("🧭 ROUTER DEBUG:", {
				routerExists: !!router,
				routerType: typeof router,
				routerPush: typeof router?.push,
			});

			if (!router?.push) {
				console.error("❌ ROUTER ERROR: router.push is not available");
				throw new Error("Router not available for navigation");
			}

			// Close modal before notifying listeners to avoid Radix presence loops
			console.log("🔒 MODAL DEBUG: Closing modal");
			closeModal();

			console.log("📢 CALLBACK DEBUG: Calling onCampaignLaunched");
			onCampaignLaunched?.({
				campaignId,
				channelType: campaignType,
			});

			router.push(fullUrl);
			console.log("✅ NAVIGATION DEBUG: router.push called successfully");

			console.log(
				"🎉 CAMPAIGN LAUNCH DEBUG: Campaign launch completed successfully",
			);
		} catch (error: unknown) {
			console.error("💥 CAMPAIGN LAUNCH ERROR:", error);
			console.error("🔍 ERROR DETAILS:", {
				name: (error as Error)?.name,
				message: (error as Error)?.message,
				stack: (error as Error)?.stack,
			});
			throw error; // Re-throw so the error still propagates
		}
	}, [
		primaryChannel,
		closeModal,
		onCampaignLaunched,
		router,
		areaMode,
		isOpen,
		step,
		campaignName,
		leadCount,
	]);

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
			customizationForm.reset(DEFAULT_CUSTOMIZATION_VALUES);
		}
	}, [isOpen, customizationForm]);

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
							estimatedCredits={Math.max(
								estimatedCredits,
								leadCount > 0 ? 100 : 0,
							)}
						/>
					)}

					{/* Debug Log - Shows all selected campaign settings */}
					<CampaignSettingsDebug
						formData={watchedCustomizationValues}
						campaignCost={campaignCost}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
