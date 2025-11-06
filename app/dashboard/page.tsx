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
import { CampaignSelectorModal } from "@/components/reusables/modals/user/campaign/CampaignSelectorModal";
import { LookalikeConfigModal } from "@/components/reusables/modals/user/lookalike/LookalikeConfigModal";
import { LookalikeResultsModal } from "@/components/reusables/modals/user/lookalike/LookalikeResultsModal";
import { useLookalikeStore } from "@/lib/stores/lookalike";
import { generateLookalikeAudience } from "@/lib/api/lookalike/generate";
import { exportToMultiplePlatforms } from "@/lib/api/lookalike/export";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type {
	LookalikeConfig,
	LookalikeCandidate,
	AdPlatform,
} from "@/types/lookalike";
import type { SavedSearch } from "@/types/userProfile";
import { toast } from "sonner";

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

			// Create saved search object
			const savedSearch: SavedSearch = {
				id: `lookalike_config_${Date.now()}`,
				name: configName,
				searchCriteria: {} as any, // Empty for lookalike
				lookalikeConfig: completeConfig,
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

			<QuickStartSupportCard />
		</div>
	);
}
