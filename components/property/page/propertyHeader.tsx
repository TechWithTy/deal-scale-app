"use client";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import ActivitySidebar from "@/components/reusables/sidebars/activity";
import WalkThroughModal from "../../leadsSearch/search/WalkthroughModal";
import { Button } from "@/components/ui/button";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
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
import type { Property } from "@/types/_dashboard/property";
import { isRealtorProperty } from "@/types/_dashboard/property";
import {
	CalendarIcon,
	ChevronDownIcon,
	CopyPlus,
	HelpCircle,
	InfoIcon,
} from "lucide-react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { SaveToListModal } from "@/components/property/modals/SaveToListModal";
import { useState, useEffect } from "react";

interface PropertyHeaderProps {
	property: Property;
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
	const [date, setDate] = useState<Date | undefined>(initialDate ?? new Date());
	const [status, setStatus] = useState<string>(initialStatus);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Manage sidebar visibility
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	const [isHelpModalOpen, setHelpModalOpen] = useState(false);
	const [isSaveToListModalOpen, setSaveToListModalOpen] = useState(false);
	const [isSaved, setIsSaved] = useState(false);

	const { userProfile } = useUserProfileStore();

	useEffect(() => {
		const propertyId = "propertyId" in property ? property.propertyId : null;
		if (!propertyId || !userProfile?.companyInfo?.leadLists) return;

		const isAlreadySaved = userProfile.companyInfo.leadLists.some((list) =>
			list.leads.some((lead) => lead.id === propertyId),
		);

		setIsSaved(isAlreadySaved);
	}, [property, userProfile]);

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const openHelpModal = () => setHelpModalOpen(true);
	const closeHelpModal = () => setHelpModalOpen(false);

	const handleSaveSuccess = () => {
		setIsSaved(true);
		setSaveToListModalOpen(false);
	};

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
			<div className="w-full bg-card p-4 text-card-foreground shadow-sm">
				<div className="flex flex-col items-center justify-center gap-2">
					{/* Top row: Title + Help */}
					<div className="flex w-full items-center justify-center gap-2">
						<h1 className="flex items-center gap-2 text-center font-semibold text-foreground text-xl">
							{property.address?.fullStreetLine || "N/A"},{" "}
							{property.address?.city || "N/A"},{" "}
							{property.address?.state || "N/A"}{" "}
							{property.address?.zipCode || ""}
						</h1>
						<button
							type="button"
							onClick={openHelpModal}
							title="Get More help"
							className="animate-bounce rounded-full bg-primary p-2 text-primary-foreground hover:animate-none"
						>
							<HelpCircle size={20} />
						</button>
					</div>
					{/* Second row: Metadata */}
					<p className="text-center text-muted-foreground text-sm">
						{property.details.beds || "N/A"} bed |{" "}
						{property.details.fullBaths || "N/A"} bath |{" "}
						{formatNumber(property.details.sqft)} sqft |{" "}
						{formatNumber(property.details.lotSqft)} sqft lot |{" "}
						{property.details.yearBuilt || "N/A"} year built
					</p>
					{/* Third row: Controls */}
					<div className="mt-2 flex flex-wrap items-center justify-center gap-2">
						{/* Date Picker */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="justify-start text-left font-normal"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? (
										date.toLocaleDateString("en-US")
									) : (
										<span>MM/DD/YYYY</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-0">
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
								<Button variant="outline">
									{status} <ChevronDownIcon className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
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

						{/* Save Property Button */}
						<Button
							variant="outline"
							className="flex items-center gap-2"
							onClick={() => setSaveToListModalOpen(true)}
							disabled={isSaved}
						>
							{isSaved ? (
								<BookmarkCheck className="h-5 w-5 text-primary" />
							) : (
								<Bookmark className="h-5 w-5" />
							)}
							<span className="hidden sm:inline">
								{isSaved ? "Saved" : "Save"}
							</span>
						</Button>

						{/* Lead Activity Button */}
						<Button
							className="bg-primary text-primary-foreground hover:bg-primary/90"
							onClick={toggleSidebar} // Open the sidebar on click
						>
							<CopyPlus className="mx-2" /> Lead Activity
						</Button>
					</div>
				</div>
			</div>
			<WalkThroughModal
				isOpen={isHelpModalOpen}
				onClose={closeHelpModal}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU" // Example YouTube video URL
				title="Welcome To Your Lead Search"
				subtitle="Get help searching and sorting through your properties."
				// Add the following props to enable the tour
				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
				onStartTour={handleStartTour} // Function to start the tour (triggered by button)
				onCloseTour={handleCloseTour} // Function to close the tour
			/>

			{/* Save To List Modal */}
			<SaveToListModal
				isOpen={isSaveToListModalOpen}
				onClose={() => setSaveToListModalOpen(false)}
				property={property}
				onSave={handleSaveSuccess}
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
