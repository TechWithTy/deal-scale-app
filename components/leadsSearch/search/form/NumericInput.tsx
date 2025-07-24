import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";

interface NumericInputProps {
	control: Control<MapFormSchemaType>;
	name: "beds" | "baths";
	label: string;
	placeholder: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
	control,
	name,
	label,
	placeholder,
}) => {
	const { setFilters } = useLeadSearchStore();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { onChange, ...field } }) => (
				<div className="flex flex-col">
					<Label htmlFor={name} className="mb-2">
						{label}
					</Label>
					<Input
						id={name}
						placeholder={placeholder}
						type="number"
						min={0}
						{...field}
						onChange={(e) => {
							onChange(e);
							setFilters({ [name]: e.target.value });
						}}
						className="w-full"
					/>
				</div>
			)}
		/>
	);
};

export default NumericInput;
