"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import QuickStartActionsGrid from "@/components/quickstart/QuickStartActionsGrid";
import QuickStartWizard from "@/components/quickstart/wizard/QuickStartWizard";
import QuickStartLegacyModals, {
	type QuickStartCampaignContext,
} from "@/components/quickstart/QuickStartLegacyModals";
import QuickStartSupportCard from "@/components/quickstart/QuickStartSupportCard";
import { useBulkCsvUpload } from "@/components/quickstart/useBulkCsvUpload";
import { useQuickStartCardViewModel } from "@/components/quickstart/useQuickStartCardViewModel";
import { useQuickStartSavedSearches } from "@/components/quickstart/useQuickStartSavedSearches";
import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import {
	applyQuickStartTemplatePreset,
	getQuickStartTemplate,
	type QuickStartTemplateId,
} from "@/lib/config/quickstart/templates";
import { getGoalDefinition } from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";
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

	const {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleCloseSavedSearches,
		handleSelectSavedSearch,
		handleStartNewSearch,
		handleOpenSavedSearches,
		savedSearchModalOpen,
	} = useQuickStartSavedSearches();

	const triggerFileInput = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
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

	const handleCloseLeadModal = () => setShowLeadModal(false);

	const handleImportFromSource = useCallback(() => {
		triggerFileInput();
	}, [triggerFileInput]);

	const handleConfigureConnections = useCallback(() => {
		router.push("/dashboard/integrations");
	}, [router]);

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

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const handleCampaignModalToggle = useCallback(
		(open: boolean) => {
			setShowCampaignModal(open);
			if (!open) {
				setCampaignModalContext(null);
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
		(path: string) => () => {
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
			"market-deals": handleStartNewSearch,
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
		handleStartNewSearch,
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
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhook,
		onBrowserExtension: handleBrowserExtension,
		createRouterPush,
		onStartNewSearch: handleStartNewSearch,
		onOpenSavedSearches: handleOpenSavedSearches,
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
		<div className="container mx-auto px-4 py-8">
			<div className="relative mb-8 text-center">
				<h1 className="mb-2 font-bold text-3xl text-foreground">Quick Start</h1>
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

			<QuickStartActionsGrid cards={quickStartCards} />
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
				leadModalMode={leadModalMode}
				onCloseLeadModal={handleCloseLeadModal}
				onLaunchCampaign={handleLaunchCampaign}
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

			<QuickStartSupportCard />
		</div>
	);
}
