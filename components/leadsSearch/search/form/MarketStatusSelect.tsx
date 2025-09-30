import { Controller, type Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/_utils";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { useRemainingLeads } from "@/lib/stores/userStore";

interface MarketStatusSelectProps {
	control: Control<MapFormSchemaType>;
}

const MarketStatusSelect: React.FC<MarketStatusSelectProps> = ({ control }) => {
	const { setFilters } = useLeadSearchStore();
	const remainingLeads = useRemainingLeads();

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
						value={field.value ?? "off_market"}
					>
						<SelectTrigger id="marketStatus">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="off_market"
								disabled={remainingLeads < 1}
								className={cn(
									"relative overflow-hidden rounded-md border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent font-semibold text-primary transition-colors duration-200 data-[highlighted]:from-primary/25 data-[highlighted]:via-primary/15 data-[state=checked]:border-primary data-[state=checked]:from-primary/30 data-[state=checked]:text-primary-foreground dark:from-primary/25 dark:via-primary/10 dark:data-[state=checked]:from-primary/35",
									remainingLeads < 1 ? "opacity-50" : undefined,
								)}
							>
								<div className="flex w-full items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span
											className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-primary"
											aria-hidden
										/>
										<span>Off Market</span>
									</div>
									<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary dark:bg-primary/25">
										High Intent
									</span>
									{remainingLeads < 1 && (
										<span className="ml-2 text-muted-foreground text-[10px]">
											(Requires 1+ credits)
										</span>
									)}
								</div>
							</SelectItem>
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
