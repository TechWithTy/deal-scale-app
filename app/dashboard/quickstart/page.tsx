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
import { applyQuickStartTemplatePreset } from "@/lib/config/quickstart/templates";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { shallow } from "zustand/shallow";

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
	const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
	const [bulkCsvHeaders, setBulkCsvHeaders] = useState<string[]>([]);

	// Minimal debug logger to satisfy calls
	const logQuickStartDebug = () => {};

	const openWebhookModal = useModalStore((state) => state.openWebhookModal);
	const openWizard = useQuickStartWizardStore((state) => state.open);
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

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleSelectList = () => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	};

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: QuickStartCampaignContext) => {
			campaignStore.reset();
			campaignStore.setAreaMode("leadList");
			campaignStore.setSelectedLeadListId(leadListId);
			campaignStore.setLeadCount(leadCount);
			campaignStore.setCampaignName(`${leadListName} Campaign`);
			setCampaignModalContext({ leadListId, leadListName, leadCount });
			setShowCampaignModal(true);
			setShowLeadModal(false);
		},
		[campaignStore],
	);

	const handleSuiteLaunchComplete = useCallback(
		(payload: QuickStartCampaignContext) => {
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign],
	);

	const handleCloseLeadModal = () => setShowLeadModal(false);

	const handleImportFromSource = () => {
		triggerFileInput();
	};

	const handleConfigureConnections = () => {
		router.push("/dashboard/integrations");
	};

	const handleCampaignCreate = () => {
		setShowCampaignModal(true);
	};

	const handleViewTemplates = () => {
		router.push("/dashboard/campaigns/templates");
	};

	const handleOpenWebhook = (stage: WebhookStage) => {
		openWebhookModal(stage);
	};

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const handleCampaignModalToggle = (open: boolean) => {
		setShowCampaignModal(open);
		if (!open) {
			setCampaignModalContext(null);
			campaignStore.reset();
		}
	};

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

	// Removed legacy modal auto-reset effect block referencing undefined refs

	const handleWizardLaunch = useCallback(
		(preset?: QuickStartWizardPreset) => {
			campaignStore.reset();
			if (preset?.templateId) {
				applyQuickStartTemplatePreset(preset.templateId, campaignStore);
			}
			openWizard(preset);
		},
		[campaignStore, openWizard],
	);

	const createRouterPush = useCallback(
		(path: string) => () => {
			router.push(path);
		},
		[router],
	);

	const quickStartCards = useQuickStartCardViewModel({
		bulkCsvFile,
		bulkCsvHeaders,
		onImport: handleImportFromSource,
		onSelectList: handleSelectList,
		onConfigureConnections: handleConfigureConnections,
		onCampaignCreate: handleCampaignCreate,
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhook,
		onBrowserExtension: () => router.push("/dashboard/extensions"),
		createRouterPush,
		onStartNewSearch: handleStartNewSearch,
		onOpenSavedSearches: handleOpenSavedSearches,
		onLaunchWizard: handleWizardLaunch,
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="relative mb-8 text-center">
				<h1 className="mb-2 font-bold text-3xl text-foreground">Quick Start</h1>
				<p className="text-lg text-muted-foreground">
					Get up and running in minutes. Choose how you’d like to begin.
				</p>
				<button
					onClick={() => setShowWalkthrough(true)}
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
			/>

			<QuickStartSupportCard />
		</div>
	);
}
