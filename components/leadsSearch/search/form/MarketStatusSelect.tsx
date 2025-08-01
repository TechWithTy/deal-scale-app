import { Controller, type Control } from "react-hook-form";
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

interface MarketStatusSelectProps {
	control: Control<MapFormSchemaType>;
}

const MarketStatusSelect: React.FC<MarketStatusSelectProps> = ({ control }) => {
	const { setFilters } = useLeadSearchStore();

	return (
		<Controller
			name="marketStatus"
			control={control}
			render={({ field: { onChange, ...field } }) => (
				<div className="flex flex-col">
					<Label htmlFor="marketStatus" className="mb-2">
						Market Status
					</Label>
					<Select
						onValueChange={(value) => {
							onChange(value);
							setFilters({ marketStatus: value });
						}}
						value={field.value || ""}
					>
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
	);
};

export default MarketStatusSelect;
