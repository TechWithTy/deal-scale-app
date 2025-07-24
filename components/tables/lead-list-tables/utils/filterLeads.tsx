import { Button } from "@/components/ui/button";
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
import { ChevronDown, Filter } from "lucide-react";
import type React from "react";
import { useState } from "react";

// Define the types for the props
interface LeadListFilterDropdownProps {
	selectedRecordsRange: "all" | "0-500" | "500-1000" | "1000+" | undefined;
	setSelectedRecordsRange: (
		value: "all" | "0-500" | "500-1000" | "1000+" | undefined,
	) => void;
	selectedUploadDate:
		| "all"
		| "Last 7 Days"
		| "Last 30 Days"
		| "Last 90 Days"
		| undefined;
	setSelectedUploadDate: (
		value: "all" | "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | undefined,
	) => void;
	resetFilter: () => void;
	applyFilter: () => void;
}

// The new dropdown component for lead list filters
const LeadListFilterDropdown: React.FC<LeadListFilterDropdownProps> = ({
	selectedRecordsRange,
	setSelectedRecordsRange,
	selectedUploadDate,
	setSelectedUploadDate,
	resetFilter,
	applyFilter,
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
					<Filter className="mr-2 " />
					Filter Lead Lists
					<ChevronDown className="ml-2" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-64 space-y-4 p-4">
				{/* Records Range Select */}
				<div>
					<label
						htmlFor="recordsRange"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Records Range
					</label>
					<Select
						value={selectedRecordsRange || ""}
						onValueChange={(value) =>
							setSelectedRecordsRange(
								value as "all" | "0-500" | "500-1000" | "1000+" | undefined,
							)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue>
								{selectedRecordsRange ? selectedRecordsRange : "None"}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="all">None</SelectItem>
								<SelectItem value="0-500">0-500</SelectItem>
								<SelectItem value="500-1000">500-1000</SelectItem>
								<SelectItem value="1000+">1000+</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Upload Date Select */}
				<div>
					<label
						htmlFor="uploadDate"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Upload Date
					</label>
					<Select
						value={selectedUploadDate || ""}
						onValueChange={(value) =>
							setSelectedUploadDate(
								value as
									| "all"
									| "Last 7 Days"
									| "Last 30 Days"
									| "Last 90 Days"
									| undefined,
							)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue>
								{selectedUploadDate ? selectedUploadDate : "None"}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="all">None</SelectItem>
								<SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
								<SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
								<SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
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

export default LeadListFilterDropdown;
