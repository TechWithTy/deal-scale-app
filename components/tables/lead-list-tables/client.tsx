"use client"; // Ensure that the component is a client-side component

import { campaignSteps } from "@/_tests/tours/campaignTour";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import WalkThroughModal from "@/components/reusables/tutorials/walkthroughModal";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useLeadListStore } from "@/lib/stores/leadList";
import searchAnimation from "@/public/lottie/SearchPing.json"; // Lottie JSON file path
import Lottie from "lottie-react";
import { HelpCircle, Menu, Plus } from "lucide-react"; // Icons
import type React from "react";
import { useState } from "react";
import { columns } from "./columns";
import { LeadListDataTable } from "./lead-list-data-table";
import LeadListFilterDropdown from "./utils/filterLeads";

export const LeadListClient: React.FC = () => {
	const {
		filteredLeadLists, // Filtered data from the store
		filterByRecordsRange,
		filterByUploadDate,
		resetFilters,
		exportFilteredLeadListsToZip,
	} = useLeadListStore(); // Use Zustand store

	const [isModalOpen, setIsModalOpen] = useState(false); // State for Upload List modal visibility
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for Help modal visibility
	const [isTourOpen, setIsTourOpen] = useState(false); // State for tour visibility
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchKey, setSearchKey] = useState(""); // State for search key

	// Dropdown filter state
	const [selectedRecordRange, setSelectedRecordRange] = useState<
		"all" | "0-500" | "500-1000" | "1000+" | undefined
	>(undefined); // Record range filter
	const [selectedUploadDate, setSelectedUploadDate] = useState<
		"all" | "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | undefined
	>(undefined); // Upload date filter

	// Open/close the Help modal
	const handleHelpOpenModal = () => setIsHelpModalOpen(true);
	const handleHelpCloseModal = () => setIsHelpModalOpen(false);

	// Open/close the Upload List modal
	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	// Start/close the tour
	const handleHelpStartTour = () => setIsTourOpen(true);
	const handleHelpCloseTour = () => setIsTourOpen(false);

	// Apply the filters
	const applyFilter = () => {
		if (selectedRecordRange) filterByRecordsRange(selectedRecordRange);
		if (selectedUploadDate) filterByUploadDate(selectedUploadDate);
	};

	// Reset the filters
	const resetFilter = () => {
		setSelectedRecordRange(undefined);
		setSelectedUploadDate(undefined);
		resetFilters(); // Reset the store filters
	};

	return (
		<>
			<div className="flex w-full flex-col space-y-4 lg:items-center lg:space-y-0">
				{/* Heading Component */}
				<div className="my-5 flex w-full flex-col items-center text-center">
					<Heading
						title={`Lead List Manager (${filteredLeadLists.length})`}
						description="See a list of existing lead lists or upload a new list."
					/>
				</div>

				{/* Help Button */}
				<div className="flex justify-center">
					<button
						type="button"
						onMouseDown={handleHelpOpenModal}
						title="Get More help"
						className="my-2 animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
					>
						<HelpCircle size={20} />
					</button>
				</div>

				{/* Action Buttons (Import List, Export, Filter Dropdown) */}
				<div className="flex w-full flex-col space-y-4 lg:flex-row lg:justify-center lg:space-x-4 lg:space-y-0">
					{/* Import List and Export Filtered Lead Lists Buttons */}
					<div className="flex w-full flex-col space-y-4 lg:w-auto lg:flex-row lg:space-x-4 lg:space-y-0">
						<Button
							onClick={openModal}
							className="flex w-full items-center justify-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 lg:w-auto"
						>
							<Menu className="mr-2 h-5 w-5" />
							<span>Import List</span>
						</Button>

						<Button
							onClick={exportFilteredLeadListsToZip}
							className="flex w-full items-center justify-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 lg:w-auto"
						>
							<Plus className="mr-2 h-5 w-5" />
							<span>Export Filtered Lead Lists</span>
						</Button>
					</div>

					{/* Filter Dropdown */}
					<div className="flex w-full justify-center lg:w-auto">
						<div className="flex w-full justify-center sm:w-auto">
							<LeadListFilterDropdown
								selectedRecordsRange={selectedRecordRange}
								setSelectedRecordsRange={setSelectedRecordRange}
								selectedUploadDate={selectedUploadDate}
								setSelectedUploadDate={setSelectedUploadDate}
								resetFilter={resetFilter}
								applyFilter={applyFilter}
							/>
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{/* Lead Data Table */}
			{filteredLeadLists.length > 0 ? (
				<LeadListDataTable
					pageCount={10}
					searchKey={searchKey}
					columns={columns}
					data={filteredLeadLists} // Use filtered data from the store
				/>
			) : (
				<div className="flex h-[60vh] flex-col items-center justify-center">
					<Lottie animationData={searchAnimation} loop autoplay />
					<h2 className="mt-6 font-semibold text-xl">No Lead Lists Found</h2>
					<p className="mt-2 text-gray-500">
						Upload a new lead list to get started.
					</p>
					<Button
						onClick={openModal}
						className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
					>
						<Menu className="mr-2" /> Import List
					</Button>
				</div>
			)}

			{/* Help Modal */}
			<WalkThroughModal
				isOpen={isHelpModalOpen} // Use the correct state for the help modal
				onClose={handleHelpCloseModal}
				videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
				title="Welcome To Your Lead Search"
				subtitle="Get help searching and segmenting your leads"
				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
				onStartTour={handleHelpStartTour} // Function to start the tour (triggered by button)
				onCloseTour={handleHelpCloseTour} // Function to close the tour
			/>

			{/* Upload List Modal */}
			<SkipTraceModalMain isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
};

export default LeadListClient;
