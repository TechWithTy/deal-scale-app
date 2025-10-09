"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import QuickStartActionsGrid from "@/components/quickstart/QuickStartActionsGrid";
import QuickStartBadgeList from "@/components/quickstart/QuickStartBadgeList";
import QuickStartHeader from "@/components/quickstart/QuickStartHeader";
import QuickStartHelp from "@/components/quickstart/QuickStartHelp";
import { useBulkCsvUpload } from "@/components/quickstart/useBulkCsvUpload";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore, type WebhookStage } from "@/lib/stores/dashboard";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { SavedSearch } from "@/types/userProfile";

interface CampaignContext {
	leadListId: string;
	leadListName: string;
	leadCount: number;
}

export default function QuickStartPage() {
	const [showLeadModal, setShowLeadModal] = useState(false);
	const [leadModalMode, setLeadModalMode] = useState<"select" | "create">(
		"create",
	);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
	const [bulkCsvHeaders, setBulkCsvHeaders] = useState<string[]>([]);
	const [showBulkSuiteModal, setShowBulkSuiteModal] = useState(false);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [campaignModalContext, setCampaignModalContext] =
		useState<CampaignContext | null>(null);
	const [showSavedSearchModal, setShowSavedSearchModal] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);

	const resetCampaignStore = useCampaignCreationStore((state) => state.reset);
	const setAreaMode = useCampaignCreationStore((state) => state.setAreaMode);
	const setSelectedLeadListId = useCampaignCreationStore(
		(state) => state.setSelectedLeadListId,
	);
	const setLeadCount = useCampaignCreationStore((state) => state.setLeadCount);
	const setCampaignName = useCampaignCreationStore(
		(state) => state.setCampaignName,
	);
	const {
		savedSearches,
		selectSavedSearch,
		deleteSavedSearch,
		setSearchPriority,
	} = useLeadSearchStore((state) => ({
		savedSearches: state.savedSearches,
		selectSavedSearch: state.selectSavedSearch,
		deleteSavedSearch: state.deleteSavedSearch,
		setSearchPriority: state.setSearchPriority,
	}));

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: CampaignContext) => {
			resetCampaignStore();
			setAreaMode("leadList");
			setSelectedLeadListId(leadListId);
			setLeadCount(leadCount);
			setCampaignName(`${leadListName} Campaign`);
			setCampaignModalContext({ leadListId, leadListName, leadCount });
			setShowCampaignModal(true);
			setShowLeadModal(false);
		},
		[
			resetCampaignStore,
			setAreaMode,
			setSelectedLeadListId,
			setLeadCount,
			setCampaignName,
		],
	);

	const handleSuiteLaunchComplete = useCallback(
		(payload: CampaignContext) => {
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign],
	);

	const handleCloseLeadModal = useCallback(() => {
		setShowLeadModal(false);
	}, []);

	const handleConnectionSettings = useCallback(() => {
		toast.info("Data source connections and API configuration coming soon!");
	}, []);

	const handleImportFromSource = useCallback(() => {
		setShowBulkSuiteModal(true);
	}, []);

	const handleCampaignCreation = useCallback(() => {
		resetCampaignStore();
		setAreaMode("leadList");
		setCampaignModalContext(null);
		setShowCampaignModal(true);
	}, [resetCampaignStore, setAreaMode]);

	const handleViewTemplates = useCallback(() => {
		toast.info("Campaign templates feature coming soon!");
	}, []);

	const handleOpenWebhookModal = useCallback(
		(stage: WebhookStage) => {
			openWebhookModal(stage);
		},
		[openWebhookModal],
	);

	const handleWalkthroughOpen = useCallback(() => {
		setShowWalkthrough(true);
	}, []);

	const handleStartTour = useCallback(() => {
		setIsTourOpen(true);
	}, []);

	const handleCloseTour = useCallback(() => {
		setIsTourOpen(false);
	}, []);

	const handleBrowserExtension = useCallback(() => {
		window.open("https://chrome.google.com/webstore", "_blank");
		toast("Browser extension download coming soon!");
	}, []);

	const handleStartSearch = useCallback(() => {
		router.push("/dashboard");
	}, [router]);

	const handleOpenSavedSearchModal = useCallback(() => {
		setShowSavedSearchModal(true);
	}, []);

	const handleCloseSavedSearchModal = useCallback(() => {
		setShowSavedSearchModal(false);
	}, []);

	const handleSavedSearchSelect = useCallback(
		(search: SavedSearch) => {
			selectSavedSearch(search);
			setShowSavedSearchModal(false);
			router.push("/dashboard");
		},
		[router, selectSavedSearch],
	);

	const handleSavedSearchDelete = useCallback(
		(id: string) => {
			deleteSavedSearch(id);
		},
		[deleteSavedSearch],
	);

	const handleSavedSearchPriority = useCallback(
		(id: string) => {
			setSearchPriority(id);
		},
		[setSearchPriority],
	);

	const createRouterPush = useCallback(
		(path: string) => () => {
			router.push(path);
		},
		[router],
	);

	const handleCampaignModalToggle = useCallback(
		(open: boolean) => {
			setShowCampaignModal(open);
			if (!open) {
				setCampaignModalContext(null);
				resetCampaignStore();
			}
		},
		[resetCampaignStore],
	);

	const handleCloseBulkModal = useCallback(() => {
		setShowBulkSuiteModal(false);
		setBulkCsvFile(null);
		setBulkCsvHeaders([]);
	}, []);

	const handleCsvUpload = useBulkCsvUpload({
		onFileChange: setBulkCsvFile,
		onHeadersParsed: setBulkCsvHeaders,
		onShowModal: () => setShowBulkSuiteModal(true),
	});

	const cards = useQuickStartCards({
		onImport: handleImportFromSource,
		onSelectList: handleSelectList,
		onConfigureConnections: handleConnectionSettings,
		onCampaignCreate: handleCampaignCreation,
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhookModal,
		onBrowserExtension: handleBrowserExtension,
		createRouterPush,
		onStartSearch: handleStartSearch,
		onOpenSavedSearches: handleOpenSavedSearchModal,
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<QuickStartHeader onOpenWalkthrough={handleWalkthroughOpen} />

			<QuickStartActionsGrid cards={cards} />

			<div className="mx-auto mt-8 max-w-5xl text-center">
				<div className="mb-6">
					<h3 className="mb-2 text-lg font-semibold text-foreground">
						Advanced Features
					</h3>
					<p className="text-sm text-muted-foreground">
						Powerful tools for comprehensive lead management and analysis
					</p>
				</div>
				<QuickStartBadgeList />
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".csv,text/csv"
				onChange={handleCsvUpload}
				className="hidden"
			/>

			<LeadModalMain
				isOpen={showLeadModal}
				onClose={handleCloseLeadModal}
				initialListMode={leadModalMode}
				onLaunchCampaign={handleLaunchCampaign}
			/>

			<LeadBulkSuiteModal
				isOpen={showBulkSuiteModal}
				onClose={handleCloseBulkModal}
				initialCsvFile={bulkCsvFile}
				initialCsvHeaders={bulkCsvHeaders}
				onSuiteLaunchComplete={(payload) => {
					handleSuiteLaunchComplete(payload);
					handleCloseBulkModal();
					return true;
				}}
			/>

			<CampaignModalMain
				isOpen={showCampaignModal}
				onOpenChange={handleCampaignModalToggle}
				initialLeadListId={campaignModalContext?.leadListId}
				initialLeadListName={campaignModalContext?.leadListName}
				initialLeadCount={campaignModalContext?.leadCount ?? 0}
				initialStep={0}
			/>

			<WalkThroughModal
				isOpen={showWalkthrough}
				onClose={() => setShowWalkthrough(false)}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
				title="Welcome To Deal Scale"
				subtitle="Get help getting started with your lead generation platform."
				steps={campaignSteps}
				isTourOpen={isTourOpen}
				onStartTour={handleStartTour}
				onCloseTour={handleCloseTour}
			/>

			<SavedSearchModal
				open={showSavedSearchModal}
				onClose={handleCloseSavedSearchModal}
				savedSearches={savedSearches}
				onDelete={handleSavedSearchDelete}
				onSelect={handleSavedSearchSelect}
				onSetPriority={handleSavedSearchPriority}
			/>

			<QuickStartHelp />
		</div>
	);
}
