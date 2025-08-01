import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { useEffect } from "react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import LocationInput from "./form/LocationInput";
import MarketStatusSelect from "./form/MarketStatusSelect";
import NumericInput from "./form/NumericInput";
import PropertyTypeSelect from "./form/PropertyTypeSelect";
import AdvancedSearchButton from "./form/AdvancedSearchButton";
import ActionButtons from "./form/ActionButtons";

interface LeadSearchFormProps {
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
	setValue: UseFormSetValue<MapFormSchemaType>;
	onAdvancedOpen: () => void;
	isValid: boolean;
}

const LeadSearchForm: React.FC<LeadSearchFormProps> = ({
	control,
	errors,
	setValue,
	onAdvancedOpen,
	isValid,
}) => {
	const { filters } = useLeadSearchStore();

	useEffect(() => {
		for (const [key, value] of Object.entries(filters)) {
			setValue(key as keyof MapFormSchemaType, value, {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
	}, [filters, setValue]);

	return (
		<div className="mb-6 w-full rounded-xl bg-white/80 p-4 shadow-md dark:bg-gray-900/80">
			<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
				<LocationInput control={control} errors={errors} />
				<MarketStatusSelect control={control} />
				<NumericInput
					control={control}
					name="beds"
					label="Beds"
					placeholder="Beds"
				/>
				<NumericInput
					control={control}
					name="baths"
					label="Baths"
					placeholder="Baths"
				/>
				<PropertyTypeSelect control={control} />
				<AdvancedSearchButton onClick={onAdvancedOpen} />
			</div>
			<ActionButtons isValid={isValid} />
		</div>
	);
};

export default LeadSearchForm;
