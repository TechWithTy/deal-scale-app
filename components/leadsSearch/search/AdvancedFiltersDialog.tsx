import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";

interface AdvancedFiltersDialogProps {
	open: boolean;
	onClose: () => void;
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
}

const AdvancedFiltersDialog: React.FC<AdvancedFiltersDialogProps> = ({
	open,
	onClose,
	control,
	errors,
}) => {
	const { setFilters } = useLeadSearchStore();

	const updateAdvanced = <K extends keyof MapFormSchemaType["advanced"]>(
		key: K,
		value: MapFormSchemaType["advanced"][K],
	) => {
		setFilters({
			advanced: {
				[key]: value,
			} as Partial<MapFormSchemaType["advanced"]>,
		} as Partial<MapFormSchemaType>);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Advanced Filters</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Controller
						name="advanced.radius"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="radius" className="mb-2">
									Radius (miles)
								</Label>
								<Input
									id="radius"
									placeholder="e.g. 5"
									type="number"
									min={0}
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("radius", next || undefined);
									}}
									className="w-full"
									error={errors.advanced?.radius?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.pastDays"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="pastDays" className="mb-2">
									Listed in Past (days)
								</Label>
								<Input
									id="pastDays"
									placeholder="e.g. 30"
									type="number"
									min={0}
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("pastDays", next || undefined);
									}}
									className="w-full"
									error={errors.advanced?.pastDays?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.dateFrom"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="dateFrom" className="mb-2">
									Date Start
								</Label>
								<Input
									id="dateFrom"
									type="date"
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("dateFrom", next || undefined);
									}}
									className="w-full"
									error={errors.advanced?.dateFrom?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.dateTo"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="dateTo" className="mb-2">
									Date End
								</Label>
								<Input
									id="dateTo"
									type="date"
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("dateTo", next || undefined);
									}}
									className="w-full"
									error={errors.advanced?.dateTo?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.mlsOnly"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="mlsOnly"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("mlsOnly", checked);
									}}
								/>
								<Label htmlFor="mlsOnly">MLS Only</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.ownerOccupiedOnly"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="ownerOccupiedOnly"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("ownerOccupiedOnly", checked);
									}}
								/>
								<Label htmlFor="ownerOccupiedOnly">
									Flag owner-occupied homes
								</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.hasPool"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="hasPool"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("hasPool", checked);
									}}
								/>
								<Label htmlFor="hasPool">Must include pool</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.hasGarage"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="hasGarage"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("hasGarage", checked);
									}}
								/>
								<Label htmlFor="hasGarage">
									Require garage or covered parking
								</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.foreclosure"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="foreclosure"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("foreclosure", checked);
									}}
								/>
								<Label htmlFor="foreclosure">
									Include foreclosure candidates
								</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.extraPropertyData"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="extraPropertyData"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("extraPropertyData", checked);
									}}
								/>
								<Label htmlFor="extraPropertyData">
									Request extended property data
								</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.excludePending"
						control={control}
						render={({ field }) => (
							<div className="mt-2 flex flex-row items-center gap-2">
								<Switch
									id="excludePending"
									checked={!!field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
										updateAdvanced("excludePending", checked);
									}}
								/>
								<Label htmlFor="excludePending">
									Exclude pending transactions
								</Label>
							</div>
						)}
					/>
					<Controller
						name="advanced.proxy"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="proxy" className="mb-2">
									Custom Proxy (optional)
								</Label>
								<Input
									id="proxy"
									placeholder="https://user:pass@host:port"
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("proxy", next || undefined);
									}}
									error={errors.advanced?.proxy?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.limit"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="limit" className="mb-2">
									Result Limit
								</Label>
								<Input
									id="limit"
									placeholder="250"
									type="number"
									min={1}
									max={10000}
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("limit", next || undefined);
									}}
									error={errors.advanced?.limit?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.minEquityPercent"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="minEquity" className="mb-2">
									Minimum Equity % (Est.)
								</Label>
								<Input
									id="minEquity"
									placeholder="e.g. 25"
									type="number"
									min={0}
									max={100}
									step={1}
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("minEquityPercent", next ? next : undefined);
									}}
									error={errors.advanced?.minEquityPercent?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.lastSaleWithinYears"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="lastSaleYears" className="mb-2">
									Sold within (years)
								</Label>
								<Input
									id="lastSaleYears"
									placeholder="e.g. 10"
									type="number"
									min={0}
									max={30}
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced(
											"lastSaleWithinYears",
											next ? next : undefined,
										);
									}}
									error={
										errors.advanced?.lastSaleWithinYears?.message as string
									}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.minAssessedValue"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="minAssessed" className="mb-2">
									Min Assessed Value
								</Label>
								<Input
									id="minAssessed"
									placeholder="50000"
									type="number"
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("minAssessedValue", next ? next : undefined);
									}}
									error={errors.advanced?.minAssessedValue?.message as string}
								/>
							</div>
						)}
					/>
					<Controller
						name="advanced.maxAssessedValue"
						control={control}
						render={({ field }) => (
							<div className="flex flex-col">
								<Label htmlFor="maxAssessed" className="mb-2">
									Max Assessed Value
								</Label>
								<Input
									id="maxAssessed"
									placeholder="750000"
									type="number"
									value={field.value ?? ""}
									onChange={(event) => {
										const next = event.target.value;
										field.onChange(next);
										updateAdvanced("maxAssessedValue", next ? next : undefined);
									}}
									error={errors.advanced?.maxAssessedValue?.message as string}
								/>
							</div>
						)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AdvancedFiltersDialog;
