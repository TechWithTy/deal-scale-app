"use client";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import ActivitySidebar from "@/components/reusables/sidebars/activity";
import WalkThroughModal from "@/components/reusables/tutorials/walkthroughModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { mockGeneratedLeads } from "@/constants/data";
import type { PropertyDetails } from "@/types/_dashboard/maps"; // Ensure you import the PropertyDetails type
import {
	CalendarIcon,
	ChevronDownIcon,
	CopyPlus,
	HelpCircle,
	InfoIcon,
} from "lucide-react";
import { useState } from "react";

interface PropertyHeaderProps {
	property: PropertyDetails;
	initialDate?: Date; // Optional prop for initial date
	initialStatus?: string; // Optional prop for initial status
	onLeadActivity: () => void;
}

// * Utility function for formatting numbers with commas
function formatNumber(val?: string | number | null): string {
	if (val === null || val === undefined || val === "") return "-";
	const num = typeof val === "string" ? Number(val) : val;
	return Number.isNaN(num) ? "-" : num.toLocaleString();
}

export default function PropertyHeader({
	property,
	initialDate,
	initialStatus = "New Lead", // Default to 'New Lead' if no status is provided
	onLeadActivity,
}: PropertyHeaderProps) {
	const [date, setDate] = useState<Date | undefined>(initialDate);
	const [status, setStatus] = useState<string>(initialStatus);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Manage sidebar visibility
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	const handleDateChange = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
		}
	};

	const handleStatusChange = (selectedStatus: string) => {
		setStatus(selectedStatus);
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen); // Toggle the sidebar's visibility
	};

	return (
		<>
			<div className="w-full bg-white p-4 shadow-sm dark:bg-gray-900">
				<div className="flex flex-col items-center justify-center gap-2">
					{/* Top row: Title + Help */}
					<div className="flex w-full items-center justify-center gap-2">
						<h1 className="flex items-center gap-2 text-center font-semibold text-gray-900 text-xl dark:text-gray-100">
							{property.full_street_line}, {property.city}, {property.state}{" "}
							{property.zip_code}
						</h1>
						<button
							type="button"
							onClick={handleOpenModal}
							title="Get More help"
							className=" animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
						>
							<HelpCircle size={20} />
						</button>
					</div>
					{/* Second row: Metadata */}
					<p className="text-center text-gray-600 text-sm dark:text-gray-300">
						{property.beds} bed | {property.full_baths} bath |{" "}
						{formatNumber(property.sqft)} sqft |{" "}
						{formatNumber(property.lot_sqft)} lot sqft | {property.year_built}{" "}
						year built
					</p>
					{/* Third row: Controls */}
					<div className="mt-2 flex flex-wrap items-center justify-center gap-2">
						{/* Date Picker */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="justify-start text-left font-normal dark:border-gray-700 dark:text-gray-100"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? (
										date.toLocaleDateString("en-US")
									) : (
										<span>MM/DD/YYYY</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-0 dark:bg-gray-800">
								<Calendar
									mode="single"
									selected={date}
									onSelect={handleDateChange}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						{/* Status Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="dark:border-gray-700 dark:text-gray-100"
								>
									{status} <ChevronDownIcon className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="dark:bg-gray-800 dark:text-gray-100">
								<DropdownMenuItem
									onClick={() => handleStatusChange("New Lead")}
								>
									New Lead
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("Follow Up")}
								>
									Follow Up
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("Contract Sent")}
								>
									Contract Sent
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("Make Offer")}
								>
									Make Offer
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("In Contract")}
								>
									In Contract
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("Closed Deal")}
								>
									Closed Deal
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusChange("Dead Deal")}
								>
									Dead Deal
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Lead Activity Button */}
						<Button
							className="bg-blue-600 text-white hover:bg-blue-700"
							onClick={toggleSidebar} // Open the sidebar on click
						>
							<CopyPlus className="mx-2" /> Lead Activity
						</Button>
					</div>
				</div>
			</div>
			<WalkThroughModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU" // Example YouTube video URL
				title="Welcome To Your Lead Search"
				subtitle="Get help searching and sorting through your properties."
				// Add the following props to enable the tour
				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
				onStartTour={handleStartTour} // Function to start the tour (triggered by button)
				onCloseTour={handleCloseTour} // Function to close the tour
			/>
			{/* Sidebar */}
			{isSidebarOpen && (
				<ActivitySidebar
					leadData={mockGeneratedLeads[0]}
					onClose={() => setIsSidebarOpen(false)} // Close the sidebar when the user clicks "X"
				/>
			)}
		</>
	);
}
