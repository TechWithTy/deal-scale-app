"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import QuickStartActionsGrid from "@/components/quickstart/QuickStartActionsGrid";
import QuickStartBadgeList from "@/components/quickstart/QuickStartBadgeList";
import QuickStartHeader from "@/components/quickstart/QuickStartHeader";
import QuickStartHelp from "@/components/quickstart/QuickStartHelp";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";
import { useQuickStartSavedSearches } from "@/components/quickstart/useQuickStartSavedSearches";
import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";

void React;

interface CampaignContext {
	readonly leadListId: string;
	readonly leadListName: string;
	readonly leadCount: number;
}

export default function QuickStartPage() {
	const [showLeadModal, setShowLeadModal] = useState(false);
	const [leadModalMode, setLeadModalMode] = useState<"select" | "create">(
		"create",
	);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [showBulkSuiteModal, setShowBulkSuiteModal] = useState(false);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [campaignModalContext, setCampaignModalContext] =
		useState<CampaignContext | null>(null);
	const previousCampaignModalOpenRef = useRef(showCampaignModal);

	const router = useRouter();
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);
	const campaignStore = useCampaignCreationStore();
	const resetCampaignStore = campaignStore.reset;

	const {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleStartNewSearch,
		handleOpenSavedSearches,
		handleCloseSavedSearches,
		handleSelectSavedSearch,
		savedSearchModalOpen,
	} = useQuickStartSavedSearches();

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: CampaignContext) => {
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
		(payload: CampaignContext) => {
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign],
	);

	const handleCloseLeadModal = useCallback(() => setShowLeadModal(false), []);

	const handleConnectionSettings = useCallback(
		() =>
			toast.info("Data source connections and API configuration coming soon!"),
		[],
	);

	const handleImportFromSource = useCallback(
		() => setShowBulkSuiteModal(true),
		[],
	);

	const handleCampaignCreation = useCallback(() => {
		campaignStore.reset();
		campaignStore.setAreaMode("leadList");
		setCampaignModalContext(null);
		setShowCampaignModal(true);
	}, [campaignStore]);

	const handleViewTemplates = useCallback(
		() => toast.info("Campaign templates feature coming soon!"),
		[],
	);

	const handleOpenWebhookModal = useCallback(
		(stage: WebhookStage) => openWebhookModal(stage),
		[openWebhookModal],
	);

	const handleWalkthroughOpen = useCallback(() => setShowWalkthrough(true), []);
	const handleStartTour = useCallback(() => setIsTourOpen(true), []);
	const handleCloseTour = useCallback(() => setIsTourOpen(false), []);

	const handleBrowserExtension = useCallback(() => {
		window.open("https://chrome.google.com/webstore", "_blank");
		toast("Browser extension download coming soon!");
	}, []);

	const createRouterPush = useCallback(
		(path: string) => () => {
			router.push(path);
		},
		[router],
	);

	const handleCampaignModalToggle = useCallback((open: boolean) => {
		setShowCampaignModal(open);
	}, []);

	useEffect(() => {
		const wasOpen = previousCampaignModalOpenRef.current;
		previousCampaignModalOpenRef.current = showCampaignModal;

		if (wasOpen && !showCampaignModal) {
			setCampaignModalContext(null);
			const timeout = setTimeout(() => {
				resetCampaignStore();
			}, 0);

			return () => {
				clearTimeout(timeout);
			};
		}

		return undefined;
	}, [showCampaignModal, resetCampaignStore]);

	const handleCloseBulkModal = useCallback(
		() => setShowBulkSuiteModal(false),
		[],
	);

	const cards = useQuickStartCards({
		onImport: handleImportFromSource,
		onSelectList: handleSelectList,
		onConfigureConnections: handleConnectionSettings,
		onCampaignCreate: handleCampaignCreation,
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhookModal,
		onBrowserExtension: handleBrowserExtension,
		createRouterPush,
		onStartNewSearch: handleStartNewSearch,
		onOpenSavedSearches: handleOpenSavedSearches,
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<QuickStartHeader onOpenWalkthrough={handleWalkthroughOpen} />

			<div className="mb-10 flex justify-center">
				<QuickStartBadgeList />
			</div>

			<QuickStartActionsGrid cards={cards} />

			<QuickStartHelp />

			<LeadModalMain
				isOpen={showLeadModal}
				onClose={handleCloseLeadModal}
				initialListMode={leadModalMode}
				onLaunchCampaign={handleLaunchCampaign}
			/>

			<LeadBulkSuiteModal
				isOpen={showBulkSuiteModal}
				onClose={handleCloseBulkModal}
				initialCsvFile={null}
				initialCsvHeaders={[]}
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

			<SavedSearchModal
				open={savedSearchModalOpen}
				onClose={handleCloseSavedSearches}
				savedSearches={savedSearches}
				onDelete={deleteSavedSearch}
				onSelect={handleSelectSavedSearch}
				onSetPriority={setSearchPriority}
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
		</div>
	);
}
