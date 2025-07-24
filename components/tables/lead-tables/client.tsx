"use client";
import { campaignSteps } from "@/_tests/tours/campaignTour";
import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import PropertySearchModal from "@/components/reusables/tutorials/walkthroughModal";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useLeadStore } from "@/lib/stores/lead";
import searchAnimation from "@/public/lottie/SearchPing.json"; // Lottie JSON file path
import type { LeadStatus } from "@/types/_dashboard/leads";
import { endOfToday, formatISO, startOfToday } from "date-fns"; // Ensure you import these utilities
import Lottie from "lottie-react";
import { Calendar, Download, HelpCircle, Plus } from "lucide-react";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { leadListColumns } from "./LeadColumns";
import { LeadTables } from "./LeadTables";
import FilterDropdown from "./utils/filterLeads";

export const LeadClient: React.FC = () => {
	// State for modal visibility
	const [isModalOpen, setIsModalOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isFilterOpen, setIsFilterOpen] = useState(false); // State for filter dropdown visibility
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for modal visibility
	// Zustand's setCampaignType and filterCampaignsByStatus functions
	const [isTourOpen, setIsTourOpen] = useState(false);

	const handleHelpOpenModal = () => setIsHelpModalOpen(true);
	const handleHelpCloseModal = () => setIsHelpModalOpen(false);

	const handleHelpStartTour = () => setIsTourOpen(true);
	const handleHelpCloseTour = () => setIsTourOpen(false);
	// Zustand store states and actions
	const allLeads = useLeadStore((state) => state.leads);
	const leads = useLeadStore((state) => state.filteredLeads);
	const filterByStatus = useLeadStore((state) => state.filterByStatus);
	const filterByFollowUp = useLeadStore((state) => state.filterByFollowUp);
	const filterByCampaignID = useLeadStore((state) => state.filterByCampaignID);
	const resetFilters = useLeadStore((state) => state.resetFilters);
	const exportFilteredLeads = useLeadStore(
		(state) => state.exportFilteredLeadsToFile,
	); // Get the export function from Zustand

	// Filter state
	const [selectedCampaign, setSelectedCampaign] = useState<
		string | undefined
	>();
	const [selectedStatus, setSelectedStatus] = useState<LeadStatus>();

	const filterDropdownRef = useRef<HTMLDivElement | null>(null); // Ref for dropdown

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	const applyFilter = () => {
		if (selectedStatus) {
			filterByStatus(selectedStatus);
		}

		if (selectedCampaign) {
			filterByCampaignID(selectedCampaign);
		}

		// console.log('Applying Filter:', { selectedCampaign, selectedStatus });
		setIsFilterOpen(false); // Close the dropdown after applying the filter
	};

	// const closeFilterDropdown = () => {
	//   setIsFilterOpen(false);
	// };

	const resetFilter = () => {
		setSelectedCampaign(undefined);
		setSelectedStatus(undefined);
		resetFilters(); // Reset all the filters using the Zustand store
	};

	const filterByTodayFollowUps = () => {
		const todayStart = formatISO(startOfToday());
		const todayEnd = formatISO(endOfToday());
		filterByFollowUp(todayStart, todayEnd); // Trigger filtering by today's follow-ups
	};

	// Memoize the unique campaign IDs from filtered leads
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const availableCampaigns = useMemo(() => {
		const campaignIds = allLeads
			.map((lead) => lead.campaignID) // Extract campaign IDs
			.filter((campaignID): campaignID is string => !!campaignID); // Filter out undefined/null and cast to string
		return Array.from(new Set(campaignIds)); // Return only unique campaign IDs
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leads]);

	return (
		<>
			<div className="flex w-full flex-col space-y-4 lg:items-center lg:space-y-0">
				{/* Heading Component */}
				<div className="my-5 flex flex-col items-start text-center lg:w-full lg:items-center">
					<Heading
						title={`Lead Manager (${leads.length})`}
						description="See a list of existing leads and follow ups, or create new leads."
					/>
				</div>

				{/* Help Button */}
				<div className="flex justify-center lg:justify-center">
					<button
						onClick={handleHelpOpenModal}
						title="Get More help"
						type="button"
						className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none lg:mr-4 lg:ml-4 dark:bg-green-700 dark:text-gray-300"
					>
						<HelpCircle size={20} />
					</button>
				</div>

				{/* Action Buttons (Create Lead, Export, Today's Follow Ups, Filter) */}
				<div className="flex w-full flex-col items-center space-y-4 lg:flex-row lg:justify-center lg:space-x-4 lg:space-y-0">
					{/* Create Lead and Export Leads Buttons */}
					<div className="flex w-full justify-center space-x-4 lg:w-auto">
						<Button
							onClick={openModal}
							className="flex w-full items-center justify-center space-x-2 whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 lg:w-auto"
						>
							<Plus className="h-5 w-5" />
							<span>Create Lead</span>
						</Button>

						<Button
							onClick={exportFilteredLeads}
							className="flex w-full items-center justify-center space-x-2 whitespace-nowrap rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 lg:w-auto"
						>
							<Download className="h-5 w-5" />
							<span>Export Leads</span>
						</Button>
					</div>

					{/* Today's Follow Ups and Filter Dropdown */}
					<div className="flex w-full justify-center space-x-4 lg:w-auto">
						<Button
							variant="outline"
							className="flex w-full items-center justify-center overflow-hidden truncate whitespace-nowrap border-blue-600 text-blue-600 lg:w-auto"
							onClick={filterByTodayFollowUps}
						>
							<Calendar className="mr-2 h-5 w-5" />
							Today&apos;s Follow Ups
						</Button>

						<div className="relative w-full lg:w-auto" ref={filterDropdownRef}>
							<FilterDropdown
								selectedCampaign={selectedCampaign}
								setSelectedCampaign={setSelectedCampaign}
								selectedStatus={selectedStatus}
								setSelectedStatus={setSelectedStatus}
								resetFilter={resetFilter}
								applyFilter={applyFilter}
								availableCampaigns={availableCampaigns}
							/>
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{/* Lead Data Table */}
			{leads.length > 0 ? (
				<LeadTables
					pageCount={10}
					searchKey="Leads"
					columns={leadListColumns}
					data={leads}
				/>
			) : (
				<div className="flex h-[60vh] flex-col items-center justify-center">
					<Lottie animationData={searchAnimation} loop autoplay />
					<h2 className="mt-6 font-semibold text-xl">Create New Lead</h2>
					<p className="mt-2 text-gray-500">
						Click the button below to get started.
					</p>
					<Button
						onClick={openModal}
						className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
					>
						<Plus className="mr-2" /> Create Lead
					</Button>
				</div>
			)}
			<PropertySearchModal
				isOpen={isHelpModalOpen}
				onClose={handleHelpCloseModal}
				videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
				title="Welcome To Your Lead Manager"
				subtitle="Get help managing and understanding your leads."
				// Add the following props to enable the tour
				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
				onStartTour={handleHelpStartTour} // Function to start the tour (triggered by button)
				onCloseTour={handleHelpCloseTour} // Function to close the tour
			/>
			{/* Add Lead Modal */}
			<LeadMainModal isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
};

export default LeadClient;
