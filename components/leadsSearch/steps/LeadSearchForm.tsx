import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { Sliders } from "lucide-react";
// * LeadSearchForm.tsx
// ! Main form for property/lead search, including basic fields and advanced filter trigger
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

interface LeadSearchFormProps {
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
	onAdvancedOpen: () => void;
}

const LeadSearchForm: React.FC<LeadSearchFormProps> = ({
	control,
	errors,
	onAdvancedOpen,
}) => (
	<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{/* Location */}
		<Controller
			name="location"
			control={control}
			render={({ field }) => (
				<div className="flex flex-col">
					<Label htmlFor="location">Location*</Label>
					<input
						id="location"
						type="text"
						className={`rounded border bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${errors.location ? "border-red-500" : "border-gray-300"}`}
						placeholder="Enter a city, address, or zip code"
						{...field}
					/>
					{errors.location && (
						<span className="text-red-500 text-sm">
							{errors.location.message as string}
						</span>
					)}
				</div>
			)}
		/>
		{/* Market Status */}
		<Controller
			name="marketStatus"
			control={control}
			render={({ field }) => (
				<div className="flex flex-col">
					<Label htmlFor="marketStatus">Market Status</Label>
					<Select onValueChange={field.onChange} value={field.value || ""}>
						<SelectTrigger id="marketStatus">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="for_sale">For Sale</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="sold">Sold</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
		/>
		{/* Beds */}
		<Controller
			name="beds"
			control={control}
			render={({ field }) => (
				<div className="flex flex-col">
					<Label htmlFor="beds">Beds</Label>
					<input
						id="beds"
						type="number"
						min={0}
						className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
						placeholder="Beds"
						{...field}
					/>
				</div>
			)}
		/>
		{/* Baths */}
		<Controller
			name="baths"
			control={control}
			render={({ field }) => (
				<div className="flex flex-col">
					<Label htmlFor="baths">Baths</Label>
					<input
						id="baths"
						type="number"
						min={0}
						className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
						placeholder="Baths"
						{...field}
					/>
				</div>
			)}
		/>
		{/* Property Type */}
		<Controller
			name="propertyType"
			control={control}
			render={({ field }) => (
				<div className="flex flex-col">
					<Label htmlFor="propertyType">Property Type</Label>
					<Select onValueChange={field.onChange} value={field.value || ""}>
						<SelectTrigger id="propertyType">
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="single_family">Single Family</SelectItem>
							<SelectItem value="multi_family">Multi Family</SelectItem>
							<SelectItem value="condo">Condo</SelectItem>
							<SelectItem value="townhouse">Townhouse</SelectItem>
							<SelectItem value="land">Land</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
		/>
		{/* Advanced Filters Button */}
		<div className="flex items-end">
			<button
				type="button"
				onClick={onAdvancedOpen}
				className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 font-medium text-sm shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
			>
				<Sliders className="h-4 w-4" />
				Advanced
			</button>
		</div>
	</div>
);

export default LeadSearchForm;
