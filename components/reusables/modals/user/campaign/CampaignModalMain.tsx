"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	useCampaignCreationStore,
	type CampaignCreationState,
} from "@/lib/stores/campaignCreation";
import { useCampaignStore } from "@/lib/stores/campaigns";
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
	type FC,
} from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import ChannelCustomizationStep, {
	TransferConditionalSchema,
	type FormSchema,
} from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep";
import ChannelSelectionStep from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/ChannelSelectionStep";
import { TimingPreferencesStep } from "../../../../../external/shadcn-table/src/examples/campaigns/modal/steps/TimingPreferencesStep.tsx";
import CampaignSettingsDebug from "./CampaignSettingsDebug";
import { EvaluationReportModal } from "./EvaluationReportModal";
import FinalizeCampaignStep from "./steps/FinalizeCampaignStep";
import { shallow } from "zustand/shallow";
import type { CallCampaign } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { DirectMailCampaign } from "external/shadcn-table/src/examples/DirectMail/utils/mock";
import { useLeadListStore } from "@/lib/stores/leadList";
import { toast } from "sonner";
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
	initialCampaignData?: CallCampaign | EmailCampaign | DirectMailCampaign;
	isVariantMode?: boolean;
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

const campaignModalDebugEnabled = process.env.NODE_ENV !== "production";

const campaignDebugLog = (phase: string, details: Record<string, unknown>) => {
	if (!campaignModalDebugEnabled) return;
	// eslint-disable-next-line no-console -- debug instrumentation for campaign launch lifecycle
	console.debug(`[CampaignModalMain] ${phase}`, details);
};

const campaignWarnLog = (phase: string, details: Record<string, unknown>) => {
	if (!campaignModalDebugEnabled) return;
	// eslint-disable-next-line no-console -- debug instrumentation for campaign launch lifecycle
	console.warn(`[CampaignModalMain] ${phase}`, details);
};

type CampaignStoreDebugSnapshot = Pick<
	CampaignCreationState,
	| "areaMode"
	| "selectedLeadListId"
	| "selectedLeadListAId"
	| "leadCount"
	| "campaignName"
	| "primaryChannel"
	| "abTestingEnabled"
	| "daysSelected"
>;

const selectCampaignStoreDebugSnapshot = (
	state: CampaignCreationState,
): CampaignStoreDebugSnapshot => ({
	areaMode: state.areaMode,
	selectedLeadListId: state.selectedLeadListId,
	selectedLeadListAId: state.selectedLeadListAId,
	leadCount: state.leadCount,
	campaignName: state.campaignName,
	primaryChannel: state.primaryChannel,
	abTestingEnabled: state.abTestingEnabled,
	daysSelected: state.daysSelected,
});

