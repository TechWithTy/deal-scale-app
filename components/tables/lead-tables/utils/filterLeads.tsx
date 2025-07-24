import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { LeadStatus } from "@/types/_dashboard/leads";
import { ChevronDown, Filter } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface FilterDropdownProps {
	selectedCampaign: string | undefined;
	setSelectedCampaign: (value: string) => void;
	selectedStatus: LeadStatus | undefined;
	setSelectedStatus: (value: LeadStatus) => void;
	resetFilter: () => void;
	applyFilter: () => void;
	availableCampaigns: string[]; // Dynamically pass available campaign IDs
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
	selectedCampaign,
	setSelectedCampaign,
	selectedStatus,
	setSelectedStatus,
	resetFilter,
	applyFilter,
	availableCampaigns,
}) => {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	// Toggle the popover's visibility
	const togglePopover = () => {
		setIsPopoverOpen(!isPopoverOpen);
	};

	return (
		<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			{/* Button with Filter icon and Chevron */}
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="border-blue-600 text-blue-600"
					onClick={togglePopover}
				>
					<Filter className="mr-2" />
					Filter
					<ChevronDown className="ml-2" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-64 space-y-4 p-4">
				{/* Campaign Select */}
				<div>
					<FormLabel
						htmlFor="campaign"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Campaign
					</FormLabel>
					<Select
						value={selectedCampaign || ""}
						onValueChange={setSelectedCampaign}
					>
						<SelectTrigger className="w-full truncate">
							{" "}
							{/* Added truncate here */}
							<SelectValue>
								{selectedCampaign ? (
									<span className="block w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
										{selectedCampaign}
									</span> // Ellipsis for long campaign names
								) : (
									"Select Campaign"
								)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{availableCampaigns.length > 0 ? (
									availableCampaigns.map((campaign) => (
										<SelectItem key={campaign} value={campaign}>
											<span className="block w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
												{campaign}
											</span>{" "}
											{/* Truncate long text */}
										</SelectItem>
									))
								) : (
									<SelectItem value="None">No Campaigns Available</SelectItem>
								)}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Status Select */}
				<div>
					<FormLabel
						htmlFor="status"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Status
					</FormLabel>
					<Select
						value={selectedStatus || ""}
						onValueChange={(value) => setSelectedStatus(value as LeadStatus)}
					>
						<SelectTrigger className="w-full">
							<SelectValue>
								{selectedStatus ? selectedStatus : "Select Status"}{" "}
								{/* Placeholder when not selected */}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="New Lead">New Lead</SelectItem>
								<SelectItem value="Contacted">Contacted</SelectItem>
								<SelectItem value="Closed">Closed</SelectItem>
								<SelectItem value="Lost">Lost</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Reset and Apply Buttons */}
				<div className="flex justify-between pt-2">
					<Button variant="outline" onClick={resetFilter}>
						Reset
					</Button>
					<Button variant="default" onClick={applyFilter}>
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default FilterDropdown;
