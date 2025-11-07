"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { LightRays } from "@/components/ui/light-rays";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import QuickStartActionsGrid from "@/components/quickstart/QuickStartActionsGrid";
import QuickStartLegacyModals, {
	type QuickStartCampaignContext,
} from "@/components/quickstart/QuickStartLegacyModals";
import QuickStartSupportCard from "@/components/quickstart/QuickStartSupportCard";
import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import { useBulkCsvUpload } from "@/components/quickstart/useBulkCsvUpload";
import { useQuickStartCardViewModel } from "@/components/quickstart/useQuickStartCardViewModel";
import { useQuickStartSavedSearches } from "@/components/quickstart/useQuickStartSavedSearches";
import QuickStartWizard from "@/components/quickstart/wizard/QuickStartWizard";
import { CampaignSelectorModal } from "@/components/reusables/modals/user/campaign/CampaignSelectorModal";
import { AICampaignGenerator } from "@/components/reusables/modals/user/campaign/AICampaignGenerator";
import SavedCampaignTemplatesModal from "@/components/reusables/modals/user/campaign/SavedCampaignTemplatesModal";
import { AIWorkflowGenerator } from "@/components/reusables/modals/user/workflow/AIWorkflowGenerator";
import { WorkflowExportModal } from "@/components/reusables/modals/user/workflow/WorkflowExportModal";
import SavedWorkflowsModal from "@/components/reusables/modals/user/workflow/SavedWorkflowsModal";
import { AISavedSearchGenerator } from "@/components/reusables/modals/user/lookalike/AISavedSearchGenerator";
import { LookalikeConfigModal } from "@/components/reusables/modals/user/lookalike/LookalikeConfigModal";
import { LookalikeResultsModal } from "@/components/reusables/modals/user/lookalike/LookalikeResultsModal";
import { exportToMultiplePlatforms } from "@/lib/api/lookalike/export";
import { generateLookalikeAudience } from "@/lib/api/lookalike/generate";
import {
	type QuickStartTemplateId,
	applyQuickStartTemplatePreset,
	getQuickStartTemplate,
} from "@/lib/config/quickstart/templates";
import { getGoalDefinition } from "@/lib/config/quickstart/wizardFlows";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import { useLookalikeStore } from "@/lib/stores/lookalike";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import type {
	AdPlatform,
	LookalikeCandidate,
	LookalikeConfig,
} from "@/types/lookalike";
import type {
	SavedSearch,
	SavedCampaignTemplate,
	SavedWorkflow,
} from "@/types/userProfile";
import { useSavedCampaignTemplatesStore } from "@/lib/stores/user/campaigns/savedTemplates";
import { useSavedWorkflowsStore } from "@/lib/stores/user/workflows/savedWorkflows";
import { useWorkflowPlatformsStore } from "@/lib/stores/user/workflows/platforms";
import { mapTemplateToCampaignWizard } from "@/lib/utils/campaign/templateParser";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";

let lastAppliedTemplateIdGlobal: QuickStartTemplateId | null = null;

