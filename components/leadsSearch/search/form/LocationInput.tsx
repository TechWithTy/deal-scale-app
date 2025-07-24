import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";

interface LocationInputProps {
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
}

const LocationInput: React.FC<LocationInputProps> = ({ control, errors }) => {
	const { setFilters } = useLeadSearchStore();

	return (
		<Controller
			name="location"
			control={control}
			render={({ field: { onChange, ...field } }) => (
				<div className="flex flex-col">
					<Label htmlFor="location" className="mb-2">
						Location*
					</Label>
					<Input
						id="location"
						placeholder="Enter a city, address, or zip code"
						type="text"
						error={errors.location?.message as string}
						{...field}
						onChange={(e) => {
							onChange(e);
							setFilters({ location: e.target.value });
						}}
						className="w-full"
					/>
				</div>
			)}
		/>
	);
};

export default LocationInput;