const CampaignModalMain: FC<CampaignModalMainProps> = ({
	isOpen,
	onOpenChange,
	initialLeadListId,
	initialLeadListName,
	initialLeadCount = 0,
	initialStep = 0,
	defaultChannel,
	onCampaignLaunched,
	initialCampaignData,
	isVariantMode = false,
}) => {
	console.log("🔧 CAMPAIGN MODAL DEBUG - Component rendering", {
		isOpen,
		initialStep,
		defaultChannel,
		hasOnCampaignLaunched: !!onCampaignLaunched,
		isVariantMode,
		hasInitialCampaignData: !!initialCampaignData,
	});

	const registerLaunchedCampaign = useCampaignStore(
		(state) => state.registerLaunchedCampaign,
	);

	const router = useRouter();

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
		(state: CampaignCreationState) => ({
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

	const [step, setStep] = useState(initialStep);
	const stepRef = useRef<number>(0);
	const closingStateRef = useRef({ closing: false, renderCount: 0 });
	const closingReleaseTimeoutRef = useRef<number | null>(null);
	const launchGuardRef = useRef(false);
	const renderDebugCounterRef = useRef(0);
	const liveIsOpenRef = useRef<boolean>(false);
	const [evalRunId, setEvalRunId] = useState<string | null>(null);
	const [evalReportOpen, setEvalReportOpen] = useState(false);
	const isMountedRef = useRef(true);
	const isOpenRef = useRef(isOpen);

	const customizationForm = useForm<z.input<typeof FormSchema>>({
		resolver: zodResolver(TransferConditionalSchema),
		defaultValues: {
			...DEFAULT_CUSTOMIZATION_VALUES,
			areaMode: areaMode || DEFAULT_CUSTOMIZATION_VALUES.areaMode,
			selectedLeadListId:
				selectedLeadListId || DEFAULT_CUSTOMIZATION_VALUES.selectedLeadListId,
		},
	});

	// Ensure leadCount reflects actual selected list size when available
	const leadLists = useLeadListStore((s) => s.leadLists);
	useEffect(() => {
		// Don't run when modal is closed or closing
		if (!isOpen || closingStateRef.current.closing || !isMountedRef.current)
			return;

		if (areaMode !== "leadList") return;
		const id = selectedLeadListId || selectedLeadListAId;
		if (!id) return;
		const list = leadLists.find((l) => l.id === id);
		if (!list) return;
		const records =
			typeof list.records === "number"
				? list.records
				: Array.isArray((list as any).leads)
					? ((list as any).leads as unknown[]).length
					: 0;
		if (Number.isFinite(records) && records >= 0) {
			setLeadCount(records);
		}
		// Also mirror into the form field so A/B logic sees a consistent value
		if (!customizationForm.getValues("selectedLeadListId")) {
			customizationForm.setValue("selectedLeadListId", id, {
				shouldValidate: false,
				shouldDirty: false,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		areaMode,
		selectedLeadListId,
		selectedLeadListAId,
		leadLists,
		setLeadCount,
		isOpen,
	]);

	useEffect(
		() => () => {
			if (
				typeof window !== "undefined" &&
				closingReleaseTimeoutRef.current !== null
			) {
				window.clearTimeout(closingReleaseTimeoutRef.current);
				closingReleaseTimeoutRef.current = null;
			}
		},
		[],
	);

	// Update refs for isOpen to avoid stale closures
	useEffect(() => {
		liveIsOpenRef.current = isOpen;
		isOpenRef.current = isOpen;
	}, [isOpen]);

	// Cleanup on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (closingReleaseTimeoutRef.current !== null) {
				window.clearTimeout(closingReleaseTimeoutRef.current);
				closingReleaseTimeoutRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		renderDebugCounterRef.current += 1;
		if (!campaignModalDebugEnabled) return;
		const counter = renderDebugCounterRef.current;
		if (counter % 25 === 0) {
			campaignWarnLog("render-iteration-threshold", {
				counter,
				isOpen: liveIsOpenRef.current,
				closing: closingStateRef.current.closing,
				step: stepRef.current,
			});
			return;
		}
		if (counter % 5 === 0) {
			campaignDebugLog("render-iteration", {
				counter,
				isOpen: liveIsOpenRef.current,
				closing: closingStateRef.current.closing,
				step: stepRef.current,
			});
		}
	});

	// Pre-fill campaign data when in variant mode
	useEffect(() => {
		if (!isOpen || !isVariantMode || !initialCampaignData) return;

		campaignDebugLog("variant-mode-prefill", {
			campaignId: initialCampaignData.id,
			campaignName: initialCampaignData.name,
		});

		// Enable A/B testing
		setAbTestingEnabled(true);

		// Set campaign name with variant suffix
		const baseName = initialCampaignData.name
			.replace(/\s*\(Variant[^)]*\)$/i, "")
			.trim();
		setCampaignName(`${baseName} (Variant B)`);

		// Set channel based on campaign type
		if ("callInformation" in initialCampaignData) {
			setPrimaryChannel("call");
		} else if ("emails" in initialCampaignData) {
			setPrimaryChannel("email");
		} else if (
			"sentCount" in initialCampaignData &&
			"listCount" in initialCampaignData
		) {
			setPrimaryChannel("directmail");
		} else {
			setPrimaryChannel("social");
		}

		// Set step to 1 (customization) to skip channel selection
		setStep(1);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, isVariantMode, initialCampaignData]);

	useEffect(() => {
		if (!campaignModalDebugEnabled) return;
		let hasLoggedInitialSnapshot = false;
		try {
			const unsubscribe = useCampaignCreationStore.subscribe(
				selectCampaignStoreDebugSnapshot,
				(
					currentSnapshot: CampaignStoreDebugSnapshot,
					previousSnapshot: CampaignStoreDebugSnapshot | undefined,
				) => {
					if (!liveIsOpenRef.current && !closingStateRef.current.closing) {
						return;
					}

					if (!hasLoggedInitialSnapshot) {
						hasLoggedInitialSnapshot = true;
						campaignDebugLog("store-snapshot-initial", {
							snapshot: currentSnapshot,
							isOpen: liveIsOpenRef.current,
							closing: closingStateRef.current.closing,
							step: stepRef.current,
						});
					}

					if (!previousSnapshot) {
						return;
					}

					const diffEntries = Object.entries(currentSnapshot).reduce<
						Record<
							string,
							{
								previous: unknown;
								next: unknown;
							}
						>
					>((accumulator, [key, value]) => {
						const typedKey = key as keyof CampaignStoreDebugSnapshot;
						const previousValue = previousSnapshot[typedKey];
						if (!Object.is(value, previousValue)) {
							accumulator[key] = {
								previous: previousValue,
								next: value,
							};
						}
						return accumulator;
					}, {});

					if (Object.keys(diffEntries).length === 0) {
						return;
					}

					campaignDebugLog("store-change", {
						diff: diffEntries,
						isOpen: liveIsOpenRef.current,
						closing: closingStateRef.current.closing,
						renderCount: closingStateRef.current.renderCount,
						step: stepRef.current,
					});
				},
			);

			return () => {
				unsubscribe();
				campaignDebugLog("store-subscription-cleanup", {
					isOpen: liveIsOpenRef.current,
					closing: closingStateRef.current.closing,
					step: stepRef.current,
				});
			};
		} catch (error) {
			campaignWarnLog("store-subscription-error", {
				message: (error as Error).message,
				stack: (error as Error).stack,
			});
			return undefined;
		}
	}, []);

	// Handle modal open/close state transitions
	useEffect(() => {
		if (isOpen) {
			if (
				typeof window !== "undefined" &&
				closingReleaseTimeoutRef.current !== null
			) {
				window.clearTimeout(closingReleaseTimeoutRef.current);
				closingReleaseTimeoutRef.current = null;
			}
			closingStateRef.current.closing = false;
			closingStateRef.current.renderCount = 0;
			launchGuardRef.current = false;
			renderDebugCounterRef.current = 0;
			campaignDebugLog("modal-open", {
				step,
			});
			return;
		}

		// Only process close if not already closing or if mounted
		if (!isMountedRef.current) return;

		if (!closingStateRef.current.closing) {
			closingStateRef.current.closing = true;
			closingStateRef.current.renderCount = 0;
			campaignDebugLog("modal-close-start", {
				step: stepRef.current,
			});
		} else {
			campaignDebugLog("modal-close-progress", {
				step: stepRef.current,
				renderCount: closingStateRef.current.renderCount,
			});
		}

		if (typeof window !== "undefined") {
			if (closingReleaseTimeoutRef.current !== null) {
				window.clearTimeout(closingReleaseTimeoutRef.current);
			}

			closingReleaseTimeoutRef.current = window.setTimeout(() => {
				if (isMountedRef.current) {
					closingStateRef.current.closing = false;
					closingStateRef.current.renderCount = 0;
					launchGuardRef.current = false;
					campaignDebugLog("modal-close-finalized", {
						step: stepRef.current,
					});
				}
				closingReleaseTimeoutRef.current = null;
			}, 200);
		}
	}, [isOpen, step]);

	useEffect(() => {
		if (!closingStateRef.current.closing) return;
		closingStateRef.current.renderCount += 1;
		if (closingStateRef.current.renderCount === 10) {
			campaignWarnLog("modal-close-render-streak", {
				step: stepRef.current,
				renderCount: closingStateRef.current.renderCount,
			});
		}
		if (closingStateRef.current.renderCount > 25) {
			campaignWarnLog("modal-close-render-streak-critical", {
				step: stepRef.current,
				renderCount: closingStateRef.current.renderCount,
			});
			closingStateRef.current.renderCount = 0;
		}
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
		if (!isOpen || closingStateRef.current.closing) {
			if (closingStateRef.current.closing) {
				campaignDebugLog("days-selected-skip", {
					mutatedDays,
					reason: "closing",
				});
			}
			return;
		}
		const currentDaysSelected =
			useCampaignCreationStore.getState().daysSelected;
		if (currentDaysSelected === mutatedDays) return;
		campaignDebugLog("days-selected-update", {
			previous: currentDaysSelected,
			next: mutatedDays,
		});
		setDaysSelected(mutatedDays);
	}, [isOpen, mutatedDays, setDaysSelected]);

	useEffect(() => {
		stepRef.current = step;
	}, [step]);

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

	const hasInitializedRef = useRef<boolean>(false);
	const previousIsOpenRef = useRef<boolean>(false);

	useEffect(() => {
		if (!isOpen) {
			hasInitializedRef.current = false;
			// Form reset is handled in separate effect with deferred execution
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
		if (closingStateRef.current.closing || !isOpenRef.current) {
			campaignWarnLog("duplicate-close-ignored", {
				step: stepRef.current,
				isOpen: isOpenRef.current,
			});
			return;
		}
		closingStateRef.current.closing = true;
		closingStateRef.current.renderCount = 0;
		isOpenRef.current = false;
		campaignDebugLog("close-requested", {
			step: stepRef.current,
			isOpen: isOpenRef.current,
		});
		// Defer to prevent render-time state updates
		setTimeout(() => {
			if (isMountedRef.current) {
				onOpenChange(false);
			}
		}, 0);
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
		if (launchGuardRef.current) {
			campaignWarnLog("duplicate-launch-ignored", {
				step,
				isOpen,
				campaignName,
			});
			return;
		}

		launchGuardRef.current = true;
		campaignDebugLog("launch-start", {
			primaryChannel,
			campaignName,
			leadCount,
			areaMode,
			step,
			isOpen,
		});

		try {
			const campaignId = `campaign_${Date.now()}`;
			campaignDebugLog("launch-campaign-id", { campaignId });

			const channelTypeMap: Record<
				string,
				"call" | "text" | "social" | "direct"
			> = {
				call: "call",
				text: "text",
				social: "social",
				directmail: "direct",
				email: "direct",
			};

			const campaignType = channelTypeMap[primaryChannel || ""] || "call";
			campaignDebugLog("launch-campaign-type", {
				campaignType,
				primaryChannel,
			});

			const registrationChannel:
				| "call"
				| "text"
				| "social"
				| "direct"
				| "email" =
				primaryChannel === "directmail"
					? "direct"
					: primaryChannel === "email"
						? "email"
						: ((primaryChannel as
								| "call"
								| "text"
								| "social"
								| "direct"
								| null) ?? "call");

			const nowIso = new Date().toISOString();
			const startIso = startDate?.toISOString() ?? nowIso;
			const endIso = endDate ? endDate.toISOString() : undefined;
			const safeLeadCount = Number.isFinite(leadCount)
				? Math.max(0, leadCount)
				: 0;
			const normalizedName =
				(campaignName || "New Campaign").trim() || "New Campaign";

			const buildCallLikeCampaign = (): CallCampaign => ({
				id: campaignId,
				name: normalizedName,
				status: "queued",
				startDate: startIso,
				endDate: endIso,
				callInformation: [],
				callerNumber: "+1-555-0100",
				receiverNumber: "+1-555-0101",
				duration: 0,
				callType: "outbound",
				calls: 0,
				inQueue: safeLeadCount,
				leads: safeLeadCount,
				voicemail: 0,
				hungUp: 0,
				dead: 0,
				wrongNumber: 0,
				inactiveNumbers: 0,
				dnc: 0,
				endedReason: [],
				textStats: {
					sent: 0,
					delivered: 0,
					failed: 0,
					total: 0,
					lastMessageAt: startIso,
				},
				messages: [],
			});

			const registerPayload = () => {
				switch (registrationChannel) {
					case "call":
						registerLaunchedCampaign({
							channel: "call",
							campaign: buildCallLikeCampaign(),
						});
						break;
					case "text":
						registerLaunchedCampaign({
							channel: "text",
							campaign: buildCallLikeCampaign(),
						});
						break;
					case "social":
						registerLaunchedCampaign({
							channel: "social",
							campaign: buildCallLikeCampaign(),
						});
						break;
					case "email": {
						const emailCampaign: EmailCampaign = {
							id: campaignId,
							name: normalizedName,
							status: "queued",
							startDate: startIso,
							endDate: endIso,
							emails: [],
							senderEmail: "noreply@example.com",
							recipientCount: safeLeadCount,
							sentCount: 0,
							deliveredCount: 0,
							openedCount: 0,
							bouncedCount: 0,
							failedCount: 0,
						};
						registerLaunchedCampaign({
							channel: "email",
							campaign: emailCampaign,
						});
						break;
					}
					case "direct": {
						const directCampaign: DirectMailCampaign = {
							id: campaignId,
							name: normalizedName,
							status: "queued",
							startDate: startIso,
							endDate: endIso,
							template: { id: `tmpl_${campaignId}`, name: normalizedName },
							mailType: "letter",
							mailSize: "8.5x11",
							addressVerified: false,
							expectedDeliveryAt: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							lastEventAt: nowIso,
							deliveredCount: 0,
							returnedCount: 0,
							failedCount: 0,
							cost: 0,
							leadsDetails: [],
							lob: null,
						};
						registerLaunchedCampaign({
							channel: "direct",
							campaign: directCampaign,
						});
						break;
					}
				}
			};

			registerPayload();

			const params = new URLSearchParams({
				type: campaignType,
				campaignId,
			});

			// Optional: include SMS capability flags and signature for debugging/navigation
			try {
				const s = useCampaignCreationStore.getState();
				if (s.textSignature) params.set("textSignature", s.textSignature);
				params.set("smsImages", String(s.smsCanSendImages));
				params.set("smsVideos", String(s.smsCanSendVideos));
				params.set("smsLinks", String(s.smsCanSendLinks));
				if ((s as any).smsMediaSource)
					params.set("smsMediaSource", String((s as any).smsMediaSource));
			} catch {}
			const paramsString = params.toString();
			const fullUrl = `/dashboard/campaigns?${paramsString}`;
			campaignDebugLog("launch-navigation-target", {
				params: paramsString,
				fullUrl,
			});

			campaignDebugLog("launch-close-dispatch", {
				step: stepRef.current,
			});
			closeModal();

			campaignDebugLog("launch-callback-notify", {
				hasListener: Boolean(onCampaignLaunched),
			});
			onCampaignLaunched?.({
				campaignId,
				channelType: campaignType,
			});

			if (!onCampaignLaunched) {
				setTimeout(() => {
					try {
						const path =
							typeof window !== "undefined" ? window.location.pathname : "";
						const current =
							typeof window !== "undefined"
								? window.location.pathname + (window.location.search || "")
								: "";
						const onQuickStart = path.includes("/dashboard/quickstart");
						if (onQuickStart) {
							campaignDebugLog("launch-router-push-skipped", {
								reason: "quickstart-open-webhooks",
								destination: fullUrl,
							});
							return;
						}
						if (current !== fullUrl) {
							router.push(fullUrl);
							campaignDebugLog("launch-router-push", {
								destination: fullUrl,
							});
						} else {
							campaignDebugLog("launch-router-push-skipped", {
								reason: "same-url",
								destination: fullUrl,
							});
						}
					} catch {}
				}, 0);
			}

			campaignDebugLog("launch-success", {
				campaignId,
				campaignType,
			});
		} catch (error: unknown) {
			launchGuardRef.current = false;
			closingStateRef.current.closing = false;
			console.error("💥 CAMPAIGN LAUNCH ERROR:", error);
			console.error("🔍 ERROR DETAILS:", {
				name: (error as Error)?.name,
				message: (error as Error)?.message,
				stack: (error as Error)?.stack,
			});
			throw error;
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
		startDate,
		endDate,
		registerLaunchedCampaign,
	]);

	const handleCreateAbTest = (label?: string) => {
		// Create A/B test variant: mock-launch current setup, then duplicate settings and restart flow
		console.log("Creating A/B test variant:", label);
		setAbTestingEnabled(true);

		// 1) Mock-launch the current campaign so Variant A is recorded
		try {
			const nowIso = new Date().toISOString();
			const mockId = `mock_${Date.now()}`;
			const normalizedName = campaignName || "Untitled Campaign";
			const registrationChannel =
				primaryChannel === "call" ||
				primaryChannel === "text" ||
				primaryChannel === "social"
					? (primaryChannel as "call" | "text" | "social")
					: primaryChannel === "directmail"
						? ("direct" as const)
						: ("email" as const);

			switch (registrationChannel) {
				case "call":
				case "text":
				case "social": {
					const mockCallCampaign: CallCampaign = {
						id: mockId,
						name: normalizedName,
						goal: campaignGoal || undefined,
						status: "queued",
						startDate: nowIso,
						callInformation: [],
						callerNumber: "",
						receiverNumber: "",
						duration: 0,
						callType: "outbound",
						calls: 0,
						inQueue: 0,
						leads: 0,
						voicemail: 0,
						hungUp: 0,
						dead: 0,
						wrongNumber: 0,
						inactiveNumbers: 0,
						dnc: 0,
						endedReason: [],
					};
					registerLaunchedCampaign({
						channel: registrationChannel,
						campaign: mockCallCampaign,
					});
					break;
				}
				case "email": {
					const mockEmailCampaign: EmailCampaign = {
						id: mockId,
						name: normalizedName,
						goal: campaignGoal || undefined,
						status: "queued",
						startDate: nowIso,
						emails: [],
						senderEmail: "",
						recipientCount: 0,
						sentCount: 0,
						deliveredCount: 0,
						openedCount: 0,
						bouncedCount: 0,
						failedCount: 0,
					};
					registerLaunchedCampaign({
						channel: "email",
						campaign: mockEmailCampaign,
					});
					break;
				}
				case "direct": {
					const directCampaign: DirectMailCampaign = {
						id: mockId,
						name: normalizedName,
						status: "queued",
						startDate: nowIso,
						template: { id: `tmpl_${mockId}`, name: normalizedName },
						mailType: "letter",
						mailSize: "8.5x11",
						addressVerified: false,
						expectedDeliveryAt: new Date(
							Date.now() + 7 * 24 * 60 * 60 * 1000,
						).toISOString(),
						lastEventAt: nowIso,
						deliveredCount: 0,
						returnedCount: 0,
						failedCount: 0,
						cost: 0,
						leadsDetails: [],
						lob: null,
					};
					registerLaunchedCampaign({
						channel: "direct",
						campaign: directCampaign,
					});
					break;
				}
			}
		} catch {}

		// 2) Prepare variant B name and restart flow
		const variantLabel = (label || "Variant B").trim();
		if (campaignName) {
			// Remove any existing variant suffix to avoid duplications
			const base = campaignName.replace(/\s*\(Variant[^)]*\)$/i, "").trim();
			setCampaignName(`${base} (${variantLabel})`);
		}
		// If user had a single lead list selected, seed Variant A with it
		if (areaMode === "leadList" && selectedLeadListId && !selectedLeadListAId) {
			setSelectedLeadListAId(selectedLeadListId);
			setSelectedLeadListId("");
		}
		// Reset to step 0 to start new campaign creation flow with same settings
		setStep(0);
	};

	const handleEvaluate = useCallback(
		async (criteria: {
			name?: string;
			description?: string;
			type: "chat.mockConversation";
			messages: Array<{
				role: string;
				content: string;
				type?: string;
			}>;
		}) => {
			try {
				// TODO: Replace with actual API call to create evaluation
				// For now, simulate with a mock eval run ID
				// This should be replaced with: POST /api/campaigns/evaluate
				// which returns { evalRunId: string }
				const mockEvalRunId = `eval_${Date.now()}`;

				// In production, this would be:
				// const response = await fetch('/api/campaigns/evaluate', {
				//   method: 'POST',
				//   body: JSON.stringify(criteria),
				// });
				// const { evalRunId } = await response.json();

				setEvalRunId(mockEvalRunId);
				setEvalReportOpen(true);
				toast.success("Evaluation started successfully");
			} catch (error) {
				console.error("Failed to start evaluation:", error);
				toast.error(
					error instanceof Error ? error.message : "Failed to start evaluation",
				);
			}
		},
		[],
	);

	// Reset form when modal closes (with deferred execution to prevent loops)
	useEffect(() => {
		if (!isOpen && isMountedRef.current) {
			// Defer form reset to prevent immediate re-renders
			const timeoutId = setTimeout(() => {
				if (isMountedRef.current && !isOpenRef.current) {
					customizationForm.reset(DEFAULT_CUSTOMIZATION_VALUES);
				}
			}, 0);

			return () => clearTimeout(timeoutId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const handleDialogOpenChange = useCallback(
		(newOpen: boolean) => {
			// Prevent duplicate state updates
			if (newOpen === isOpenRef.current) return;

			// Update ref immediately
			isOpenRef.current = newOpen;
			liveIsOpenRef.current = newOpen;

			if (!newOpen) {
				// Mark as closing to prevent duplicate close operations
				if (!closingStateRef.current.closing) {
					closingStateRef.current.closing = true;
					closingStateRef.current.renderCount = 0;
				}
				// Defer the actual close to prevent render-time updates
				setTimeout(() => {
					if (isMountedRef.current) {
						onOpenChange(false);
					}
				}, 0);
			} else {
				// Opening - reset closing state
				closingStateRef.current.closing = false;
				closingStateRef.current.renderCount = 0;
				onOpenChange(true);
			}
		},
		[onOpenChange],
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
			<DialogContent className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex h-[85vh] max-h-[85vh] min-h-0 w-full max-w-xl flex-col gap-0 overflow-hidden rounded-xl border bg-background p-0 text-foreground shadow-lg outline-none">
				<div className="min-h-0 flex-1 overflow-y-auto bg-card px-6 pt-6 pb-6 text-card-foreground">
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
							onCreateAbTest={handleCreateAbTest}
							onEvaluate={handleEvaluate}
							isModalOpen={isOpen}
							estimatedCredits={Math.max(
								estimatedCredits,
								leadCount > 0 ? 100 : 0,
							)}
						/>
					)}

					{/* Debug Log - Shows all selected campaign settings */}
					{campaignModalDebugEnabled && (
						<CampaignSettingsDebug
							formData={watchedCustomizationValues}
							campaignCost={campaignCost}
						/>
					)}
				</div>
			</DialogContent>
			<EvaluationReportModal
				evalRunId={evalRunId}
				open={evalReportOpen}
				onOpenChange={setEvalReportOpen}
			/>
		</Dialog>
	);
};

export default CampaignModalMain;