export default function QuickStartPage() {
	const router = useRouter();
	const [showLeadModal, setShowLeadModal] = useState(false);
	const [leadModalMode, setLeadModalMode] = useState<"select" | "create">(
		"create",
	);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);
	const [showBulkSuiteModal, setShowBulkSuiteModal] = useState(false);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [campaignModalContext, setCampaignModalContext] =
		useState<QuickStartCampaignContext | null>(null);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [showCampaignSelectorModal, setShowCampaignSelectorModal] =
		useState(false);
	const [variantCampaignData, setVariantCampaignData] = useState<any>(null);
	const [isVariantMode, setIsVariantMode] = useState(false);

	// Lookalike audience state
	const [showLookalikeConfigModal, setShowLookalikeConfigModal] =
		useState(false);
	const [showLookalikeResultsModal, setShowLookalikeResultsModal] =
		useState(false);
	const [seedLeadListData, setSeedLeadListData] = useState<{
		listId: string;
		listName: string;
		leadCount: number;
	} | null>(null);
	const [lookalikeLeadModalMode, setLookalikeLeadModalMode] = useState<
		"select" | "create"
	>("select");
	const [showAISearchGenerator, setShowAISearchGenerator] = useState(false);
	const [showAICampaignGenerator, setShowAICampaignGenerator] = useState(false);
	const [showSavedCampaignTemplates, setShowSavedCampaignTemplates] =
		useState(false);

	// Workflow state
	const [showAIWorkflowGenerator, setShowAIWorkflowGenerator] = useState(false);
	const [showWorkflowExportModal, setShowWorkflowExportModal] = useState(false);
	const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
	const [showSavedWorkflows, setShowSavedWorkflows] = useState(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const lastAppliedTemplateIdRef = useRef<QuickStartTemplateId | null>(
		lastAppliedTemplateIdGlobal,
	);
	const [lastTemplateId, setLastTemplateIdState] =
		useState<QuickStartTemplateId | null>(lastAppliedTemplateIdRef.current);
	const updateLastTemplateId = useCallback(
		(value: QuickStartTemplateId | null) => {
			lastAppliedTemplateIdGlobal = value;
			lastAppliedTemplateIdRef.current = value;
			setLastTemplateIdState(value);
		},
		[],
	);
	const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
	const [bulkCsvHeaders, setBulkCsvHeaders] = useState<string[]>([]);

	// Minimal debug logger to satisfy calls
	const logQuickStartDebug = () => {};

	const openWebhookModal = useModalStore((state) => state.openWebhookModal);
	const {
		open: openWizard,
		launchWithAction,
		isOpen: isWizardOpen,
	} = useQuickStartWizardStore(
		(state) => ({
			open: state.open,
			launchWithAction: state.launchWithAction,
			isOpen: state.isOpen,
		}),
		shallow,
	);
	const { hasSeenWizard, isHydrated: isExperienceHydrated } =
		useQuickStartWizardExperienceStore(
			(state) => ({
				hasSeenWizard: state.hasSeenWizard,
				isHydrated: state.isHydrated,
			}),
			shallow,
		);
	const campaignStore = useCampaignCreationStore();
	const lookalikeStore = useLookalikeStore();
	const leadListStore = useLeadListStore();
	const leadSearchStore = useLeadSearchStore();

	const {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleCloseSavedSearches,
		handleSelectSavedSearch: baseHandleSelectSavedSearch,
		handleStartNewSearch: handleStartPropertySearch,
		handleOpenSavedSearches,
		savedSearchModalOpen,
	} = useQuickStartSavedSearches();

	const triggerFileInput = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
		setLookalikeLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: QuickStartCampaignContext) => {
			// Reset the campaign store first
			campaignStore.reset();

			// If a Quick Start template was selected earlier, apply its preset.
			// Then override the name to keep the lead-list based naming.
			if (lastTemplateId) {
				applyQuickStartTemplatePreset(lastTemplateId, campaignStore);
				// Fallback: if template didn't specify an agent, assign the first available one
				const live = useCampaignCreationStore.getState();
				if (!live.selectedAgentId && live.availableAgents?.length) {
					campaignStore.setSelectedAgentId(live.availableAgents[0].id);
				}
			}

			// Hydrate lead list context and preferred name derived from the list
			campaignStore.setAreaMode("leadList");
			campaignStore.setSelectedLeadListId(leadListId);
			campaignStore.setLeadCount(leadCount);
			campaignStore.setCampaignName(`${leadListName} Campaign`);

			// Open campaign modal with the captured context
			setCampaignModalContext({ leadListId, leadListName, leadCount });
			setShowCampaignModal(true);
			setShowLeadModal(false);
		},
		[campaignStore, lastTemplateId],
	);

	const handleSuiteLaunchComplete = useCallback(
		(payload: QuickStartCampaignContext) => {
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign],
	);

	const handleCloseLeadModal = () => {
		setShowLeadModal(false);
		// Reset lookalike mode if it was opened for lookalike
		if (lookalikeLeadModalMode === "select" && !seedLeadListData) {
			setSeedLeadListData(null);
		}
	};

	const handleImportFromSource = useCallback(() => {
		triggerFileInput();
	}, [triggerFileInput]);

	// Smart import handler that adapts based on user's existing data
	const handleSmartImport = useCallback(() => {
		const hasLeadLists =
			leadListStore.leadLists && leadListStore.leadLists.length > 0;

		console.log("[QuickStart] Smart import - Has lead lists:", hasLeadLists);

		if (hasLeadLists) {
			// User has existing lists, let them select
			toast.info("Opening lead list selector...", {
				description: "Select from your existing lists or upload a new one",
			});
			handleSelectList();
		} else {
			// No existing lists, trigger upload
			toast.info("Upload your first lead list", {
				description: "Import leads from CSV to get started",
			});
			handleImportFromSource();
		}
	}, [leadListStore.leadLists, handleSelectList, handleImportFromSource]);

	const handleConfigureConnections = useCallback(() => {
		router.push("/dashboard/integrations");
	}, [router]);

	const handleOpenWebhook = useCallback(
		(stage: WebhookStage) => {
			openWebhookModal(stage);
		},
		[openWebhookModal],
	);

	const handleCampaignCreate = useCallback(() => {
		const templateId = lastTemplateId;
		const hasLeadListContext = campaignModalContext !== null;

		if (templateId && !hasLeadListContext) {
			const campaignState = useCampaignCreationStore.getState();
			campaignState.reset();
			applyQuickStartTemplatePreset(templateId, campaignState);
			const template = getQuickStartTemplate(templateId);
			if (template) {
				useCampaignCreationStore.setState({
					campaignName: template.campaignName,
					primaryChannel: template.primaryChannel,
					selectedWorkflowId:
						template.workflowId ?? campaignState.selectedWorkflowId,
					selectedAgentId:
						typeof template.agentId !== "undefined"
							? template.agentId
							: campaignState.selectedAgentId,
				});
			}
		}

		setShowCampaignModal(true);
	}, [campaignModalContext, lastTemplateId]);

	// Smart campaign handler that ensures lead list is selected
	const handleSmartCampaign = useCallback(() => {
		const hasLeadLists =
			leadListStore.leadLists && leadListStore.leadLists.length > 0;
		const campaignState = useCampaignCreationStore.getState();
		const hasSelectedList = !!campaignState.selectedLeadListId;

		console.log(
			"[QuickStart] Smart campaign - Has lists:",
			hasLeadLists,
			"Has selected:",
			hasSelectedList,
		);

		if (!hasLeadLists) {
			// No lead lists at all - prompt to import first
			toast.warning("Import leads first", {
				description: "You need a lead list before creating a campaign",
			});
			handleSmartImport();
			return;
		}

		if (hasLeadLists && !hasSelectedList && !campaignModalContext) {
			// Has lists but none selected - auto-select the first one
			const firstList = leadListStore.leadLists[0];
			if (firstList) {
				console.log(
					"[QuickStart] Auto-selecting first lead list:",
					firstList.listName,
				);

				// Set up campaign context with first list
				const context = {
					leadListId: firstList.id,
					leadListName: firstList.listName,
					leadCount: firstList.records || 0,
				};

				setCampaignModalContext(context);

				// Also update campaign store
				campaignState.setAreaMode("leadList");
				campaignState.setSelectedLeadListId(firstList.id);
				campaignState.setLeadCount(firstList.records || 0);

				toast.success(`Using "${firstList.listName}"`, {
					description: `${firstList.records || 0} leads selected`,
				});
			}
		}

		// Open campaign modal
		handleCampaignCreate();
	}, [
		leadListStore.leadLists,
		campaignModalContext,
		handleSmartImport,
		handleCampaignCreate,
	]);

	useEffect(() => {
		if (!showCampaignModal || campaignModalContext) {
			return;
		}

		const templateId = lastTemplateId;
		if (!templateId) {
			return;
		}

		const campaignState = useCampaignCreationStore.getState();
		if (campaignState.campaignName) {
			return;
		}

		applyQuickStartTemplatePreset(templateId, campaignState);
		const template = getQuickStartTemplate(templateId);
		if (template) {
			useCampaignCreationStore.setState({
				campaignName: template.campaignName,
				primaryChannel: template.primaryChannel,
				selectedWorkflowId:
					template.workflowId ?? campaignState.selectedWorkflowId,
				selectedAgentId:
					typeof template.agentId !== "undefined"
						? template.agentId
						: campaignState.selectedAgentId,
			});
		}
	}, [campaignModalContext, lastTemplateId, showCampaignModal]);

	const handleViewTemplates = useCallback(() => {
		router.push("/dashboard/campaigns/templates");
	}, [router]);

	const handleOpenWebhook = useCallback(
		(stage: WebhookStage) => {
			openWebhookModal(stage);
		},
		[openWebhookModal],
	);

	const handleBrowserExtension = useCallback(() => {
		router.push("/dashboard/extensions");
	}, [router]);

	const handleCreateAbTest = useCallback(() => {
		setShowCampaignSelectorModal(true);
	}, []);

	const handleCampaignSelected = useCallback((campaign: any) => {
		setVariantCampaignData(campaign);
		setIsVariantMode(true);
		setShowCampaignSelectorModal(false);
		setShowCampaignModal(true);
	}, []);

	// Lookalike audience handlers
	const handleStartNewSearch = useCallback(() => {
		// Open lead modal in select mode to choose seed list for lookalike
		console.log("[Lookalike] Opening lead modal for seed selection");
		setLookalikeLeadModalMode("select");
		setLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleAIGenerateSearch = useCallback(() => {
		console.log("[Lookalike] Opening AI search generator");
		setShowAISearchGenerator(true);
	}, []);

	const handleAIGenerateCampaign = useCallback(() => {
		console.log("[Campaign] Opening AI campaign generator");
		setShowAICampaignGenerator(true);
	}, []);

	const handleOpenSavedCampaignTemplates = useCallback(() => {
		console.log("[Campaign] Opening saved campaign templates");
		setShowSavedCampaignTemplates(true);
	}, []);

	// Workflow handlers
	const handleAIGenerateWorkflow = useCallback(() => {
		console.log("[Workflow] Opening AI workflow generator");
		setShowAIWorkflowGenerator(true);
	}, []);

	const handleWorkflowGenerated = useCallback((workflow: any) => {
		console.log("[Workflow] Workflow generated:", workflow);
		setGeneratedWorkflow(workflow);
		setShowAIWorkflowGenerator(false);
		setShowWorkflowExportModal(true);
	}, []);

	const handleWorkflowExported = useCallback((workflowId: string) => {
		console.log("[Workflow] Workflow exported:", workflowId);
		toast.success("Workflow saved successfully!");
		setShowWorkflowExportModal(false);
		setGeneratedWorkflow(null);
	}, []);

	const handleWorkflowRegenerate = useCallback(() => {
		console.log("[Workflow] Regenerating workflow");
		setShowWorkflowExportModal(false);
		setGeneratedWorkflow(null);
		// Reopen AI Workflow Generator to regenerate
		setShowAIWorkflowGenerator(true);
		toast.info("Regenerating workflow...", {
			description: "Please update your prompt and generate again",
		});
	}, []);

	const handleOpenSavedWorkflows = useCallback(() => {
		console.log("[Workflow] Opening saved workflows");
		setShowSavedWorkflows(true);
	}, []);

	const handleCampaignGenerated = useCallback(
		(template: SavedCampaignTemplate) => {
			console.log("\n\n");
			console.log(
				"%c🎯🎯🎯 CAMPAIGN GENERATION START 🎯🎯🎯",
				"background: #4CAF50; color: white; font-size: 20px; padding: 10px;",
			);
			console.log("=".repeat(80));
			console.log("[Campaign] AI campaign generated:", template);

			// Map template to campaign wizard state
			const wizardData = mapTemplateToCampaignWizard(template);
			console.log("[Campaign] 📝 Mapped wizard data:", wizardData);

			// Apply template data to campaign creation store
			const campaignState = useCampaignCreationStore.getState();
			console.log("[Campaign] 📦 Campaign store BEFORE reset:", {
				selectedLeadListId: campaignState.selectedLeadListId,
				selectedAgentId: campaignState.selectedAgentId,
				primaryChannel: campaignState.primaryChannel,
			});

			// Reset store to clear any previous state
			campaignState.reset();
			console.log("[Campaign] 🔄 Store reset complete");

			// Pre-fill campaign wizard with AI-generated data
			campaignState.setCampaignName(template.name);
			console.log("[Campaign] ✅ Campaign name set:", template.name);

			// Set primary channel from template (use first channel if multiple)
			let primaryChannel: string | null = null;
			if (wizardData.channels?.length > 0) {
				primaryChannel = wizardData.channels[0];
				if (
					["call", "text", "email", "social", "directmail"].includes(
						primaryChannel,
					)
				) {
					campaignState.setPrimaryChannel(primaryChannel as any);
					console.log("[Campaign] ✅ Primary channel set:", primaryChannel);
				}
			}

			// Set campaign goal/description
			if (template.description) {
				campaignState.setCampaignGoal(template.description);
				console.log("[Campaign] ✅ Campaign goal set");
			}

			// Set AI agent - use first available agent as suggestion
			console.log(
				"[Campaign] 👥 Available agents:",
				campaignState.availableAgents?.length || 0,
				campaignState.availableAgents?.map((a) => a.name),
			);
			if (campaignState.availableAgents?.length > 0) {
				campaignState.setSelectedAgentId(campaignState.availableAgents[0].id);
				console.log(
					"[Campaign] ✅ Agent set:",
					campaignState.availableAgents[0].name,
				);
			} else {
				console.warn("[Campaign] ⚠️  NO AGENTS AVAILABLE");
			}

			// Set workflow - use first available workflow as suggestion
			console.log(
				"[Campaign] 🔄 Available workflows:",
				campaignState.availableWorkflows?.length || 0,
			);
			if (campaignState.availableWorkflows?.length > 0) {
				campaignState.setSelectedWorkflowId(
					campaignState.availableWorkflows[0].id,
				);
				console.log(
					"[Campaign] ✅ Workflow set:",
					campaignState.availableWorkflows[0].name,
				);
			}

			// Set sales script based on primary channel
			console.log(
				"[Campaign] 📜 Available sales scripts:",
				campaignState.availableSalesScripts?.length || 0,
			);
			if (campaignState.availableSalesScripts?.length > 0) {
				const channelType = wizardData.channels?.[0];
				const matchingScript = campaignState.availableSalesScripts.find(
					(script) => script.type === channelType,
				);
				if (matchingScript) {
					campaignState.setSelectedSalesScriptId(matchingScript.id);
					console.log(
						"[Campaign] ✅ Sales script set (matched):",
						matchingScript.name,
						"for channel:",
						channelType,
					);
				} else {
					// Fallback to first script
					campaignState.setSelectedSalesScriptId(
						campaignState.availableSalesScripts[0].id,
					);
					console.log(
						"[Campaign] ✅ Sales script set (fallback):",
						campaignState.availableSalesScripts[0].name,
					);
				}
			}

			// Set channel-specific customizations
			console.log(
				"[Campaign] 🎛️  Setting channel-specific customizations for:",
				primaryChannel,
			);

			// Voicemail preferences for call campaigns
			if (primaryChannel === "call") {
				campaignState.setDoVoicemailDrops(true);
				campaignState.setCountVoicemailAsAnswered(false);
				campaignState.setPreferredVoicemailMessageId("vm_professional");
				campaignState.setPreferredVoicemailVoiceId("voice_emma");
				console.log("[Campaign] ✅ Voicemail settings configured");

				// Add transfer agent guidance to campaign goal for call campaigns
				// NOTE: Transfer fields are FORM-specific, not store-level
				// They must be set via form.setValue() in the modal, not here
				console.log(
					"[Campaign] 🔄 Checking transfer agent setup - agents available:",
					campaignState.availableAgents?.length || 0,
				);
				if (campaignState.availableAgents?.length > 1) {
					const transferAgent = campaignState.availableAgents[1];
					console.log(
						"[Campaign] ✅ Transfer agent identified:",
						transferAgent.name,
					);

					// Add transfer guidance to campaign goal for user reference
					const transferGuidance = `\n\n🔄 TRANSFER SETUP (Call Campaigns):\n• Suggested Agent: ${transferAgent.name} (${transferAgent.email})\n• Recommended Type: Inbound Call\n• Guidelines: Route qualified leads to ${transferAgent.name} for closing\n• Prompt Example: "Let me connect you with ${transferAgent.name} who can help you further"`;
					const currentGoal =
						campaignState.campaignGoal || template.description || "";
					campaignState.setCampaignGoal(currentGoal + transferGuidance);

					console.log(
						"[Campaign] ℹ️  Transfer guidance added to campaign goal (user can enable manually in Channel Customization step)",
					);
				} else {
					console.warn(
						"[Campaign] ⚠️  Only 1 agent - transfer guidance skipped (needs 2+ agents)",
					);
				}
			}

			// Text/SMS options for text campaigns
			if (primaryChannel === "text") {
				campaignState.setSmsCanSendImages(true);
				campaignState.setSmsCanSendVideos(false);
				campaignState.setSmsCanSendLinks(true);
				campaignState.setSmsAppendAgentName(true);
				campaignState.setSmsMediaSource("hybrid");
				campaignState.setTextSignature("Best regards");
				console.log("[Campaign] ✅ SMS/Text options configured");
			}

			// Number pooling settings (recommended for all campaigns)
			campaignState.setNumberPoolingEnabled(true);
			campaignState.setSmartEncodingEnabled(true);
			campaignState.setOptOutHandlingEnabled(true);
			campaignState.setPerNumberDailyLimit(75);
			campaignState.setNumberSelectionStrategy("round_robin");
			console.log("[Campaign] ✅ Number pooling configured");

			// Auto-select sender numbers if available
			console.log(
				"[Campaign] 📞 Available sender numbers:",
				campaignState.availableSenderNumbers?.length || 0,
			);
			if (campaignState.availableSenderNumbers?.length > 0) {
				// Select all available sender numbers for pooling
				campaignState.setSelectedSenderNumbers(
					campaignState.availableSenderNumbers,
				);
				console.log(
					"[Campaign] ✅ Auto-selected ALL sender numbers:",
					campaignState.availableSenderNumbers.length,
				);
			} else {
				console.warn(
					"[Campaign] ⚠️  NO SENDER NUMBERS - Number pooling won't work",
				);
			}

			// Set schedule/timing if available
			if (wizardData.schedule) {
				if (wizardData.schedule.startDate) {
					campaignState.setStartDate(new Date(wizardData.schedule.startDate));
				}
				if (wizardData.schedule.endDate) {
					campaignState.setEndDate(new Date(wizardData.schedule.endDate));
				}
				if (wizardData.schedule.daysSelected) {
					campaignState.setDaysSelected(wizardData.schedule.daysSelected);
				}
				// Set timing preferences
				if (wizardData.schedule.reachBeforeBusiness !== undefined) {
					campaignState.setReachBeforeBusiness(
						wizardData.schedule.reachBeforeBusiness,
					);
				}
				if (wizardData.schedule.reachAfterBusiness !== undefined) {
					campaignState.setReachAfterBusiness(
						wizardData.schedule.reachAfterBusiness,
					);
				}
				if (wizardData.schedule.reachOnWeekend !== undefined) {
					campaignState.setReachOnWeekend(wizardData.schedule.reachOnWeekend);
				}
			}

			// Set lead list - FORCE selection using areaMode
			campaignState.setAreaMode("leadList"); // Ensure we're in lead list mode
			campaignState.setAbTestingEnabled(false); // Disable A/B testing by default

			let selectedLeadListId = wizardData.audience?.leadListId || "";
			let selectedLeadListName =
				wizardData.audience?.leadListName || "AI Generated";
			let selectedLeadCount = wizardData.audience?.leadCount || 0;

			if (wizardData.audience?.leadListId) {
				selectedLeadListId = wizardData.audience.leadListId;
				selectedLeadListName =
					wizardData.audience.leadListName || "Template Lead List";
				selectedLeadCount = wizardData.audience.leadCount || 0;
			} else {
				// Auto-select first available lead list if template doesn't have one
				const availableLeadLists = leadListStore.leadLists; // FIXED: Use leadLists not items
				console.log(
					"[Campaign] 📋 Available lead lists:",
					availableLeadLists?.length || 0,
				);
				console.log(
					"[Campaign] 📋 Lead lists in store:",
					availableLeadLists?.map((l) => ({
						id: l.id,
						name: l.listName,
						records: l.records,
					})),
				);

				if (availableLeadLists?.length > 0) {
					const firstList = availableLeadLists[0];
					selectedLeadListId = firstList.id;
					selectedLeadListName = firstList.listName; // FIXED: Use listName not name
					selectedLeadCount = firstList.records || 0; // FIXED: Use records not totalLeads

					console.log("[Campaign] ✅ Auto-selected lead list:", {
						id: firstList.id,
						name: firstList.listName,
						records: firstList.records,
					});
				} else {
					console.warn("[Campaign] ⚠️  NO LEAD LISTS AVAILABLE");
					console.warn(
						"[Campaign] 💡 Solution: Upload/import leads first before creating campaigns",
					);
				}
			}

			// Set both selectedLeadListId and selectedLeadListAId for compatibility
			if (selectedLeadListId) {
				campaignState.setSelectedLeadListId(selectedLeadListId);
				campaignState.setSelectedLeadListAId(selectedLeadListId); // Some components read from A/B field
				campaignState.setLeadCount(selectedLeadCount);

				console.log("[Campaign] ✅ Store fields set:", {
					selectedLeadListId: campaignState.selectedLeadListId,
					selectedLeadListAId: campaignState.selectedLeadListAId,
					leadCount: campaignState.leadCount,
				});
			} else {
				console.warn(
					"[Campaign] ⚠️  No lead list to set - campaign will require manual selection",
				);
			}

			// Log the final state before opening modal
			console.log("=".repeat(80));
			console.log("📊 [FINAL STATE BEFORE MODAL OPEN]");
			console.log("=".repeat(80));
			console.log("[Campaign] Modal Context:", {
				leadListId: selectedLeadListId,
				leadListName: selectedLeadListName,
				leadCount: selectedLeadCount,
			});
			console.log("[Campaign] Store State:", {
				selectedLeadListId: campaignState.selectedLeadListId,
				selectedLeadListAId: campaignState.selectedLeadListAId,
				leadCount: campaignState.leadCount,
				areaMode: campaignState.areaMode,
				primaryChannel: campaignState.primaryChannel,
				agentId: campaignState.selectedAgentId,
				workflowId: campaignState.selectedWorkflowId,
				scriptId: campaignState.selectedSalesScriptId,
				voicemailDrops: campaignState.doVoicemailDrops,
				numberPooling: campaignState.numberPoolingEnabled,
				selectedSenderNumbers: campaignState.selectedSenderNumbers?.length || 0,
				// Transfer settings are form-specific, not in store
			});
			console.log("=".repeat(80));

			// Open campaign creation modal with pre-filled data
			// Include transfer agent settings for call campaigns with 2+ agents
			let transferSettings = {};
			if (
				primaryChannel === "call" &&
				campaignState.availableAgents?.length > 1
			) {
				const transferAgent = campaignState.availableAgents[1];
				transferSettings = {
					transferEnabled: true,
					transferAgentId: transferAgent.id,
					transferAgentName: transferAgent.name,
					transferType: "inbound_call" as const,
					transferGuidelines: `Route qualified leads to ${transferAgent.name} for closing`,
					transferPrompt: `Let me connect you with ${transferAgent.name} who can help you further`,
				};
				console.log(
					"[Campaign] ✅ Transfer settings prepared:",
					transferSettings,
				);
			}

			const contextToSet = {
				leadListId: selectedLeadListId,
				leadListName: selectedLeadListName,
				leadCount: selectedLeadCount,
				...transferSettings,
			};
			console.log(
				"%c📦 SETTING CAMPAIGN MODAL CONTEXT:",
				"background: #2196F3; color: white; font-size: 16px; padding: 5px;",
				contextToSet,
			);
			setCampaignModalContext(contextToSet);

			console.log("[Campaign] 🚀 Opening campaign modal in 50ms...");

			// Small delay to ensure state updates are applied
			setTimeout(() => {
				setShowCampaignModal(true);
				console.log("[Campaign] ✅ Modal opened");
			}, 50);

			toast.success("Campaign Template Loaded", {
				description: `${template.name} is ready for customization`,
			});
		},
		[leadListStore],
	);

	const handleSelectCampaignTemplate = useCallback(
		(template: SavedCampaignTemplate) => {
			console.log("[Campaign] Template selected:", template);
			// Similar to handleCampaignGenerated but called from saved templates modal
			const wizardData = mapTemplateToCampaignWizard(template);

			// Apply template data to campaign creation store
			const campaignState = useCampaignCreationStore.getState();

			// Reset store to clear any previous state
			campaignState.reset();

			// Pre-fill campaign wizard with template data
			campaignState.setCampaignName(template.name);

			// Set primary channel from template (use first channel if multiple)
			let primaryChannel: string | null = null;
			if (wizardData.channels?.length > 0) {
				primaryChannel = wizardData.channels[0];
				if (
					["call", "text", "email", "social", "directmail"].includes(
						primaryChannel,
					)
				) {
					campaignState.setPrimaryChannel(primaryChannel as any);
				}
			}

			// Set campaign goal/description
			if (template.description) {
				campaignState.setCampaignGoal(template.description);
			}

			// Set AI agent - use first available agent as suggestion
			if (campaignState.availableAgents?.length > 0) {
				campaignState.setSelectedAgentId(campaignState.availableAgents[0].id);
			}

			// Set workflow - use first available workflow as suggestion
			if (campaignState.availableWorkflows?.length > 0) {
				campaignState.setSelectedWorkflowId(
					campaignState.availableWorkflows[0].id,
				);
			}

			// Set sales script based on primary channel
			if (campaignState.availableSalesScripts?.length > 0) {
				const channelType = wizardData.channels?.[0];
				const matchingScript = campaignState.availableSalesScripts.find(
					(script) => script.type === channelType,
				);
				if (matchingScript) {
					campaignState.setSelectedSalesScriptId(matchingScript.id);
				} else {
					// Fallback to first script
					campaignState.setSelectedSalesScriptId(
						campaignState.availableSalesScripts[0].id,
					);
				}
			}

			// Set channel-specific customizations
			// primaryChannel already declared above, reuse it

			// Voicemail preferences for call campaigns
			if (primaryChannel === "call") {
				campaignState.setDoVoicemailDrops(true);
				campaignState.setCountVoicemailAsAnswered(false);
				campaignState.setPreferredVoicemailMessageId("vm_professional");
				campaignState.setPreferredVoicemailVoiceId("voice_emma");

				// Add transfer agent guidance to campaign goal for call campaigns
				// NOTE: Transfer fields are FORM-specific, not store-level
				// They must be set via form.setValue() in the modal, not here
				console.log(
					"[Campaign] 🔄 Checking transfer agent setup - agents available:",
					campaignState.availableAgents?.length || 0,
				);
				if (campaignState.availableAgents?.length > 1) {
					const transferAgent = campaignState.availableAgents[1];
					console.log(
						"[Campaign] ✅ Transfer agent identified:",
						transferAgent.name,
					);

					// Add transfer guidance to campaign goal for user reference
					const transferGuidance = `\n\n🔄 TRANSFER SETUP (Call Campaigns):\n• Suggested Agent: ${transferAgent.name} (${transferAgent.email})\n• Recommended Type: Inbound Call\n• Guidelines: Route qualified leads to ${transferAgent.name} for closing\n• Prompt Example: "Let me connect you with ${transferAgent.name} who can help you further"`;
					const currentGoal =
						campaignState.campaignGoal || template.description || "";
					campaignState.setCampaignGoal(currentGoal + transferGuidance);

					console.log(
						"[Campaign] ℹ️  Transfer guidance added to campaign goal (user can enable manually in Channel Customization step)",
					);
				} else {
					console.warn(
						"[Campaign] ⚠️  Only 1 agent - transfer guidance skipped (needs 2+ agents)",
					);
				}
			}

			// Text/SMS options for text campaigns
			if (primaryChannel === "text") {
				campaignState.setSmsCanSendImages(true);
				campaignState.setSmsCanSendVideos(false);
				campaignState.setSmsCanSendLinks(true);
				campaignState.setSmsAppendAgentName(true);
				campaignState.setSmsMediaSource("hybrid");
				campaignState.setTextSignature("Best regards");
				console.log("[Campaign] ✅ SMS/Text options configured");
			}

			// Number pooling settings (recommended for all campaigns)
			campaignState.setNumberPoolingEnabled(true);
			campaignState.setSmartEncodingEnabled(true);
			campaignState.setOptOutHandlingEnabled(true);
			campaignState.setPerNumberDailyLimit(75);
			campaignState.setNumberSelectionStrategy("round_robin");
			console.log("[Campaign] ✅ Number pooling configured");

			// Auto-select sender numbers if available
			console.log(
				"[Campaign] 📞 Available sender numbers:",
				campaignState.availableSenderNumbers?.length || 0,
			);
			if (campaignState.availableSenderNumbers?.length > 0) {
				// Select all available sender numbers for pooling
				campaignState.setSelectedSenderNumbers(
					campaignState.availableSenderNumbers,
				);
				console.log(
					"[Campaign] ✅ Auto-selected ALL sender numbers:",
					campaignState.availableSenderNumbers.length,
				);
			} else {
				console.warn(
					"[Campaign] ⚠️  NO SENDER NUMBERS - Number pooling won't work",
				);
			}

			// Set schedule/timing if available
			if (wizardData.schedule) {
				if (wizardData.schedule.startDate) {
					campaignState.setStartDate(new Date(wizardData.schedule.startDate));
				}
				if (wizardData.schedule.endDate) {
					campaignState.setEndDate(new Date(wizardData.schedule.endDate));
				}
				if (wizardData.schedule.daysSelected) {
					campaignState.setDaysSelected(wizardData.schedule.daysSelected);
				}
				// Set timing preferences
				if (wizardData.schedule.reachBeforeBusiness !== undefined) {
					campaignState.setReachBeforeBusiness(
						wizardData.schedule.reachBeforeBusiness,
					);
				}
				if (wizardData.schedule.reachAfterBusiness !== undefined) {
					campaignState.setReachAfterBusiness(
						wizardData.schedule.reachAfterBusiness,
					);
				}
				if (wizardData.schedule.reachOnWeekend !== undefined) {
					campaignState.setReachOnWeekend(wizardData.schedule.reachOnWeekend);
				}
			}

			// Set lead list - FORCE selection using areaMode
			campaignState.setAreaMode("leadList"); // Ensure we're in lead list mode
			campaignState.setAbTestingEnabled(false); // Disable A/B testing by default

			let selectedLeadListId = wizardData.audience?.leadListId || "";
			let selectedLeadListName =
				wizardData.audience?.leadListName || template.name;
			let selectedLeadCount = wizardData.audience?.leadCount || 0;

			if (wizardData.audience?.leadListId) {
				selectedLeadListId = wizardData.audience.leadListId;
				selectedLeadListName =
					wizardData.audience.leadListName || "Template Lead List";
				selectedLeadCount = wizardData.audience.leadCount || 0;
			} else {
				// Auto-select first available lead list if template doesn't have one
				const availableLeadLists = leadListStore.leadLists; // FIXED: Use leadLists not items
				console.log(
					"[Campaign] 📋 Available lead lists:",
					availableLeadLists?.length || 0,
				);
				console.log(
					"[Campaign] 📋 Lead lists in store:",
					availableLeadLists?.map((l) => ({
						id: l.id,
						name: l.listName,
						records: l.records,
					})),
				);

				if (availableLeadLists?.length > 0) {
					const firstList = availableLeadLists[0];
					selectedLeadListId = firstList.id;
					selectedLeadListName = firstList.listName; // FIXED: Use listName not name
					selectedLeadCount = firstList.records || 0; // FIXED: Use records not totalLeads

					console.log("[Campaign] ✅ Auto-selected lead list:", {
						id: firstList.id,
						name: firstList.listName,
						records: firstList.records,
					});
				} else {
					console.warn("[Campaign] ⚠️  NO LEAD LISTS AVAILABLE");
					console.warn(
						"[Campaign] 💡 Solution: Upload/import leads first before creating campaigns",
					);
				}
			}

			// Set both selectedLeadListId and selectedLeadListAId for compatibility
			if (selectedLeadListId) {
				campaignState.setSelectedLeadListId(selectedLeadListId);
				campaignState.setSelectedLeadListAId(selectedLeadListId); // Some components read from A/B field
				campaignState.setLeadCount(selectedLeadCount);

				console.log("[Campaign] ✅ Store fields set:", {
					selectedLeadListId: campaignState.selectedLeadListId,
					selectedLeadListAId: campaignState.selectedLeadListAId,
					leadCount: campaignState.leadCount,
				});
			} else {
				console.warn(
					"[Campaign] ⚠️  No lead list to set - campaign will require manual selection",
				);
			}

			// Log the final state before opening modal
			console.log("[Campaign] Final state before modal:", {
				selectedLeadListId,
				selectedLeadListName,
				selectedLeadCount,
				storeLeadListId: campaignState.selectedLeadListId,
				storeLeadListAId: campaignState.selectedLeadListAId,
				storeLeadCount: campaignState.leadCount,
				primaryChannel: campaignState.primaryChannel,
				agentId: campaignState.selectedAgentId,
				workflowId: campaignState.selectedWorkflowId,
				scriptId: campaignState.selectedSalesScriptId,
			});

			// Include transfer agent settings for call campaigns with 2+ agents
			let transferSettings = {};
			// Use primaryChannel already declared above
			if (
				primaryChannel === "call" &&
				campaignState.availableAgents?.length > 1
			) {
				const transferAgent = campaignState.availableAgents[1];
				transferSettings = {
					transferEnabled: true,
					transferAgentId: transferAgent.id,
					transferAgentName: transferAgent.name,
					transferType: "inbound_call" as const,
					transferGuidelines: `Route qualified leads to ${transferAgent.name} for closing`,
					transferPrompt: `Let me connect you with ${transferAgent.name} who can help you further`,
				};
				console.log(
					"[Campaign] ✅ Transfer settings prepared:",
					transferSettings,
				);
			}

			setCampaignModalContext({
				leadListId: selectedLeadListId,
				leadListName: selectedLeadListName,
				leadCount: selectedLeadCount,
				...transferSettings,
			});

			// Close templates modal and open campaign modal
			setShowSavedCampaignTemplates(false);
			setTimeout(() => {
				setShowCampaignModal(true);
			}, 150);

			toast.success("Template Loaded", {
				description: `Using ${template.name}`,
			});
		},
		[leadListStore],
	);

	const handleAISearchGenerated = useCallback((search: SavedSearch) => {
		console.log("[Lookalike] AI search generated:", search);
		// Load the AI-generated search
		if (search.lookalikeConfig) {
			const config = search.lookalikeConfig;
			const seedLeadCount = config.seedLeadCount || 100;

			setSeedLeadListData({
				listId: config.seedListId || `seed_${Date.now()}`,
				listName: config.seedListName || "AI Generated",
				leadCount: seedLeadCount,
			});

			setShowLookalikeConfigModal(true);
		}
	}, []);

	const handleSeedListSelected = useCallback(
		(payload: QuickStartCampaignContext) => {
			console.log("[Lookalike] Seed list selected:", payload);

			// Store seed list data
			const seedData = {
				listId: payload.leadListId,
				listName: payload.leadListName,
				leadCount: payload.leadCount,
			};

			console.log("[Lookalike] Closing lead modal, opening config modal");

			// Close lead modal first
			setShowLeadModal(false);

			// Use setTimeout with state setter to ensure both states are updated together
			setTimeout(() => {
				setSeedLeadListData(seedData);
				setShowLookalikeConfigModal(true);
				console.log("[Lookalike] Config modal should now be open");
			}, 150);
		},
		[],
	);

	const handleSaveLookalikeConfig = useCallback(
		async (config: LookalikeConfig, configName: string) => {
			console.log("[Dashboard] Saving lookalike config:", {
				configName,
				config,
			});

			// Ensure the config has all required fields from current seed list data
			const completeConfig: LookalikeConfig = {
				...config,
				seedListId:
					config.seedListId || seedLeadListData?.listId || `seed_${Date.now()}`,
				seedListName:
					config.seedListName || seedLeadListData?.listName || "Seed List",
				seedLeadCount:
					config.seedLeadCount || seedLeadListData?.leadCount || 100,
			};

			// Create saved search object with user persona and goal
			const savedSearch: SavedSearch = {
				id: `lookalike_config_${Date.now()}`,
				name: configName,
				searchCriteria: {} as any, // Empty for lookalike
				lookalikeConfig: completeConfig,
				userPersona: config.userPersona,
				userGoal: config.userGoal,
				createdAt: new Date(),
				updatedAt: new Date(),
				priority: false,
			};

			console.log("[Dashboard] Complete saved search object:", savedSearch);
			console.log(
				"[Dashboard] Current saved searches:",
				leadSearchStore.savedSearches.length,
			);

			// Add to saved searches store
			leadSearchStore.savedSearches = [
				savedSearch,
				...leadSearchStore.savedSearches,
			];

			console.log(
				"[Dashboard] After save, total searches:",
				leadSearchStore.savedSearches.length,
			);

			toast.success(`Configuration "${configName}" saved to Saved Searches`);
		},
		[seedLeadListData, leadSearchStore],
	);

	const handleLoadSavedLookalikeConfig = useCallback(
		(search: any) => {
			console.log("[Dashboard] Loading saved lookalike config:", search);

			// Load saved lookalike configuration
			if (search.lookalikeConfig) {
				const config = search.lookalikeConfig;

				// Ensure we have valid seed lead count (use a default if missing)
				const seedLeadCount = config.seedLeadCount || 100; // Default to 100 if missing

				console.log("[Dashboard] Setting seed list data:", {
					listId: config.seedListId,
					listName: config.seedListName,
					leadCount: seedLeadCount,
				});

				const seedData = {
					listId: config.seedListId || `seed_${Date.now()}`,
					listName: config.seedListName || "Saved Search",
					leadCount: seedLeadCount,
				};

				setSeedLeadListData(seedData);

				// Use setTimeout to ensure state is updated before opening modal
				setTimeout(() => {
					console.log("[Dashboard] State before opening modal:", {
						seedLeadListData: seedData,
						showModal: true,
					});
					setShowLookalikeConfigModal(true);
					handleCloseSavedSearches();
				}, 100);
			} else {
				console.warn("[Dashboard] No lookalikeConfig found in saved search");
				toast.error("This saved search is not a lookalike configuration");
			}
		},
		[handleCloseSavedSearches],
	);

	// Override saved search handler to support lookalike configs
	const handleSelectSavedSearch = useCallback(
		(search: any) => {
			console.log("[Dashboard] ==========================================");
			console.log("[Dashboard] Saved search selected:", search);
			console.log("[Dashboard] Has lookalikeConfig?", !!search.lookalikeConfig);
			console.log("[Dashboard] Search keys:", Object.keys(search));

			// Check if this is a lookalike configuration
			if (search.lookalikeConfig) {
				console.log("[Dashboard] ✅ Detected lookalike config, loading...");
				handleLoadSavedLookalikeConfig(search);
			} else {
				// Regular property search
				console.log("[Dashboard] ℹ️ Regular saved search, using base handler");
				baseHandleSelectSavedSearch(search);
			}
		},
		[baseHandleSelectSavedSearch, handleLoadSavedLookalikeConfig],
	);

	const handleGenerateLookalike = useCallback(
		async (config: LookalikeConfig) => {
			if (!seedLeadListData) {
				console.error("[Lookalike] No seed list data available");
				toast.error("Please select a seed list first");
				return;
			}

			console.log("[Lookalike] Generating audience with config:", config);

			try {
				// Generate lookalike candidates
				const candidates = await generateLookalikeAudience(config);

				console.log("[Lookalike] Generated candidates:", candidates.length);

				// Validate we have candidates
				if (!candidates || candidates.length === 0) {
					toast.error(
						"No leads matched your criteria. Try adjusting your filters.",
					);
					return;
				}

				// Create audience in store (this also sets currentCandidates)
				const audience = lookalikeStore.createAudience(config, candidates);

				console.log("[Lookalike] Created audience:", audience);
				console.log(
					"[Lookalike] Store currentCandidates:",
					lookalikeStore.currentCandidates.length,
				);

				// Small delay to ensure state is updated
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Close config modal and open results
				setShowLookalikeConfigModal(false);

				// Delay opening results modal slightly to ensure clean state transition
				setTimeout(() => {
					console.log("[Lookalike] Opening results modal with:");
					console.log(
						"  - Candidates:",
						lookalikeStore.currentCandidates.length,
					);
					console.log("  - Seed list name:", seedLeadListData?.listName);
					console.log("  - Seed list data:", seedLeadListData);
					setShowLookalikeResultsModal(true);
				}, 150);
			} catch (error) {
				console.error("[Lookalike] Error generating audience:", error);
				toast.error("Failed to generate lookalike audience. Please try again.");
			}
		},
		[lookalikeStore, seedLeadListData],
	);

	const handleSaveLookalikeAsList = useCallback(
		async (listName: string, selectedCandidates: LookalikeCandidate[]) => {
			console.log(
				"[Dashboard] Saving lookalike list:",
				listName,
				"with",
				selectedCandidates.length,
				"leads",
			);

			// Create a new lead list from selected candidates
			const newList = {
				id: `list_lookalike_${Date.now()}`,
				listName,
				records: selectedCandidates.length,
				leads: selectedCandidates.map((c) => ({
					id: c.leadId,
					firstName: c.firstName,
					lastName: c.lastName,
					address: c.address,
					city: c.city,
					state: c.state,
					zipCode: c.zipCode,
					phoneNumber: c.phoneNumber || "",
					email: c.email || "",
				})),
				createdAt: new Date().toISOString(),
				source: "lookalike",
			};

			leadListStore.addLeadList(newList as any);

			// Save current audience to history WITHOUT clearing currentCandidates
			// (candidates stay available in the modal until user closes it)
			if (lookalikeStore.currentAudience) {
				const audienceToSave = {
					...lookalikeStore.currentAudience,
					status: "active" as const,
				};

				// Add to audiences array but don't clear current state
				lookalikeStore.audiences = [
					...lookalikeStore.audiences,
					audienceToSave,
				];
			}

			console.log("[Dashboard] List saved successfully:", newList.id);

			toast.success(
				`Saved ${selectedCandidates.length} leads to "${listName}"`,
			);

			// Don't close the modal - let user continue working
		},
		[leadListStore, lookalikeStore],
	);

	const handleExportLookalike = useCallback(
		async (
			platforms: AdPlatform[],
			selectedCandidates: LookalikeCandidate[],
		) => {
			if (!lookalikeStore.currentAudience) return;

			const audienceId = lookalikeStore.currentAudience.id;
			const audienceName = lookalikeStore.currentAudience.name;

			// Start export jobs
			const jobs = await exportToMultiplePlatforms(
				audienceId,
				audienceName,
				selectedCandidates,
				platforms,
			);

			// Add jobs to store
			jobs.forEach((job) => lookalikeStore.addExportJob(job));

			// Update audience with exported platforms
			if (lookalikeStore.currentAudience) {
				lookalikeStore.saveAudience({
					...lookalikeStore.currentAudience,
					status: "active",
					exportedTo: platforms,
				});
			}
		},
		[lookalikeStore],
	);

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const handleCampaignModalToggle = useCallback(
		(open: boolean) => {
			setShowCampaignModal(open);
			if (!open) {
				setCampaignModalContext(null);
				setVariantCampaignData(null);
				setIsVariantMode(false);
				// Defer store reset to prevent infinite loops during modal close
				// The reset triggers massive store updates that cause re-renders
				setTimeout(() => {
					campaignStore.reset();
				}, 100);
			}
		},
		[campaignStore],
	);

	const handleCloseBulkModal = () => {
		setShowBulkSuiteModal(false);
		setBulkCsvFile(null);
		setBulkCsvHeaders([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleCsvUpload = useBulkCsvUpload({
		onFileChange: setBulkCsvFile,
		onHeadersParsed: setBulkCsvHeaders,
		onShowModal: () => setShowBulkSuiteModal(true),
	});

	useEffect(() => {
		if (!isExperienceHydrated) {
			return;
		}

		if (!hasSeenWizard && !isWizardOpen) {
			openWizard();
		}
	}, [hasSeenWizard, isExperienceHydrated, isWizardOpen, openWizard]);

	// Removed legacy modal auto-reset effect block referencing undefined refs

	const handleWizardLaunch = useCallback(
		(preset: QuickStartWizardPreset | undefined, action: () => void) => {
			campaignStore.reset();
			if (preset?.templateId) {
				applyQuickStartTemplatePreset(preset.templateId, campaignStore);
				updateLastTemplateId(preset.templateId);
			} else {
				updateLastTemplateId(null);
			}
			launchWithAction(preset, action);
		},
		[campaignStore, launchWithAction, updateLastTemplateId],
	);

	const createRouterPush = useCallback(
		(path: string) => async () => {
			// Get friendly page name from path
			const pageName = path.split("/").pop()?.split("?")[0] || "page";
			const friendlyName = pageName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			console.log("[QuickStart] Navigating to:", path);
			toast.info(`Loading ${friendlyName}...`);

			// Small delay for loading indicator
			await new Promise((resolve) => setTimeout(resolve, 300));

			router.push(path);
		},
		[router],
	);

	const handleLaunchQuickStartFlow = useCallback(() => {
		const { goalId } = useQuickStartWizardDataStore.getState();
		if (!goalId) {
			return;
		}

		const goalDefinition = getGoalDefinition(goalId);
		if (!goalDefinition || goalDefinition.flow.length === 0) {
			return;
		}

		if (goalDefinition.templateId) {
			const campaignState = useCampaignCreationStore.getState();
			campaignState.reset();
			applyQuickStartTemplatePreset(goalDefinition.templateId, campaignState);
			updateLastTemplateId(goalDefinition.templateId);
		}

		const [firstStep] = goalDefinition.flow;
		const launchers: Record<string, () => void> = {
			import: handleImportFromSource,
			campaign: handleCampaignCreate,
			webhooks: () => handleOpenWebhook("incoming"),
			"market-deals": handleStartPropertySearch,
			extension: handleBrowserExtension,
		};

		const launch = launchers[firstStep.cardId];

		if (launch) {
			launch();
			return;
		}

		if (process.env.NODE_ENV !== "production") {
			console.warn(
				`[QuickStartPage] Missing launcher for QuickStart flow card "${firstStep.cardId}".`,
			);
		}
	}, [
		handleImportFromSource,
		handleCampaignCreate,
		handleOpenWebhook,
		handleStartPropertySearch,
		handleBrowserExtension,
		updateLastTemplateId,
	]);

	const quickStartCards = useQuickStartCardViewModel({
		bulkCsvFile,
		bulkCsvHeaders,
		onImport: handleImportFromSource,
		onSelectList: handleSelectList,
		onConfigureConnections: handleConfigureConnections,
		onCampaignCreate: handleCampaignCreate,
		onCreateAbTest: handleCreateAbTest,
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhook,
		onBrowserExtension: handleBrowserExtension,
		createRouterPush,
		onStartNewSearch: handleStartNewSearch,
		onOpenSavedSearches: handleOpenSavedSearches,
		onAIGenerateSearch: handleAIGenerateSearch,
		onAIGenerateCampaign: handleAIGenerateCampaign,
		onOpenSavedCampaignTemplates: handleOpenSavedCampaignTemplates,
		onAIGenerateWorkflow: handleAIGenerateWorkflow,
		onOpenSavedWorkflows: handleOpenSavedWorkflows,
		onLaunchWizard: handleWizardLaunch,
		onLaunchQuickStartFlow: handleLaunchQuickStartFlow,
	});

	const handlePostLaunch = useCallback(() => {
		// After launching a campaign, defer opening webhooks modal
		// to avoid render-time state updates during modal close
		setTimeout(() => {
			openWebhookModal("incoming");
		}, 0);
	}, [openWebhookModal]);

	return (
		<div className="relative min-h-screen">
			{/* Base layer: Light rays */}
			<LightRays className="absolute inset-0 z-0" />

			{/* Middle layer: Collision beams */}
			<BackgroundBeamsWithCollision className="absolute inset-0 z-0 pb-16" />

			{/* Content layer */}
			<div className="container relative z-20 mx-auto px-4 py-8">
				<div className="relative mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl text-foreground">
						Quick Start
					</h1>
					<p className="text-lg text-muted-foreground">
						Get up and running in minutes. Choose how you'd like to begin.
					</p>
					<button
						onClick={() => {
							if (typeof window !== "undefined") {
								window.dispatchEvent(new Event("dealScale:helpFab:show"));
							}
						}}
						className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:bg-muted"
						type="button"
					>
						<HelpCircle className="h-5 w-5" />
					</button>
				</div>

				<QuickStartActionsGrid
					cards={quickStartCards}
					onLaunchGoalFlow={handleLaunchQuickStartFlow}
					onImport={handleSmartImport}
					onCampaignCreate={handleSmartCampaign}
					onOpenWebhookModal={handleSmartWebhook}
					onStartNewSearch={handleStartNewSearch}
					onBrowserExtension={handleBrowserExtension}
					createRouterPush={createRouterPush}
				/>
				<QuickStartWizard />

				<input
					ref={fileInputRef}
					type="file"
					accept=".csv,text/csv"
					onChange={handleCsvUpload}
					className="hidden"
				/>

				<QuickStartLegacyModals
					showLeadModal={showLeadModal}
					leadModalMode={
						lookalikeLeadModalMode === "select" ? "select" : leadModalMode
					}
					onCloseLeadModal={handleCloseLeadModal}
					onLaunchCampaign={
						lookalikeLeadModalMode === "select"
							? handleSeedListSelected
							: handleLaunchCampaign
					}
					showBulkSuiteModal={showBulkSuiteModal}
					onCloseBulkSuite={handleCloseBulkModal}
					bulkCsvFile={bulkCsvFile}
					bulkCsvHeaders={bulkCsvHeaders}
					onSuiteLaunchComplete={(payload) => {
						const result = handleSuiteLaunchComplete(payload);
						handleCloseBulkModal();
						return result;
					}}
					showCampaignModal={showCampaignModal}
					onCampaignModalToggle={handleCampaignModalToggle}
					campaignModalContext={campaignModalContext}
					variantCampaignData={variantCampaignData}
					isVariantMode={isVariantMode}
					savedSearchModalOpen={savedSearchModalOpen}
					onCloseSavedSearches={handleCloseSavedSearches}
					savedSearches={savedSearches}
					onDeleteSavedSearch={deleteSavedSearch}
					onSelectSavedSearch={handleSelectSavedSearch}
					onSetSearchPriority={setSearchPriority}
					showWalkthrough={showWalkthrough}
					onCloseWalkthrough={() => setShowWalkthrough(false)}
					isTourOpen={isTourOpen}
					onStartTour={handleStartTour}
					onCloseTour={handleCloseTour}
					campaignSteps={campaignSteps}
					defaultChannel={(() => {
						if (!lastTemplateId) return undefined;
						const t = getQuickStartTemplate(lastTemplateId);
						if (!t) return undefined;
						return t.primaryChannel === "call" || t.primaryChannel === "text"
							? t.primaryChannel
							: undefined;
					})()}
					onCampaignLaunched={() => handlePostLaunch()}
				/>

				<CampaignSelectorModal
					isOpen={showCampaignSelectorModal}
					onOpenChange={setShowCampaignSelectorModal}
					onSelect={handleCampaignSelected}
				/>

				<LookalikeConfigModal
					isOpen={showLookalikeConfigModal}
					onOpenChange={(open) => {
						console.log(
							"[Dashboard] Config modal onOpenChange:",
							open,
							"seedLeadListData:",
							seedLeadListData,
						);
						setShowLookalikeConfigModal(open);
						// Reset seed data when closing
						if (!open) {
							setSeedLeadListData(null);
						}
					}}
					seedListId={seedLeadListData?.listId || ""}
					seedListName={seedLeadListData?.listName || "Seed List"}
					seedLeadCount={seedLeadListData?.leadCount || 0}
					userPersona={useQuickStartWizardDataStore.getState().personaId}
					userGoal={useQuickStartWizardDataStore.getState().goalId}
					onGenerate={handleGenerateLookalike}
					onSaveConfig={handleSaveLookalikeConfig}
				/>

				<LookalikeResultsModal
					isOpen={showLookalikeResultsModal}
					onOpenChange={(open) => {
						setShowLookalikeResultsModal(open);
						// Don't clear candidates while modal is open or closing
						if (!open) {
							// Only clear after a delay to allow animations
							setTimeout(() => {
								if (!showLookalikeResultsModal) {
									lookalikeStore.currentCandidates = [];
									setSeedLeadListData(null);
								}
							}, 300);
						}
					}}
					candidates={lookalikeStore.currentCandidates}
					seedListName={seedLeadListData?.listName || ""}
					onSaveAsList={handleSaveLookalikeAsList}
					onExport={handleExportLookalike}
					existingLookalikeVersions={
						// Count existing lookalike versions for this seed list
						leadListStore.leadLists.filter((list) =>
							list.listName.startsWith(
								`Lookalike - ${seedLeadListData?.listName}`,
							),
						).length
					}
				/>

				<AISavedSearchGenerator
					isOpen={showAISearchGenerator}
					onOpenChange={setShowAISearchGenerator}
					onSearchGenerated={handleAISearchGenerated}
					availableSeedLists={leadListStore.leadLists.map((list) => ({
						id: list.id,
						name: list.listName,
						leadCount: list.records,
					}))}
				/>

				<AICampaignGenerator
					isOpen={showAICampaignGenerator}
					onOpenChange={(open) => setShowAICampaignGenerator(open)}
					onCampaignGenerated={handleCampaignGenerated}
				/>

				<SavedCampaignTemplatesModal
					open={showSavedCampaignTemplates}
					onClose={() => setShowSavedCampaignTemplates(false)}
					templates={useSavedCampaignTemplatesStore.getState().list()}
					onDelete={(id) => {
						useSavedCampaignTemplatesStore.getState().deleteTemplate(id);
						toast.success("Template Deleted");
					}}
					onSelect={handleSelectCampaignTemplate}
					onSetPriority={(id) => {
						const templates = useSavedCampaignTemplatesStore.getState().list();
						const template = templates.find((t) => t.id === id);
						if (template) {
							useSavedCampaignTemplatesStore.getState().updateTemplate(id, {
								priority: !template.priority,
							});
							toast.success(
								template.priority
									? "Removed from favorites"
									: "Added to favorites",
							);
						}
					}}
					onToggleMonetization={(id) => {
						const templates = useSavedCampaignTemplatesStore.getState().list();
						const template = templates.find((t) => t.id === id);
						if (template?.monetization) {
							const newMonetization = {
								...template.monetization,
								enabled: !template.monetization.enabled,
								isPublic: !template.monetization.enabled,
							};
							useSavedCampaignTemplatesStore.getState().updateTemplate(id, {
								monetization: newMonetization,
							});
							toast.success(
								newMonetization.enabled
									? "Template is now public in marketplace"
									: "Template removed from marketplace",
								{
									description: newMonetization.enabled
										? `Earning ${template.monetization.priceMultiplier}x per use`
										: "Template is now private",
								},
							);
						}
					}}
				/>

				{/* Workflow Modals */}
				<AIWorkflowGenerator
					isOpen={showAIWorkflowGenerator}
					onClose={() => setShowAIWorkflowGenerator(false)}
					onGenerate={async (data) => {
						console.log("[Workflow] Generating workflow:", data);
						// Pass the workflow data to the export modal
						handleWorkflowGenerated(data);
					}}
				/>

				{generatedWorkflow && (
					<WorkflowExportModal
						isOpen={showWorkflowExportModal}
						onClose={() => {
							setShowWorkflowExportModal(false);
							setGeneratedWorkflow(null);
						}}
						generatedWorkflow={generatedWorkflow}
						onExported={handleWorkflowExported}
						onRegenerate={handleWorkflowRegenerate}
					/>
				)}

				<SavedWorkflowsModal
					open={showSavedWorkflows}
					onClose={() => setShowSavedWorkflows(false)}
					workflows={useSavedWorkflowsStore.getState().list()}
					onDelete={(id) => {
						useSavedWorkflowsStore.getState().deleteWorkflow(id);
						toast.success("Workflow Deleted");
					}}
					onSelect={(workflow) => {
						console.log("[Workflow] Selected workflow:", workflow);
						toast.info("Workflow Selected", {
							description: `Using ${workflow.name} workflow`,
						});
						setShowSavedWorkflows(false);
					}}
					onSetPriority={(id) => {
						console.log("[Workflow] Toggle priority for:", id);
						toast.success("Priority toggled");
					}}
					onToggleMonetization={(id) => {
						const workflows = useSavedWorkflowsStore.getState().list();
						const workflow = workflows.find((w) => w.id === id);
						if (workflow?.monetization) {
							useSavedWorkflowsStore.getState().toggleMonetization(id);
							const newEnabled = !workflow.monetization.enabled;
							toast.success(
								newEnabled
									? "Workflow is now public in marketplace"
									: "Workflow removed from marketplace",
								{
									description: newEnabled
										? `Earning ${workflow.monetization.priceMultiplier}x per use`
										: "Workflow is now private",
								},
							);
						}
					}}
					onReExport={(id, platform) => {
						console.log(
							"[Workflow] Re-exporting workflow:",
							id,
							"to",
							platform,
						);
						toast.success(`Re-exporting to ${platform}`, {
							description: "Workflow will be updated on the platform",
						});
					}}
				/>

				<QuickStartSupportCard />
			</div>
		</div>
	);
}
