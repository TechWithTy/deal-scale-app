import type { FC } from "react";

import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import type { SavedSearch } from "@/types/userProfile";

export interface QuickStartCampaignContext {
	readonly leadListId: string;
	readonly leadListName: string;
	readonly leadCount: number;
}

interface QuickStartLegacyModalsProps {
	readonly showLeadModal: boolean;
	readonly leadModalMode: "select" | "create";
	readonly onCloseLeadModal: () => void;
	readonly onLaunchCampaign: (context: QuickStartCampaignContext) => void;
	readonly showBulkSuiteModal: boolean;
	readonly onCloseBulkSuite: () => void;
	readonly bulkCsvFile: File | null;
	readonly bulkCsvHeaders: readonly string[];
	readonly onSuiteLaunchComplete: (
		context: QuickStartCampaignContext,
	) => boolean;
	readonly showCampaignModal: boolean;
	readonly onCampaignModalToggle: (open: boolean) => void;
	readonly campaignModalContext: QuickStartCampaignContext | null;
	readonly savedSearchModalOpen: boolean;
	readonly onCloseSavedSearches: () => void;
	readonly savedSearches: SavedSearch[];
	readonly onDeleteSavedSearch: (id: string) => void;
	readonly onSelectSavedSearch: (search: SavedSearch) => void;
	readonly onSetSearchPriority: (id: string) => void;
	readonly showWalkthrough: boolean;
	readonly onCloseWalkthrough: () => void;
	readonly isTourOpen: boolean;
	readonly onStartTour: () => void;
	readonly onCloseTour: () => void;
	readonly campaignSteps: readonly unknown[];
}

const QuickStartLegacyModals: FC<QuickStartLegacyModalsProps> = ({
	showLeadModal,
	leadModalMode,
	onCloseLeadModal,
	onLaunchCampaign,
	showBulkSuiteModal,
	onCloseBulkSuite,
	bulkCsvFile,
	bulkCsvHeaders,
	onSuiteLaunchComplete,
	showCampaignModal,
	onCampaignModalToggle,
	campaignModalContext,
	savedSearchModalOpen,
	onCloseSavedSearches,
	savedSearches,
	onDeleteSavedSearch,
	onSelectSavedSearch,
	onSetSearchPriority,
	showWalkthrough,
	onCloseWalkthrough,
	isTourOpen,
	onStartTour,
	onCloseTour,
	campaignSteps,
}) => (
	<>
		<LeadModalMain
			isOpen={showLeadModal}
			onClose={onCloseLeadModal}
			initialListMode={leadModalMode}
			onLaunchCampaign={onLaunchCampaign}
		/>

		<LeadBulkSuiteModal
			isOpen={showBulkSuiteModal}
			onClose={onCloseBulkSuite}
			initialCsvFile={bulkCsvFile}
			initialCsvHeaders={bulkCsvHeaders}
			onSuiteLaunchComplete={onSuiteLaunchComplete}
		/>

		<CampaignModalMain
			isOpen={showCampaignModal}
			onOpenChange={onCampaignModalToggle}
			initialLeadListId={campaignModalContext?.leadListId}
			initialLeadListName={campaignModalContext?.leadListName}
			initialLeadCount={campaignModalContext?.leadCount ?? 0}
			initialStep={0}
		/>

		<SavedSearchModal
			open={savedSearchModalOpen}
			onClose={onCloseSavedSearches}
			savedSearches={savedSearches}
			onDelete={onDeleteSavedSearch}
			onSelect={onSelectSavedSearch}
			onSetPriority={onSetSearchPriority}
		/>

		<WalkThroughModal
			isOpen={showWalkthrough}
			onClose={onCloseWalkthrough}
			videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
			title="Welcome To Deal Scale"
			subtitle="Get help getting started with your lead generation platform."
			steps={campaignSteps}
			isTourOpen={isTourOpen}
			onStartTour={onStartTour}
			onCloseTour={onCloseTour}
		/>
	</>
);

export default QuickStartLegacyModals;
