import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { type Control, Controller } from "react-hook-form";

interface PropertyTypeSelectProps {
	control: Control<MapFormSchemaType>;
}

const PropertyTypeSelect: React.FC<PropertyTypeSelectProps> = ({ control }) => {
	const { setFilters } = useLeadSearchStore();

	return (
		<Controller
			name="propertyType"
			control={control}
			render={({ field: { onChange, ...field } }) => (
				<div className="flex flex-col">
					<Label htmlFor="propertyType" className="mb-2">
						Property Type
					</Label>
					<Select
						onValueChange={(value) => {
							onChange(value);
							setFilters({ propertyType: value });
						}}
						value={field.value || ""}
					>
						<SelectTrigger id="propertyType">
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="single_family">Single Family</SelectItem>
							<SelectItem value="multi_family">Multi Family</SelectItem>
							<SelectItem value="condo">Condo</SelectItem>
							<SelectItem value="townhouse">Townhouse</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
		/>
	);
};

export default PropertyTypeSelect;
